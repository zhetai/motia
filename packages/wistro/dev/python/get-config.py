import sys
import json
import importlib.util
import os
from typing import Any, Callable

# get the FD from ENV
NODEIPCFD = int(os.environ["NODE_CHANNEL_FD"])

def sendMessage(text):
  'sends a Node IPC message to parent proccess'
  # encode message as json string + newline in bytes
  bytesMessage = (json.dumps(text) + "\n").encode('utf-8')
  # send message
  os.write(NODEIPCFD, bytesMessage)

async def run_python_module(file_path: str) -> None:
    try:
        # Load the module dynamically
        spec = importlib.util.spec_from_file_location("dynamic_module", file_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load module from {file_path}")
            
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Print the config if it exists
        if hasattr(module, 'config'):
            sendMessage(module.config)

    except Exception as error:
        print('Error running Python module:', str(error), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)

    file_path = sys.argv[1]

    import asyncio
    asyncio.run(run_python_module(file_path))