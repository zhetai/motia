import React from 'react'
import { Log } from '../stores/use-logs'
import { LogLevelBadge } from './log-level-badge'
import { LogField } from './logs/LogField'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet'

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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Logs details</SheetTitle>
          <SheetDescription>Log details and application.</SheetDescription>
        </SheetHeader>
        <div className="font-mono">
          {log && (
            <div className="mt-6 flex flex-col gap-6 ">
              <div className="flex flex-row gap-4">
                <span className="bg-gray-900 text-white p-4 rounded-lg flex items-center justify-center">
                  <LogLevelBadge level={log.level} className="text-xl" />
                </span>

                <LogField label="Time" value={new Date(log.time).toLocaleTimeString()} className="flex-1" />
              </div>

              <div className="flex flex-row gap-4">
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
