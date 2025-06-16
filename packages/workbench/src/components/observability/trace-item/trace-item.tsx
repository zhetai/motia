import { cn } from '@/lib/utils'
import { Trace, TraceGroup } from '@/types/observability'
import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'
import { TraceItemDetail } from './trace-item-detail'

type Props = {
  trace: Trace
  group: TraceGroup
  groupEndTime: number
}

export const TraceItem: React.FC<Props> = ({ trace, group, groupEndTime }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <div
        className="flex flex-row items-center hover:bg-muted/50 p-1 rounded-md cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center min-w-[200px] w-[200px] h-[20px]">
          <ChevronDown
            className={cn('w-[20px] h-4 mr-2 transition-transform duration-50', {
              'rotate-180': isExpanded,
            })}
          />
          <h2 className="text-sm font-medium text-muted-foreground">{trace.name}</h2>
        </div>
        <div className="relative w-full">
          <div
            className={cn('h-[20px] rounded-[4px] cursor-pointer hover:opacity-80 transition-all duration-200', {
              'bg-blue-500': trace.status === 'running',
              'bg-green-500': trace.status === 'completed',
              'bg-red-500': trace.status === 'failed',
            })}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              marginLeft: `${((trace.startTime - group.startTime) / (groupEndTime - group.startTime)) * 100}%`,
              width: trace.endTime
                ? `${((trace.endTime - trace.startTime) / (groupEndTime - group.startTime)) * 100}%`
                : `${((Date.now() - trace.startTime) / (groupEndTime - group.startTime)) * 100}%`,
            }}
          />
        </div>
      </div>
      {isExpanded && <TraceItemDetail trace={trace} />}
    </div>
  )
}
