import { Send } from 'lucide-react'
import { BaseNodeData } from '../views/flow/nodes/nodes.types'

const toType = (emit: string | { type: string; label?: string; conditional?: boolean }) =>
  typeof emit === 'string' ? emit : emit.type

export const Emits: React.FC<{ data: BaseNodeData }> = ({ data }) => {
  return (
    <>
      {data.emits.map((emit) => (
        <div key={toType(emit)} className="flex gap-1 items-center">
          <Send className="w-3 h-3 text-muted-foreground" />
          <div className="text-xs font-mono" data-testid={`emits__${toType(emit)}`}>
            {toType(emit)}
          </div>
        </div>
      ))}
    </>
  )
}
