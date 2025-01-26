import { BaseNode } from './base-node'
import { Emits } from './emits'
import { CronNodeProps } from './node-props'
import { Clock } from 'lucide-react'

export const CronNode = ({ data }: CronNodeProps) => {
  return (
    <BaseNode
      variant="cron"
      title={data.name}
      headerChildren={<Clock className="w-4 h-4 text-purple-400" />}
      disableTargetHandle
    >
      <div className="text-sm text-white/70">{data.description}</div>
      <div className="text-xs text-white/50 flex items-center gap-2">
        <Clock className="w-3 h-3" /> {data.cronExpression}
      </div>
      <Emits emits={data.emits} />
    </BaseNode>
  )
}
