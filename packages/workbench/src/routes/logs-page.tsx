import { Logs } from '../components/logs/logs'
import { useLogs } from '../stores/use-logs'
import { useEffect } from 'react'

export const LogsPage = () => {
  const { setUnreadLogsCount } = useLogs((state) => state)

  useEffect(() => {
    setUnreadLogsCount(0)
    return () => setUnreadLogsCount(0)
  }, [setUnreadLogsCount])

  return (
    <div className="w-full h-screen overflow-hidden">
      <header className="p-4 pb-0 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">Logs</h1>
        <span className="text-sm text-zinc-400">Check all logs saved locally</span>
      </header>
      <Logs />
    </div>
  )
}
