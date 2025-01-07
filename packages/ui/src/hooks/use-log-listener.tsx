import { useTriggerLogs } from '@/stores/triggerLogs'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

type UseWebSocketReturn = {
  isConnected: boolean
}

const socket = io('/')

export const useLogListener = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const addMessage = useTriggerLogs((state) => state.addMessage)

  useEffect(() => {
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    const onEvent = ({ event, time, file, traceId }: any) => {
      const message = `[${traceId}] ${file} received event with data: ${JSON.stringify(event.data)}`
      addMessage(traceId, time, message, event)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('event', onEvent)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('event', onEvent)
    }
  }, [addMessage])

  return { isConnected }
}
