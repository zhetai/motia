import { TriggerNode } from '../../../publicComponents/trigger-node'
import { TriggerNodeData } from './nodes.types'

export const TriggerFlowNode = ({ data }: { data: TriggerNodeData }) => {
  return <TriggerNode data={data} />
}
