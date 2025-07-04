import { PropsWithChildren } from 'react'
import { NoopNodeData } from '../views/flow/nodes/nodes.types'
import { BaseNode } from './base-node'

type Props = PropsWithChildren<{
  data: NoopNodeData
}>

export const NoopNode = ({ data, children }: Props) => {
  return (
    <BaseNode
      variant="noop"
      title={data.name}
      subtitle={data.description}
      disableSourceHandle={!data.virtualEmits.length}
      disableTargetHandle={!data.subscribes?.length}
    >
      {children}
    </BaseNode>
  )
}
