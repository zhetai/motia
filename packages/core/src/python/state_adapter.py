from typing import TypeVar, Dict, Any, Optional, Protocol, Callable, Generic
import requests
from dataclasses import dataclass
import logging

T = TypeVar('T')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InternalStateManager(Protocol):
    def get(self, trace_id: str, key: str) -> Optional[T]:
        ...

    def set(self, trace_id: str, key: str, value: Any) -> None:
        ...

    def delete(self, trace_id: str, key: str) -> None:
        ...

@dataclass
class StateManagerConfig:
    state_manager_url: str

class StateManagerError(Exception):
    pass

def get_state_manager_handler(
    state_manager_url: str, 
    action: str, 
    payload: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Handler for state manager HTTP requests.
    """
    try:
        headers = {
            'Content-Type': 'application/json',
            'x-trace-id': payload['traceId'],
            # TODO: Add authentication token
        }
        
        logger.debug(f"Sending {action} request to {state_manager_url} with payload: {payload}")
        
        response = requests.post(
            f"{state_manager_url}/{action}",
            json=payload,
            headers=headers,
            timeout=10  # Add a timeout for requests
        )

        if not response.ok:
            logger.error(
                f"StateManager request failed with status {response.status_code}: {response.text}"
            )
            raise StateManagerError(
                f"Request failed: {response.status_code} - {response.reason}"
            )

        if action == 'get':
            result = response.json()
            return result.get('data')

    except requests.RequestException as req_err:
        logger.exception("HTTP request failed")
        raise StateManagerError("Failed to perform HTTP request") from req_err
    except Exception as error:
        logger.exception("Unexpected error in state manager handler")
        raise StateManagerError("Unexpected error in state manager handler") from error

class InternalStateManagerImpl(Generic[T]):
    def __init__(self, config: StateManagerConfig):
        self.handler: Callable = lambda action, payload: get_state_manager_handler(
            config.state_manager_url, 
            action, 
            payload
        )

    def get(self, trace_id: str, key: str) -> Optional[T]:
        result = self.handler('get', {'traceId': trace_id, 'key': key})
        return result

    def set(self, trace_id: str, key: str, value: Any) -> None:
        self.handler('set', {'traceId': trace_id, 'key': key, 'value': value})

    def delete(self, trace_id: str, key: str) -> None:
        self.handler('delete', {'traceId': trace_id, 'key': key})

    def clear(self, trace_id: str) -> None:
        self.handler('clear', {'traceId': trace_id})

def create_internal_state_manager(config: StateManagerConfig) -> InternalStateManager:
    """
    Creates an instance of the internal state manager.
    """
    return InternalStateManagerImpl(config)
