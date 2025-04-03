import sys
import json
import importlib.util
import os
import asyncio
import traceback
from logger import Logger
from rpc import RpcSender, serialize_for_json
from rpc_state_manager import RpcStateManager
from typing import Any, Optional
import functools

def parse_args(arg: str) -> Any:
    from types import SimpleNamespace
    
    try:
        return json.loads(arg, object_hook=lambda d: SimpleNamespace(**d))
    except json.JSONDecodeError:
        print('Error parsing args:', arg)
        return arg

class Context:
    def __init__(self, args: Any, rpc: RpcSender, is_api_handler: bool = False):
        self.trace_id = args.traceId
        self.traceId = args.traceId
        self.flows = args.flows
        self.rpc = rpc
        self.state = RpcStateManager(rpc)
        self.logger = Logger(self.trace_id, self.flows, rpc)
        try:
            self._loop = asyncio.get_running_loop()
        except RuntimeError:
            self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        self.is_api_handler = is_api_handler
        self._pending_tasks = []

    async def emit(self, event: Any):
        if self.is_api_handler:
            self.rpc.send_no_wait('emit', event)
            return None
        else:
            return await self.rpc.send('emit', event)
        
    # Add wrapper to handle non-awaited emit coroutine
    def __getattribute__(self, name):
        attr = super().__getattribute__(name)
        if name == 'emit' and asyncio.iscoroutinefunction(attr):
            @functools.wraps(attr)
            def wrapper(*args, **kwargs):
                coro = attr(*args, **kwargs)
                # Check if this is being awaited
                frame = sys._getframe(1)
                if frame.f_code.co_name != '__await__':
                    task = asyncio.create_task(coro)
                    def handle_exception(t):
                        if t.done() and not t.cancelled() and t.exception():
                            print(f"Unhandled exception in background task: {t.exception()}", file=sys.stderr)
                    task.add_done_callback(handle_exception)
                    return task
                return coro
            return wrapper
        return attr

async def run_python_module(file_path: str, rpc: RpcSender, args: Any) -> None:
    try:
        # Get the directory containing the module file
        module_dir = os.path.dirname(os.path.abspath(file_path))
        
        # Add module directory to Python path
        if module_dir not in sys.path:
            sys.path.insert(0, module_dir)
            
        # Get the flows directory (parent of steps)
        flows_dir = os.path.dirname(module_dir)
        if flows_dir not in sys.path:
            sys.path.insert(0, flows_dir)

        contextInFirstArg = args.contextInFirstArg

        # Load the module dynamically
        spec = importlib.util.spec_from_file_location("dynamic_module", file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load module from {file_path}")
            
        module = importlib.util.module_from_spec(spec)
        # Add module's directory as its __package__
        module.__package__ = os.path.basename(module_dir)
        spec.loader.exec_module(module)

        # Check if the handler function exists
        if not hasattr(module, 'handler'):
            raise AttributeError(f"Function 'handler' not found in module {file_path}")

        context = Context(args, rpc)

        # Check if this is an API handler
        is_api_handler = False
        if hasattr(module, 'config'):
            if isinstance(module.config, dict) and module.config.get('type') == 'api':
                is_api_handler = True
            elif hasattr(module.config, 'type') and module.config.type == 'api':
                is_api_handler = True

        # Create context with is_api_handler flag
        context = Context(args, rpc, is_api_handler)

        if contextInFirstArg:
            result = await module.handler(context)
        else:
            if hasattr(args.data, 'body'):
                args.data.body = serialize_for_json(args.data.body)
            result = await module.handler(args.data, context)

        # For API handlers, we want to return immediately without waiting for background tasks
        # This prevents the API from getting stuck
        if not is_api_handler:
            pending = asyncio.all_tasks() - {asyncio.current_task()}
            if pending:
                await asyncio.gather(*pending)

        if result:
            await rpc.send('result', result)

        # For non-API handlers, ensure all pending tasks are completed before closing
        if not is_api_handler:
            pending = asyncio.all_tasks() - {asyncio.current_task()}
            if pending:
                await asyncio.gather(*pending)

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
    tasks = asyncio.gather(rpc.init(), run_python_module(file_path, rpc, parse_args(arg)))
    loop.run_until_complete(tasks)
