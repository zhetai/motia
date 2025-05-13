import { PropsWithChildren } from 'react'
import { BaseNode } from './base-node'
import { NodeDetails } from './node-details'
import { EventNodeProps } from './node-props'

type Props = PropsWithChildren<EventNodeProps & { className?: string }>

export const EventNode = (props: Props) => {
  const { data, children } = props

  return (
    <BaseNode
      variant="event"
      title={data.name}
      language={data.language}
      disableSourceHandle={!data.emits?.length && !data.virtualEmits?.length}
      disableTargetHandle={!data.subscribes?.length && !data.virtualSubscribes?.length}
    >
      <div className="text-sm text-muted-foreground">{data.description}</div>
      {children}

      <NodeDetails
        type="event"
        name={data.name}
        subscribes={data.subscribes}
        emits={data.emits}
        description={data.description}
        language={data.language}
      />
    </BaseNode>
  )
}
