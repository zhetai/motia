import { NoopNode as NoopPublicNode } from '../../../publicComponents/noop-node'
import { NoopNodeData } from './nodes.types'

export const NoopNode = ({ data }: { data: NoopNodeData }) => {
  return <NoopPublicNode data={data} />
}