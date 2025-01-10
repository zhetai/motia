import { BaseNode } from '../../../publicComponents/base-node'
import { BaseNodeData } from './nodes.types'

export const BaseFlowNode = ({ data }: { data: BaseNodeData }) => {
  return <BaseNode data={data} />
}
