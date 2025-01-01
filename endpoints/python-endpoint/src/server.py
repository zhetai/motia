# endpoints/python-endpoint/src/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import importlib.util
import sys
from typing import Dict, Any, Optional, List
import os
import asyncio
from datetime import datetime

class ComponentRequest(BaseModel):
    code: str
    name: str

class Event(BaseModel):
    type: str
    data: dict
    metadata: Optional[dict] = None

class EventResponse(BaseModel):
    status: str
    events: List[Event]

class PythonEndpoint:
    def __init__(self):
        self.components = {}
        self.app = FastAPI()
        self.setup_routes()

    def setup_routes(self):
        @self.app.get("/health")
        async def health_check():
            return {"status": "healthy"}

        @self.app.post("/register")
        async def register_component(request: ComponentRequest):
            try:
                await self.register_component(request.name, request.code)
                return {"status": "success"}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/execute/{component_id:path}")
        async def execute_component(component_id: str, event: dict):
            try:
                result = await self.execute_component(component_id, event)
                return result
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    async def register_component(self, name: str, code: str):
        """Register a new component or update an existing one."""
        try:
            print(f"[PythonEndpoint] Registering component: {name}")
            component_dir = "components"
            os.makedirs(component_dir, exist_ok=True)
            
            file_name = name.replace('/', '_')
            file_path = os.path.join(component_dir, f"{file_name}.py")
            
            with open(file_path, "w") as f:
                f.write(code)

            # Load the module
            spec = importlib.util.spec_from_file_location(name, file_path)
            if spec is None:
                raise ImportError(f"Could not load spec for {name}")
                
            module = importlib.util.module_from_spec(spec)
            sys.modules[name] = module
            
            if spec.loader is None:
                raise ImportError(f"Could not load module for {name}")
                
            spec.loader.exec_module(module)
            
            # Store component info
            self.components[name] = {
                "module": module,
                "file_path": file_path,
                "loaded_at": datetime.now().isoformat()
            }
            
            print(f"[PythonEndpoint] Component {name} registered successfully")
            
        except Exception as e:
            print(f"[PythonEndpoint] Failed to register component {name}: {str(e)}")
            raise

    async def execute_component(self, component_id: str, event: dict):
        """Execute a component and collect its emitted events."""
        if component_id not in self.components:
            raise ValueError(f"Component not found: {component_id}")
            
        component = self.components[component_id]
        emitted_events = []
        
        # Create emit callback
        async def emit(new_event):
            emitted_events.append({
                **new_event,
                "metadata": {
                    **(new_event.get("metadata", {})),
                    "componentId": component_id,
                    "timestamp": datetime.now().isoformat()
                }
            })

        # Execute handler
        try:
            # Only pass the data part of the event
            await component["module"].handler(event.get("data", {}), emit)
            return {
                "status": "success",
                "events": emitted_events
            }
        except Exception as e:
            print(f"[PythonEndpoint] Error executing component {component_id}: {str(e)}")
            raise

    async def restore_components(self):
        """Restore previously registered components on startup."""
        try:
            component_dir = "components"
            if not os.path.exists(component_dir):
                os.makedirs(component_dir)
                return

            restored_count = 0
            for file_name in os.listdir(component_dir):
                if file_name.endswith('.py'):
                    name = file_name[:-3].replace('_', '/')
                    file_path = os.path.join(component_dir, file_name)
                    
                    spec = importlib.util.spec_from_file_location(name, file_path)
                    if spec and spec.loader:
                        module = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(module)
                        
                        self.components[name] = {
                            "module": module,
                            "file_path": file_path,
                            "loaded_at": datetime.now().isoformat()
                        }
                        restored_count += 1
                    
            if restored_count > 0:
                print(f"[PythonEndpoint] Restored {restored_count} components")
                    
        except Exception as e:
            print(f"[PythonEndpoint] Error restoring components: {e}")

endpoint = PythonEndpoint()
app = endpoint.app

@app.on_event("startup")
async def startup_event():
    await endpoint.restore_components()