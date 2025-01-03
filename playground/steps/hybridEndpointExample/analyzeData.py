config = {
    "name:": "Analyze Data",
    "subscribes": ["hybrid.enriched"],
    "emits": ["hybrid.analyzed"],
    "input": None  # No schema validation in Python version
}

# Add a static counter at module level
instance_id = id(object())  # or random, e.g., random.randint(1, 10000)
invocation_count = 0

async def executor(input, emit):
    global invocation_count
    invocation_count += 1

    print(f"[Python:transform-data] instance_id={instance_id}, "
        f"invocation_count={invocation_count} | "
        f"Received input={input}")

    items = input["items"]
    
    # Calculate some statistics
    total = sum(item["value"] for item in items if "value" in item)
    average = total / len(items) if items else 0
    
    analysis = {
        "total": total,
        "average": average,
        "count": len(items),
        "analyzed_by": "python"
    }
    
    await emit({
        "type": "hybrid.analyzed",
        "data": {
            "items": items,
            "analysis": analysis,
            "timestamp": input["timestamp"]
        }
    })