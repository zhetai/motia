config = {
    "name": "Call OpenAI",
    "subscribes": ["call-openai"], 
    "emits": ["openai-response"],
    "input": None  # No schema validation in Python version
}

async def executor(args, emit):
    print('[Call Python OpenAI] Received call_ai event', args);

    await emit({
        "type": "openai-response",
        "data": { "message": args.message },
    });
