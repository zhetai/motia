async def executor(args, emit):
    # Use the emit function to send data
    await emit({"status": "processing"})
    
    # Process args and return result
    return {"result": args}