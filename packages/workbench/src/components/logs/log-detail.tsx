import { formatTimestamp } from '@/lib/utils'
import { SidePanel, SidePanelDetail, SidePanelDetailItem } from '@motiadev/ui'
import React, { useMemo, useState } from 'react'
import ReactJson from 'react18-json-view'
import 'react18-json-view/src/dark.css'
import 'react18-json-view/src/style.css'
import { Log } from '../../stores/use-logs'
import { LogLevelDot } from './log-level-dot'

type Props = {
  log?: Log
  onClose: () => void
}

const defaultProps = ['id', 'msg', 'time', 'level', 'step', 'flows', 'traceId']

export const LogDetail: React.FC<Props> = ({ log, onClose }) => {
  if (!log) {
    return null
  }

  const [hasOtherProps, setHasOtherProps] = useState(false)

  const otherPropsObject = useMemo(() => {
    const otherProps = Object.keys(log ?? {}).filter((key) => !defaultProps.includes(key))
    setHasOtherProps(otherProps.length > 0)

    return otherProps.reduce(
      (acc, key) => {
        acc[key] = log[key]
        return acc
      },
      {} as Record<string, any>,
    )
  }, [log])

  return (
    <SidePanel
      className="flex flex-col h-full"
      title="Logs Details"
      subtitle="Details including custom properties"
      onClose={onClose}
    >
      <SidePanelDetail>
        <SidePanelDetailItem title="Level">
          <div className="flex items-center gap-2">
            <LogLevelDot level={log.level} />
            <div className="capitalize">{log.level}</div>
          </div>
        </SidePanelDetailItem>
        <SidePanelDetailItem title="Time">{formatTimestamp(log.time)}</SidePanelDetailItem>
        <SidePanelDetailItem title="Step">{log.step}</SidePanelDetailItem>
        <SidePanelDetailItem title="Flows">{log.flows.join(', ')}</SidePanelDetailItem>
        <SidePanelDetailItem title="Trace ID">{log.traceId}</SidePanelDetailItem>
        <SidePanelDetailItem title="Message">{log.msg}</SidePanelDetailItem>
      </SidePanelDetail>

      {hasOtherProps && <ReactJson src={otherPropsObject} theme="default" enableClipboard={false} />}
    </SidePanel>
  )
}
