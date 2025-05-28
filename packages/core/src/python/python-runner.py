import sys
import json
import importlib.util
import os
import asyncio
import traceback
from typing import Optional, Any, Callable, List, Dict

from rpc import RpcSender
from type_definitions import FlowConfig, ApiResponse
from context import Context
from validation import validate_with_jsonschema
from middleware import compose_middleware

def parse_args(arg: str) -> Dict:
    """Parse command line arguments into HandlerArgs"""
    try:
        return json.loads(arg)
    except json.JSONDecodeError:
        print('Error parsing args:', arg)
        return arg

async def validate_handler_input(
    module: Any,
    args: Dict,
    context: Context,
    is_api_handler: bool
) -> Optional[ApiResponse]:
    """Validate handler input based on module configuration"""
    if not hasattr(args, "contextInFirstArg") or hasattr(module, "config"):
        return None

    config: FlowConfig = module.config
    input_data = args.get("data")

    if is_api_handler and hasattr(input_data, "body") and hasattr(config, "bodySchema"):
        body = input_data.get("body", {})
        body_schema = config.get("bodySchema", {})
        validation_result = validate_with_jsonschema(body, body_schema)

        if not validation_result["success"]:
            return ApiResponse(
                status=400,
                body={"message": f'Input validation error: {validation_result["error"]}'}
            )
        input_data.body = validation_result['data']
    
    elif not is_api_handler and config.input is not None:
        validation_result = validate_with_jsonschema(input_data, config.get("input", {}))

        if not validation_result["success"]:
            context.logger.info(f'Input Validation Error: {validation_result["error"]}', validation_result['details'])
            return None
        
        input_data = validation_result["data"]

    return None

async def run_python_module(file_path: str, rpc: RpcSender, args: Dict) -> None:
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

        if not hasattr(module, "handler"):
            raise AttributeError(f"Function 'handler' not found in module {file_path}")

        config = module.config
        is_api_handler = (config and config.get("type") == "api")

        trace_id = args.get("traceId")
        flows = args.get("flows") or []
        data = args.get("data")
        context_in_first_arg = args.get("contextInFirstArg")
        context = Context(trace_id, flows, rpc)

        validation_result = await validate_handler_input(module, args, context, is_api_handler)
        if validation_result:
            await rpc.send('result', validation_result)
            return

    
        middlewares: List[Callable] = config.get("middleware", [])
        composed_middleware = compose_middleware(*middlewares)
        
        async def handler_fn():
            if context_in_first_arg:
                return await module.handler(context)
            else:
                return await module.handler(data, context)

        result = await composed_middleware(data, context, handler_fn)

        if not is_api_handler:
            pending = asyncio.all_tasks() - {asyncio.current_task()}
            if pending:
                await asyncio.gather(*pending)

        if result:
            await rpc.send('result', result)

        rpc.send_no_wait("close", None)
        rpc.close()
        
    except Exception as error:
        print(f'Error running Python module: {error}', file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pythonRunner.py <file-path> <arg>", file=sys.stderr)
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
