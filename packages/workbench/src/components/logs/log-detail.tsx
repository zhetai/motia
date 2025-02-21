import React from 'react'
import { Log } from '../../stores/use-logs'
import { LogLevelBadge } from './log-level-badge'
import { LogField } from './log-field'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet'

type Props = {
  log?: Log
  onClose: () => void
}

const defaultProps = ['msg', 'time', 'level', 'step', 'flows', 'traceId']

export const LogDetail: React.FC<Props> = ({ log, onClose }) => {
  const isOpen = !!log

  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const otherProps = Object.keys(log ?? {}).filter((key) => !defaultProps.includes(key))

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Logs details</SheetTitle>
          <SheetDescription>Log details and application.</SheetDescription>
        </SheetHeader>
        <div className="font-mono overflow-y-auto">
          {log && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <LogField label="Level" value={<LogLevelBadge level={log.level} />} className="flex-1" />
                <LogField label="Time" value={new Date(log.time).toLocaleString()} className="flex-1" />
              </div>

              <div className="flex flex-row gap-2">
                <LogField label="Step" value={log.step} className="flex-1" />
                <LogField label="Flows" value={log.flows.join(', ')} className="flex-1" />
              </div>

              <LogField label="Trace ID" value={log.traceId} />
              <LogField label="Message" value={log.msg} />

              {otherProps.map((key) => (
                <LogField key={key} label={key} value={log[key]} />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
