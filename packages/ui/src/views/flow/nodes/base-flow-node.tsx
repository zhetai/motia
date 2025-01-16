import { BaseNode } from '../../../publicComponents/base-node'
import { BaseNodeProps } from '../../../publicComponents/node-props'

export const BaseFlowNode = ({ data }: BaseNodeProps) => {
  return <BaseNode className="relative" data={data}></BaseNode>
}
