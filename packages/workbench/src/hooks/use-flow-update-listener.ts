import { useEffect } from 'react'
import { useSocket } from './use-socket'

export const useFlowUpdateListener = (flowName: string, handler: () => void): void => {
  const { socket } = useSocket()

  useEffect(() => {
    const handleFlowUpdate = (name: string) => {
      if (name === flowName) {
        handler()
      }
    }

    socket.on('flow-updated', handleFlowUpdate)

    return () => {
      socket.off('flow-updated', handleFlowUpdate)
    }
  }, [socket, handler, flowName])
}
