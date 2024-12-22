metadata = {"runtime": "python", "agent": "python-agent"}

subscribe = ["hybrid.enriched"]
emits = ["hybrid.analyzed"]

async def handler(input, emit):
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