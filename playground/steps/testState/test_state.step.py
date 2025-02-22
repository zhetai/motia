config = {
    "type": "event",
    "name": "Test State With Python",
    "subscribes": ["test-state"], 
    "emits": ["check-state-change"],
    "input": None,  # No schema validation in Python version
    "flows": ["test-state"]
}

async def handler(args, ctx):
    ctx.logger.info('[Test motia state with python] received test-state event', args)
    
    value = {"state": {"with": {"nested": {"value": 1}}}}
    ctx.state.set(ctx.trace_id, 'python_state', value)

    await ctx.emit({
        "topic": "check-state-change",
        "data": { "key": "python_state", "expected": value },
    })
