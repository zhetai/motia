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
import time

class ComponentRequest(BaseModel):
    code: str
    name: str

class EventRequest(BaseModel):
    type: str
    data: dict
    metadata: Optional[dict] = None

COMPONENTS_REGISTRY = {}  # Class variable to persist across reloads

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
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        print(f"[PythonAgent] Connecting to Redis at {redis_url}")
        
        # Connect both clients
        self.redis = redis.from_url(redis_url)
        self.redis_subscriber = redis.from_url(redis_url)
        
        print("[PythonAgent] Redis connections established")
        
        # Create pubsub and subscribe to both channels
        self.pubsub = self.redis_subscriber.pubsub()
        
        # Subscribe to main event channel and control channel
        await self.pubsub.psubscribe("motia:events:*")
        await self.pubsub.subscribe("motia:control")
        
        print("[PythonAgent] Subscribed to channels")
        
        # Publish a test message
        await self.redis.publish("motia:control", json.dumps({
            "type": "python.ready",
            "data": {"time": time.time()}
        }))
    
        self.listener_task = asyncio.create_task(self.message_loop())
        print("[PythonAgent] Message loop started")

        print("[PythonAgent] Restoring components from registry")
        self.components = PythonAgent.COMPONENTS_REGISTRY.copy()
        print(f"[PythonAgent] Restored {len(self.components)} components")
        for name, comp in self.components.items():
        print(f"[PythonAgent] - {name} (subscribes to: {comp['subscribe']})")

    async def message_loop(self):
        print("[PythonAgent] Message loop running")
        try:
            async for message in self.pubsub.listen():
                print(f"[PythonAgent] Message received: {message}")
                if message["type"] == "pmessage":
                    data = message["data"]
                    if isinstance(data, bytes):
                        data = data.decode('utf-8')
                        
                    try:
                        event = json.loads(data)
                        print(f"[PythonAgent] Processed event: {event}")
                        
                        if not event.get("metadata", {}).get("fromAgent"):
                            print(f"[PythonAgent] Processing event type: {event['type']}")
                            await self.handle_event(event)
                        else:
                            print(f"[PythonAgent] Skipping agent event: {event['type']}")
                    except json.JSONDecodeError as e:
                        print(f"[PythonAgent] Failed to parse JSON: {e}")
                    except Exception as e:
                        print(f"[PythonAgent] Error processing message: {e}")
        except Exception as e:
            print(f"[PythonAgent] Message loop error: {e}")
            # Restart the loop
            self.listener_task = asyncio.create_task(self.message_loop())

    async def listen_for_events(self, pubsub):
        print("[PythonAgent] Event listener started")
        try:
            while True:  # Add explicit loop
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message is not None:
                    print(f"[PythonAgent] Raw message received: {message}")
                    if message["type"] == "pmessage":
                        try:
                            event = json.loads(message["data"])
                            print(f"[PythonAgent] Parsed event: {event}")
                            if not event.get("metadata", {}).get("fromAgent"):
                                print(f"[PythonAgent] Processing event: {event['type']}")
                                await self.handle_event(event)
                            else:
                                print(f"[PythonAgent] Skipping agent event: {event['type']}")
                        except json.JSONDecodeError as e:
                            print(f"[PythonAgent] JSON decode error: {str(e)}")
                await asyncio.sleep(0.01)  # Prevent tight loop
        except Exception as e:
            print(f"[PythonAgent] Listener error: {str(e)}")
            print("[PythonAgent] Attempting to restart listener")
            asyncio.create_task(self.listen_for_events(pubsub))

    async def register_component(self, name: str, code: str):
        try:
            print(f"[PythonAgent] Registering component: {name}")
            component_dir = "components"
            os.makedirs(component_dir, exist_ok=True)
            
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
            
            # Store in both instance and class registry
            component_info = {
                "module": module,
                "file_path": file_path,
                "subscribe": getattr(module, 'subscribe', []),
                "emits": getattr(module, 'emits', [])
            }
            self.components[name] = component_info
            PythonAgent.COMPONENTS_REGISTRY[name] = component_info
                
            print(f"[PythonAgent] Component {name} registered successfully")
            print(f"[PythonAgent] Subscriptions: {component_info['subscribe']}")
            
        except Exception as e:
            print(f"[PythonAgent] Failed to register component {name}: {str(e)}")
            raise

    async def execute_component(self, component_id: str, event: EventRequest):
        print(f"[PythonAgent] Executing {component_id} for event: {event.type}")
        if component_id not in self.components:
            print(f"[PythonAgent] Available components: {list(self.components.keys())}")
            raise KeyError(f"Component not found: {component_id}")
            
        component = self.components[component_id]
        
        # Create emit function for this component with proper metadata handling
        async def emit(new_event):
            print(f"[PythonAgent] {component_id} emitting: {new_event['type']}")
            channel = f"motia:events:{new_event['type']}"
            
            # Enrich the event with metadata
            enriched_event = {
                **new_event,
                'metadata': {
                    **(event.metadata or {}),  # Preserve existing metadata
                    'fromAgent': True,
                    'componentId': component_id,
                    'eventId': f"{new_event['type']}-{int(time.time()*1000)}-{str(uuid.uuid4())}",
                }
            }
            
            print(f"Component {component_id} emitting: {enriched_event}")
            await self.redis.publish(channel, json.dumps(enriched_event))
            print(f"[PythonAgent] Published {new_event['type']} to Redis")
        try:
            await component["module"].handler(event.data, emit)
            print(f"[PythonAgent] Completed execution {component_id}")
        except Exception as e:
            print(f"Error in component {component_id} handler: {str(e)}")
            raise

    async def handle_event(self, event):
        print(f"[PythonAgent] Looking for components that handle: {event['type']}")
        # Find components that subscribe to this event type
        for name, component in self.components.items():
            if event["type"] in component["subscribe"]:
                print(f"[PythonAgent] Found component {name} subscribing to {event['type']}")
                try:
                    await self.execute_component(
                        name, 
                        EventRequest(
                            type=event["type"],
                            data=event["data"],
                            metadata=event.get("metadata", {})
                        )
                    )
                except Exception as e:
                    print(f"[PythonAgent] Error executing component {name}: {str(e)}")
            else:
                print(f"[PythonAgent] Component {name} does not subscribe to {event['type']}")

    async def cleanup(self):
        if hasattr(self, 'listener_task'):
            self.listener_task.cancel()
        
        if hasattr(self, 'pubsub'):
            await self.pubsub.punsubscribe()
            await self.pubsub.close()
        
        if hasattr(self, 'redis'):
            await self.redis.close()
        
        if hasattr(self, 'redis_subscriber'):
            await self.redis_subscriber.close()

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