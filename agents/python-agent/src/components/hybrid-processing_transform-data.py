metadata = {"runtime": "python", "agent": "python-agent"}

subscribe = ["hybrid.validated"]
emits = ["hybrid.transformed"]

async def handler(input, emit):
    items = input["items"]
    # Transform each item
    transformed = [{
        **item,
        "value": item["value"] * 2 if "value" in item else None,
        "transformed_by": "python"
    } for item in items]
    
    await emit({
        "type": "hybrid.transformed",
        "data": {
            "items": transformed,
            "timestamp": input["timestamp"]
        }
    })