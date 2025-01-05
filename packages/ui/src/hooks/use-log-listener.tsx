import { useTriggerLogs } from '@/stores/triggerLogs'
import { useState, useEffect, useCallback } from 'react'

type UseWebSocketReturn = {
  closeConnection: () => void
  isConnected: boolean
}

export const useLogListener = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const addMessage = useTriggerLogs((state) => state.addMessage)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws')

    ws.onopen = () => {
      setIsConnected(true)
      console.log('WebSocket connection established')
    }

    ws.onmessage = (event) => {
      try {
        console.log('event.data', event.data)
        const { id, payload } = JSON.parse(event.data)

        const parsedPayload = JSON.parse(payload)

        if (parsedPayload?.type !== 'log' || !parsedPayload?.message || !id) {
          console.log('Invalid message', parsedPayload)
          return
        }

        console.log('adding message', parsedPayload)

        addMessage(id, parsedPayload.message)
      } catch (error) {
        console.error('Error parsing message', error)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onerror = (event) => {
      console.error('WebSocket error', event)
    }

    setSocket(ws)

    // Cleanup on unmount
    return () => {
      ws.close()
    }
  }, [])

  const closeConnection = useCallback(() => {
    socket?.close()
  }, [socket])

  return { closeConnection, isConnected }
}
