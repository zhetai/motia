# agents/python-agent/src/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import redis.asyncio as redis
import json
import os
import asyncio
import importlib.util
import sys
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

class ComponentRequest(BaseModel):
    code: str
    name: str

class EventRequest(BaseModel):
    type: str
    data: dict
    metadata: Optional[dict] = None

class PythonAgent:
    def __init__(self):
        self.components: Dict[str, Any] = {}
        self.redis: Optional[redis.Redis] = None
        self.redis_subscriber: Optional[redis.Redis] = None
        self.app = FastAPI()
        self.setup_routes()

    def setup_routes(self):
        @self.app.get("/health")
        async def health_check():
            return {"status": "healthy"}

        @self.app.post("/register")
        async def register_component(request: ComponentRequest):
            try:
                print(f"Registering component: {request.name}")
                await self.register_component(request.name, request.code)
                return {"status": "success"}
            except Exception as e:
                print(f"Error registering component: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/execute/{component_id:path}")
        async def execute_component(component_id: str, event: EventRequest):
            try:
                print(f"Executing component: {component_id}, Event type: {event.type}")
                await self.execute_component(component_id, event)
                return {"status": "success"}
            except KeyError:
                raise HTTPException(status_code=404, detail=f"Component not found: {component_id}")
            except Exception as e:
                print(f"Error executing component: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

    async def initialize(self):
        # Initialize Redis connection
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = redis.from_url(redis_url)

    async def register_component(self, name: str, code: str):
        try:
            # Save component code to a temp file
            component_dir = "components"
            os.makedirs(component_dir, exist_ok=True)
            
            # Use the component name as the filename (sanitized)
            file_name = name.replace('/', '_')
            file_path = os.path.join(component_dir, f"{file_name}.py")
            
            with open(file_path, "w") as f:
                f.write(code)
            
            # Import the component
            spec = importlib.util.spec_from_file_location(name, file_path)
            if spec is None:
                raise ImportError(f"Could not load spec for {name}")
                
            module = importlib.util.module_from_spec(spec)
            sys.modules[name] = module
            if spec.loader is None:
                raise ImportError(f"Could not load module for {name}")
                
            spec.loader.exec_module(module)
            
            # Store the component with its handler
            if not hasattr(module, 'handler'):
                raise ValueError(f"Component {name} does not have a handler function")
                
            self.components[name] = {
                "module": module,
                "file_path": file_path,
                "subscribe": getattr(module, 'subscribe', []),
                "emits": getattr(module, 'emits', [])
            }
            
            print(f"Component {name} registered successfully")
            
        except Exception as e:
            print(f"Failed to register component {name}: {str(e)}")
            raise

    async def execute_component(self, component_id: str, event: EventRequest):
        print(f"[PythonAgent] Executing {component_id} for event: {event.type}")
        if component_id not in self.components:
            raise KeyError(f"Component not found: {component_id}")
            
        component = self.components[component_id]
        
        # Create emit function for this component
        async def emit(new_event):
            print(f"[PythonAgent] {component_id} emitting: {new_event['type']}")
            channel = f"motia:events:{new_event['type']}"
            print(f"Component {component_id} emitting: {new_event}")
            await self.redis.publish(channel, json.dumps(new_event))
        
        # Execute the component's handler
        try:
            await component["module"].handler(event.data, emit)
        except Exception as e:
            print(f"Error in component {component_id} handler: {str(e)}")
            raise

    async def handle_event(self, event):
        # Find components that subscribe to this event type
        for name, component in self.components.items():
            if event["type"] in component["subscribe"]:
                try:
                    await self.execute_component(
                        name, 
                        EventRequest(
                            type=event["type"],
                            data=event["data"],
                            metadata=event.get("metadata")
                        )
                    )
                except Exception as e:
                    print(f"Error executing component {name}: {str(e)}")

    async def cleanup(self):
        # Clean up component files
        for component in self.components.values():
            try:
                os.remove(component["file_path"])
            except Exception as e:
                print(f"Error removing component file: {str(e)}")
        
        # Close Redis connections
        if self.redis:
            await self.redis.close()
        if self.redis_subscriber:
            await self.redis_subscriber.close()
        
        self.components.clear()

# Create agent instance
agent = PythonAgent()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await agent.initialize()
    yield
    await agent.cleanup()

# Attach lifespan to FastAPI app
agent.app.router.lifespan_context = lifespan

# FastAPI will use this app instance
app = agent.app