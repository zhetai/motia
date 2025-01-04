import { Position } from '@xyflow/react'
import { Eye, Send } from 'lucide-react'
import { BaseNodeData } from './nodes.types'
import { BaseHandle } from '../base-handle'

const toType = (emit: string | { type: string; label?: string; conditional?: boolean }) =>
  typeof emit === 'string' ? emit : emit.type

export const BaseNode = ({ data }: { data: BaseNodeData }) => {
  return (
    <div className="bg-white rounded-md p-2 px-3 text-black">
      <div className="flex flex-col ">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold">{data.name}</div>
          {data.description && <div className="text-xs">{data.description}</div>}
        </div>
        <div className="flex flex-col mt-2">
          {data.subscribes.map((subscribe) => (
            <div key={subscribe} className="flex gap-1 items-center">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <div className="text-xs font-mono" data-testid={`subscribes__${subscribe}`}>
                {subscribe}
              </div>
            </div>
          ))}
          {data.emits.map((emit) => (
            <div key={toType(emit)} className="flex gap-1 items-center">
              <Send className="w-3 h-3 text-muted-foreground" />
              <div className="text-xs font-mono" data-testid={`emits__${toType(emit)}`}>
                {toType(emit)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BaseHandle type="target" position={Position.Top} />
      {data.emits.length > 0 && <BaseHandle type="source" position={Position.Bottom} />}
    </div>
  )
}
