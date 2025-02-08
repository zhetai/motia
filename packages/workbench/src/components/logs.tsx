import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Log, useLogs } from '@/stores/use-logs'
import { LogLevelBadge } from './log-level-badge'
import { useState } from 'react'
import { LogDetail } from './log-detail'

const timestamp = (time: number) => {
  const date = new Date(Number(time))
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

export const Logs = () => {
  const logs = useLogs((state) => state.logs)
  const [selectedLog, setSelectedLog] = useState<Log>()

  const handleLogClick = (log: Log) => {
    setSelectedLog(log)
  }

  return (
    <div className="overflow-y-auto h-full text-bold">
      <LogDetail log={selectedLog} onClose={() => setSelectedLog(undefined)} />
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-800 border-b border-zinc-700 [&>th]:font-bold">
            <TableHead>Time</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Trace</TableHead>
            <TableHead>Flow</TableHead>
            <TableHead>Step</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-md font-mono">
          {logs.map((log, index) => (
            <TableRow key={index} className="border-b border-zinc-800/50" onClick={() => handleLogClick(log)}>
              <TableCell>{timestamp(log.time)}</TableCell>
              <TableCell>
                <LogLevelBadge level={log.level} />
              </TableCell>
              <TableCell>{log.traceId.split('-').pop()}</TableCell>
              <TableCell>{log.flows?.join?.(', ')}</TableCell>
              <TableCell>{log.step}</TableCell>
              <TableCell>{log.msg}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
