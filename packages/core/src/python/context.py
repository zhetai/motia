import asyncio
import sys
from typing import Any, List, Optional
from functools import wraps
from type_definitions import HandlerResult
from rpc import RpcSender
from rpc_state_manager import RpcStateManager
from logger import Logger

class Context:
    def __init__(
        self,
        trace_id: str,
        flows: List[str],
        rpc: RpcSender,
        is_api_handler: bool = False
    ):
        self.trace_id = trace_id
        self.flows = flows
        self.rpc = rpc
        self.state = RpcStateManager(rpc)
        self.logger = Logger(self.trace_id, self.flows, rpc)
        self.is_api_handler = is_api_handler
        
        try:
            self._loop = asyncio.get_running_loop()
        except RuntimeError:
            self._loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self._loop)

    async def emit(self, event: Any) -> Optional[HandlerResult]:
        """Emit an event and optionally wait for response"""
        if self.is_api_handler:
            self.rpc.send_no_wait('emit', event)
            return None
        return await self.rpc.send('emit', event)

    def __getattribute__(self, name: str) -> Any:
        attr = super().__getattribute__(name)
        if name == 'emit' and asyncio.iscoroutinefunction(attr):
            @wraps(attr)
            def wrapper(*args: Any, **kwargs: Any) -> Any:
                coro = attr(*args, **kwargs)
                frame = sys._getframe(1)
                if frame.f_code.co_name != '__await__':
                    task = asyncio.create_task(coro)
                    def handle_exception(t: asyncio.Task) -> None:
                        if t.done() and not t.cancelled() and t.exception():
                            print(f"Unhandled exception in background task: {t.exception()}", 
                                  file=sys.stderr)
                    task.add_done_callback(handle_exception)
                    return task
                return coro
            return wrapper
        return attr 