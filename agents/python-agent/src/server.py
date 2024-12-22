from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import importlib.util
import sys
from typing import Dict, Any, Optional
import os
import asyncio

class ComponentRequest(BaseModel):
    code: str
    name: str

class EventRequest(BaseModel):
    type: str
    data: dict
    metadata: Optional[dict] = None

class PythonAgent:
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
        async def execute_component(component_id: str, event: EventRequest):
            try:
                result = await self.execute_component(component_id, event)
                return result
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    async def register_component(self, name: str, code: str):
        try:
            print(f"[PythonAgent] Registering component: {name}")
            component_dir = "components"
            os.makedirs(component_dir, exist_ok=True)
            
            file_name = name.replace('/', '_')
            file_path = os.path.join(component_dir, f"{file_name}.py")
            
            with open(file_path, "w") as f:
                f.write(code)

            spec = importlib.util.spec_from_file_location(name, file_path)
            if spec is None:
                raise ImportError(f"Could not load spec for {name}")
                
            module = importlib.util.module_from_spec(spec)
            sys.modules[name] = module
            if spec.loader is None:
                raise ImportError(f"Could not load module for {name}")
                
            spec.loader.exec_module(module)
            
            self.components[name] = {
                "module": module,
                "file_path": file_path
            }
            
            print(f"[PythonAgent] Component {name} registered successfully")
            
        except Exception as e:
            print(f"[PythonAgent] Failed to register component {name}: {str(e)}")
            raise

    async def execute_component(self, component_id: str, event: EventRequest):
        if component_id not in self.components:
            raise ValueError(f"Component not found: {component_id}")
            
        component = self.components[component_id]
        emitted_events = []
        
        async def emit(new_event):
            emitted_events.append({
                **new_event,
                "metadata": {"componentId": component_id}
            })

        await component["module"].handler(event.data, emit)
        return {"status": "success", "events": emitted_events}

    async def restore_components(self):
        try:
            component_dir = "components"
            if not os.path.exists(component_dir):
                os.makedirs(component_dir)
                return

            for file_name in os.listdir(component_dir):
                if file_name.endswith('.py'):
                    name = file_name[:-3].replace('_', '/')
                    file_path = os.path.join(component_dir, file_name)
                    
                    spec = importlib.util.spec_from_file_location(name, file_path)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    
                    self.components[name] = {
                        "module": module,
                        "file_path": file_path
                    }
                    
            print(f"[PythonAgent] Restored {len(self.components)} components")
                    
        except Exception as e:
            print(f"[PythonAgent] Error restoring components: {e}")

agent = PythonAgent()
app = agent.app

@app.on_event("startup")
async def startup_event():
    await agent.restore_components()