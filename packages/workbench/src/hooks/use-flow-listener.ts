import { useEffect } from 'react'
import { useSocket } from './use-socket'

type OnFlowRemoved = (flowName: string) => void
type OnFlowAdded = (flowName: string) => void

type UseFlowListenerInput = {
  onFlowRemoved: OnFlowRemoved
  onFlowAdded: OnFlowAdded
}

export const useFlowListener = (args: UseFlowListenerInput): void => {
  const { socket } = useSocket()

  useEffect(() => {
    socket.on('flow-created', args.onFlowAdded)

    return () => {
      socket.off('flow-created', args.onFlowAdded)
    }
  }, [socket, args.onFlowAdded])

  useEffect(() => {
    socket.on('flow-removed', args.onFlowRemoved)

    return () => {
      socket.off('flow-removed', args.onFlowRemoved)
    }
  }, [socket, args.onFlowRemoved])
}
