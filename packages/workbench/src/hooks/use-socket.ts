import { useState, useEffect, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'

type UseSocketReturn = {
  isConnected: boolean
  socket: Socket
}

export const useSocket = (): UseSocketReturn => {
  const socket = useMemo(() => io('/'), [])
  const [isConnected, setIsConnected] = useState(socket.connected)

  useEffect(() => {
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  return { isConnected, socket }
}
