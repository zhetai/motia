import { Logs } from '../components/logs'
import { useLogs } from '../stores/use-logs'
import { useEffect } from 'react'

export const LogsPage = () => {
  const { setUnreadLogsCount } = useLogs((state) => state)

  useEffect(() => {
    setUnreadLogsCount(0)
    return () => setUnreadLogsCount(0)
  }, [setUnreadLogsCount])

  return (
    <div className="w-screen h-screen p-4">
      <Logs />
    </div>
  )
}
