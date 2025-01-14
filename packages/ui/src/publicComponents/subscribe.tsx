import { Eye } from 'lucide-react'
import { BaseNodeData } from '../views/flow/nodes/nodes.types'

export const Subscribe: React.FC<{ data: BaseNodeData }> = ({ data }) => {
  return (
    <>
      {data.subscribes.map((subscribe) => (
        <div key={subscribe} className="flex gap-1 items-center">
          <Eye className="w-3 h-3 text-black" />
          <div className="text-xs font-mono" data-testid={`subscribes__${subscribe}`}>
            {subscribe}
          </div>
        </div>
      ))}
    </>
  )
}
