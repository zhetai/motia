import { Position } from '@xyflow/react'
import { BaseHandle } from './base-handle'
import { NoopNodeData } from '../views/flow/nodes/nodes.types'

type Props = {
  data: NoopNodeData
}

export const NoopNode = ({ data }: Props) => {
  return (
    <div className="group relative">
      {/* Border container */}
      <div className="absolute -inset-[1px] rounded-md bg-gradient-to-r from-teal-500/20 to-teal-400/10" />
      
      {/* Main node content */}
      <div className="relative flex flex-col min-w-[300px] bg-teal-950/40 rounded-md overflow-hidden font-mono">
        <div className="px-3 py-1 border-b border-white/20 bg-black/30 text-xs text-white/70">
          <span>{data.name}</span>
        </div>
        
        <div className="p-4 space-y-3">
          {data.description && (
            <div className="text-sm text-white/60">{data.description}</div>
          )}
        </div>
      </div>

      {/* Connection points */}
      <BaseHandle type="target" position={Position.Top} />
      <BaseHandle type="source" position={Position.Bottom} />
      
      {/* Stacked card effect */}
      <div className="absolute inset-0 -z-10 translate-y-1 translate-x-1 bg-black/20 rounded-md border border-white/5" />
    </div>
  )
}