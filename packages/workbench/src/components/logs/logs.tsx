import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Log, useLogs } from '@/stores/use-logs'
import { useState } from 'react'
import { LogDetail } from './log-detail'
import { LogLevelDot } from './log-level-dot'
import { formatTimestamp } from '@/lib/utils'

export const Logs = () => {
  const logs = useLogs((state) => state.logs)
  const [selectedLog, setSelectedLog] = useState<Log>()

  const handleLogClick = (log: Log) => {
    setSelectedLog(log)
  }

  return (
    <div className="h-full flex flex-row">
      <div className="p-4 flex-1 overflow-y-auto overflow-x-auto">
        <Table>
          <TableBody className="font-mono">
            {logs.map((log, index) => (
              <TableRow key={index} className="cursor-pointer border-0" onClick={() => handleLogClick(log)}>
                <TableCell
                  data-testid={`time-${index}`}
                  className="whitespace-nowrap flex items-center gap-2 text-muted-foreground"
                >
                  <LogLevelDot level={log.level} />
                  {formatTimestamp(log.time)}
                </TableCell>
                <TableCell
                  data-testid={`trace-${log.traceId}`}
                  className="whitespace-nowrap cursor-pointer hover:text-primary text-muted-foreground font-mono"
                >
                  {log.traceId}
                </TableCell>
                <TableCell data-testid={`step-${index}`} aria-label={log.step} className="whitespace-nowrap font-mono">
                  {log.step}
                </TableCell>
                <TableCell
                  data-testid={`msg-${index}`}
                  aria-label={log.msg}
                  className="whitespace-nowrap font-mono max-w-[500px] truncate w-full"
                >
                  {log.msg}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LogDetail log={selectedLog} onClose={() => setSelectedLog(undefined)} />
    </div>
  )
}
