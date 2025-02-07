from typing import Any, Dict

config = {
    "type": "api",
    "name": "api-step", 
    "emits": ["TEST_EVENT"],
    "path": "/test",
    "method": "POST"
}


async def handler(_, ctx: Any) -> Dict:
    await ctx.emit({
        "data": {"test": "data"},
        "type": "TEST_EVENT"
    })
    
    return {
        "status": 200,
        "body": {"traceId": ctx.traceId}
    }
