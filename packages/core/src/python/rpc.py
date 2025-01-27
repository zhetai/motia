import uuid
import asyncio
import os
import json
import sys
from typing import Any, Dict, Tuple

# get the FD from ENV
NODEIPCFD = int(os.environ["NODE_CHANNEL_FD"])

class RpcSender:
    def __init__(self):
        self.executing = True
        self.pending_requests: Dict[str, Tuple[asyncio.Future, str, Any]] = {}

    def send_no_wait(self, method: str, args: Any) -> None:
        request = {
            'type': 'rpc_request',
            'method': method,
            'args': args
        }
        # encode message as json string + newline in bytes
        bytesMessage = (json.dumps(request) + "\n").encode('utf-8')
        # send message
        os.write(NODEIPCFD, bytesMessage)

    async def send(self, method: str, args: Any) -> asyncio.Future[Any]:
        future = asyncio.Future()
        request_id = str(uuid.uuid4())
        self.pending_requests[request_id] = future

        request = {
            'type': 'rpc_request',
            'id': request_id,
            'method': method,
            'args': args
        }
        # encode message as json string + newline in bytes
        bytesMessage = (json.dumps(request) + "\n").encode('utf-8')
        # send message
        os.write(NODEIPCFD, bytesMessage)

        return await future

    async def init(self):
        def on_message(msg: Dict[str, Any]):
            if msg.get('type') == 'rpc_response':
                request_id = msg['id']

                if request_id in self.pending_requests:
                    future = self.pending_requests[request_id]
                    del self.pending_requests[request_id]
                    
                    if msg.get('error'):
                        future.set_exception(msg['error'])
                    elif msg.get('result'):
                        future.set_result(msg['result'])
                    else:
                        # It's a void response
                        future.set_result(None)
            
        # Read messages from Node IPC file descriptor
        while self.executing:
            # Use asyncio to read from fd without blocking
            try:
                message = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: os.read(NODEIPCFD, 4096).decode('utf-8')
                )
                if not message:
                    await asyncio.sleep(0.01)  # Add small delay to prevent busy-waiting
                    continue
                    
                # Parse messages (may be multiple due to buffering)
                for line in message.splitlines():
                    if line:
                        try:
                            msg = json.loads(line)
                            on_message(msg)
                        except json.JSONDecodeError:
                            pass
            except Exception as e:
                print(f"Error reading from IPC: {e}", file=sys.stderr)
                await asyncio.sleep(0.01)

    def close(self) -> None:
        self.executing = False
        outstanding_requests = list(self.pending_requests.values())
        
        if len(outstanding_requests) > 0:
            print("Process ended while there are some promises outstanding", file=sys.stderr)
            sys.exit(1)
