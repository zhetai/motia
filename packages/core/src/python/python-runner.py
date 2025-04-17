import sys
import json
import importlib.util
import os
import asyncio
import traceback
from typing import Optional, Any, Callable, List
from types import SimpleNamespace

from rpc import RpcSender, serialize_for_json
from type_definitions import HandlerArgs, FlowConfig, ApiResponse
from context import Context
from validation import validate_with_jsonschema
from middleware import compose_middleware

def parse_args(arg: str) -> HandlerArgs:
    """Parse command line arguments into HandlerArgs"""
    try:
        return json.loads(arg, object_hook=lambda d: SimpleNamespace(**d))
    except json.JSONDecodeError:
        print('Error parsing args:', arg)
        return arg

async def validate_handler_input(
    module: Any,
    args: HandlerArgs,
    context: Context
) -> Optional[ApiResponse]:
    """Validate handler input based on module configuration"""
    if not hasattr(args, 'contextInFirstArg') or hasattr(module, 'config'):
        return None

    config: FlowConfig = module.config
    input_data = args.data

    if context.is_api_handler and hasattr(input_data, 'body') and hasattr(config, 'bodySchema'):
        validation_result = validate_with_jsonschema(input_data.body, config.bodySchema)
        if not validation_result['success']:
            return ApiResponse(
                status=400,
                body={'message': f'Input validation error: {validation_result["error"]}'}
            )
        input_data.body = validation_result['data']
    
    elif not context.is_api_handler and config.input is not None:
        validation_result = validate_with_jsonschema(input_data, config.input)
        if not validation_result['success']:
            context.logger.info(f'Input Validation Error: {validation_result["error"]}', validation_result['details'])
            return None
        
        input_data = validation_result['data']

    return None

async def run_python_module(file_path: str, rpc: RpcSender, args: HandlerArgs) -> None:
    """Execute a Python module with the given arguments"""
    try:
        module_dir = os.path.dirname(os.path.abspath(file_path))
        flows_dir = os.path.dirname(module_dir)
        
        for path in [module_dir, flows_dir]:
            if path not in sys.path:
                sys.path.insert(0, path)

        spec = importlib.util.spec_from_file_location("dynamic_module", file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load module from {file_path}")
            
        module = importlib.util.module_from_spec(spec)
        module.__package__ = os.path.basename(module_dir)
        spec.loader.exec_module(module)

        if not hasattr(module, 'handler'):
            raise AttributeError(f"Function 'handler' not found in module {file_path}")

        config = getattr(module, 'config', {})
        is_api_handler = (
            module.config and
            config.get('type') == 'api'
        )

        context = Context(args.traceId, args.flows, rpc, is_api_handler)

        validation_result = await validate_handler_input(module, args, context)
        if validation_result:
            await rpc.send('result', validation_result)
            return

    
        middlewares: List[Callable] = config.get('middleware', [])
        composed_middleware = compose_middleware(*middlewares)
        
        async def handler_fn():
            if args.contextInFirstArg:
                return await module.handler(context)
            else:
                if hasattr(args.data, 'body'):
                    args.data.body = serialize_for_json(args.data.body)
                return await module.handler(args.data, context)

        result = await composed_middleware(args.data, context, handler_fn)

        if not is_api_handler:
            pending = asyncio.all_tasks() - {asyncio.current_task()}
            if pending:
                await asyncio.gather(*pending)

        if result:
            await rpc.send('result', result)

        rpc.close()
        rpc.send_no_wait('close', None)
        
    except Exception as error:
        print(f'Error running Python module: {error}', file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python pythonRunner.py <file-path> <arg>', file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    arg = sys.argv[2] if len(sys.argv) > 2 else None

    rpc = RpcSender()
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    args = parse_args(arg) if arg else None
    tasks = asyncio.gather(rpc.init(), run_python_module(file_path, rpc, args))
    loop.run_until_complete(tasks)
