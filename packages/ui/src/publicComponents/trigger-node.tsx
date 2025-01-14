import { Position } from '@xyflow/react'
import { Webhook } from 'lucide-react'
import { PropsWithChildren } from 'react'
import { BaseHandle } from './base-handle'
import { Emits } from './emits'
import { TriggerNodeProps } from './node-props'

type Props = PropsWithChildren<TriggerNodeProps & { excludePubsub?: boolean }>

export const TriggerNode = ({ data, children, excludePubsub }: Props) => {
  return (
    <div className="border-[2px] border-dashed border-sky-900 rounded-[14px] p-[1px]">
      <div className="bg-sky-500 text-black rounded-md p-2 px-3 rounded-[10px]">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">{data.name}</div>
              {data.description && <div className="text-xs">{data.description}</div>}
            </div>
          </div>
          {children}
          <div className="flex flex-col">
            {data.webhookUrl && (
              <div className="flex gap-1 items-center">
                <Webhook className="w-3 h-3 text-black" />
                <div className="text-xs font-mono">{data.webhookUrl}</div>
              </div>
            )}
            {!excludePubsub && <Emits emits={data.emits} />}
          </div>
        </div>
        {data.subscribes && data.subscribes.length > 0 && <BaseHandle type="target" position={Position.Top} />}
        <BaseHandle type="source" position={Position.Bottom} />
      </div>
    </div>
  )
}
