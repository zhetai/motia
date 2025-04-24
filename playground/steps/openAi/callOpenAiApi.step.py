from my_module import greet, farewell

config = {
    "type": "api",
    "name": "Call OpenAI",
    "description": "Call OpenAI", 
    "path": "/openai-python",
    "method": "POST",
    "emits": ["call-openai"],
    "flows": ["openai"]
}

async def handler(req, context):
    context.logger.info("[Call OpenAI] Received callOpenAi event", {
        "body": req.get("body").get("message")
    })

    await context.emit({
        "topic": "call-openai",
        "data": {"message": req.get("body").get("message")}
    })

    greet("Alice")
    farewell("Alice")

    return {
        "status": 200,
        "body": {"message": "OpenAI response sent"}
    }
