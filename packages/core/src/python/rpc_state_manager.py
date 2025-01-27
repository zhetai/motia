from typing import Any
import asyncio
from rpc import RpcSender

class RpcStateManager:
    def __init__(self, rpc: RpcSender):
        self.rpc = rpc

    async def get(self, trace_id: str, key: str) -> asyncio.Future[Any]:
        return await self.rpc.send('state.get', {'traceId': trace_id, 'key': key})

    async def set(self, trace_id: str, key: str, value: Any) -> asyncio.Future[None]:
        return await self.rpc.send('state.set', {'traceId': trace_id, 'key': key, 'value': value})

    async def delete(self, trace_id: str, key: str) -> asyncio.Future[None]:
        return await self.rpc.send('state.delete', {'traceId': trace_id, 'key': key})

    async def clear(self, trace_id: str) -> asyncio.Future[None]:
        return await self.rpc.send('state.clear', {'traceId': trace_id})
