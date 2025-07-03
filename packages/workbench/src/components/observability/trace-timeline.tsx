import { Trace, TraceGroup } from '@/types/observability'
import { useStreamGroup, useStreamItem } from '@motiadev/stream-client-react'
import { Button } from '@motiadev/ui'
import { Minus, Plus } from 'lucide-react'
import React, { memo, useMemo, useState } from 'react'
import { useGetEndTime } from './hooks/use-get-endtime'
import { TraceItem } from './trace-item/trace-item'
import { TraceItemDetail } from './trace-item/trace-item-detail'

type Props = {
  groupId: string
}

export const TraceTimeline: React.FC<Props> = memo(({ groupId }) => {
  const { data: group } = useStreamItem<TraceGroup>({
    streamName: 'motia-trace-group',
    groupId: 'default',
    id: groupId,
  })
  const { data } = useStreamGroup<Trace>({ streamName: 'motia-trace', groupId })
  const endTime = useGetEndTime(group)
  const [zoom, setZoom] = useState(1)
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null)

  const selectedTrace = useMemo(() => data?.find((trace) => trace.id === selectedTraceId), [data, selectedTraceId])

  if (!group) return null

  return (
    <div className="flex flex-row h-full">
      <div className="flex flex-col gap-2 border-r">
        <div className="w-full h-[37px] border-b flex items-center justify-center gap-2">
          <Button variant="icon" size="sm" className="px-2" onClick={() => setZoom(zoom - 0.1)}>
            <Minus className="w-4 h-4 cursor-pointer" />
          </Button>
          <span className="text-sm font-bold text-muted-foreground">Zoom</span>
          <Button variant="icon" size="sm" className="px-2" onClick={() => setZoom(zoom + 0.1)}>
            <Plus className="w-4 h-4 cursor-pointer" />
          </Button>
        </div>
        <div className="px-2">
          {data?.map((trace) => (
            <div
              key={trace.id}
              className="flex items-center min-w-[200px] max-w-[250px] h-[32px] max-h-[32px] py-4 px-2"
            >
              <div className="text-sm font-semibold text-foreground truncate">{trace.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="flex flex-row items-center min-w-full" style={{ width: `${zoom * 1000}px` }}>
          <div className="flex flex-1 relative">
            <div className="flex justify-between font-mono p-2 w-full text-xs text-muted-foreground bg-muted-foreground/10">
              <span>0ms</span>
              <span>{Math.floor((endTime - group.startTime) * 0.25)}ms</span>
              <span>{Math.floor((endTime - group.startTime) * 0.5)}ms</span>
              <span>{Math.floor((endTime - group.startTime) * 0.75)}ms</span>
              <span>{Math.floor(endTime - group.startTime)}ms</span>
              <div className="absolute bottom-[-4px] w-full flex justify-between">
                <span className="w-[1px] h-full bg-blue-500"></span>
                <span className="w-[1px] h-full bg-blue-500"></span>
                <span className="w-[1px] h-full bg-blue-500"></span>
                <span className="w-[1px] h-full bg-blue-500"></span>
                <span className="w-[1px] h-full bg-blue-500"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full overflow-auto p-2 min-w-full" style={{ width: `${zoom * 1000}px` }}>
          {data?.map((trace) => (
            <TraceItem
              key={trace.id}
              trace={trace}
              group={group}
              groupEndTime={endTime}
              onExpand={setSelectedTraceId}
            />
          ))}
        </div>
      </div>
      {selectedTrace && <TraceItemDetail trace={selectedTrace} onClose={() => setSelectedTraceId(null)} />}
    </div>
  )
})
