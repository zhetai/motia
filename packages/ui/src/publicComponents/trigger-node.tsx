import { Position } from '@xyflow/react'
import { Webhook } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { BaseHandle } from './base-handle'
import { Emits } from './emits'
import { TriggerNodeProps } from './node-props'

type Props = PropsWithChildren<TriggerNodeProps & { excludePubsub?: boolean }>

export const TriggerNode = ({ data, children, excludePubsub }: Props) => {
  return (
    <div className="group relative">
      {/* Border container */}
      <div className="absolute -inset-[1px] rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/10" />
      
      {/* Main node content */}
      <div className="relative flex flex-col min-w-[300px] bg-blue-950/40 rounded-md overflow-hidden font-mono">
        <div className="px-3 py-1 border-b border-white/20 bg-black/30 text-xs text-white/70">
          <span>{data.name}</span>
        </div>
        
        <div className="p-4 space-y-3">
          {data.description && (
            <div className="text-sm text-white/60">{data.description}</div>
          )}
          {children}
          {data.webhookUrl && (
            <div className="flex gap-1 items-center text-xs text-white/60">
              <Webhook className="w-3 h-3 text-white/40" />
              <div className="font-mono">{data.webhookUrl}</div>
            </div>
          )}
          {!excludePubsub && <Emits emits={data.emits} />}
        </div>
      </div>

      {data.subscribes && data.subscribes.length > 0 && <BaseHandle type="target" position={Position.Top} />}
      <BaseHandle type="source" position={Position.Bottom} />
      
      {/* Stacked card effect */}
      <div className="absolute inset-0 -z-10 translate-y-1 translate-x-1 bg-black/20 rounded-md border border-white/5" />
    </div>
  )
}
