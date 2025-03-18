from typing import Any
import asyncio
from rpc import RpcSender
import functools
import sys

class RpcStateManager:
    def __init__(self, rpc: RpcSender):
        self.rpc = rpc
        self._loop = asyncio.get_event_loop()

    async def get(self, trace_id: str, key: str) -> asyncio.Future[Any]:
        return await self.rpc.send('state.get', {'traceId': trace_id, 'key': key})

    async def set(self, trace_id: str, key: str, value: Any) -> asyncio.Future[None]:
        future = await self.rpc.send('state.set', {'traceId': trace_id, 'key': key, 'value': value})
        return future

    async def delete(self, trace_id: str, key: str) -> asyncio.Future[None]:
        return await self.rpc.send('state.delete', {'traceId': trace_id, 'key': key})

    async def clear(self, trace_id: str) -> asyncio.Future[None]:
        return await self.rpc.send('state.clear', {'traceId': trace_id})

    # Add wrappers to handle non-awaited coroutines
    def __getattribute__(self, name):
        attr = super().__getattribute__(name)
        if name in ('get', 'set', 'delete', 'clear') and asyncio.iscoroutinefunction(attr):
            @functools.wraps(attr)
            def wrapper(*args, **kwargs):
                coro = attr(*args, **kwargs)
                # Check if this is being awaited
                frame = sys._getframe(1)
                if frame.f_code.co_name != '__await__':
                    # Not being awaited, schedule in background
                    task = asyncio.create_task(coro)
                    # Optional: Add error handling for the background task
                    task.add_done_callback(lambda t: t.exception() if t.done() and not t.cancelled() else None)
                    return task
                # Being awaited, return coroutine as normal
                return coro
            return wrapper
        return attr
