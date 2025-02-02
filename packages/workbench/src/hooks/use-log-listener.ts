import { useEffect } from 'react'
import { Log, useLogs } from '@/stores/use-logs'
import { useSocket } from './use-socket'

export const useLogListener = () => {
  const { socket } = useSocket()
  const addLog = useLogs((state) => state.addLog)

  useEffect(() => {
    const onLog = (log: Log) => addLog(log)

    socket.on('log', onLog)

    return () => {
      socket.off('log', onLog)
    }
  }, [socket, addLog])
}
