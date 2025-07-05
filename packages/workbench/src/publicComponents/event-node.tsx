import { PropsWithChildren } from 'react'
import { BaseNode } from './base-node'
import { EventNodeProps } from './node-props'

export const EventNode: React.FC<PropsWithChildren<EventNodeProps>> = ({ data, children }) => {
  return (
    <BaseNode
      data={data}
      variant="event"
      title={data.name}
      subtitle={data.description}
      language={data.language}
      disableSourceHandle={!data.emits?.length && !data.virtualEmits?.length}
      disableTargetHandle={!data.subscribes?.length && !data.virtualSubscribes?.length}
      emits={data.emits}
      subscribes={data.subscribes}
    >
      {children}
    </BaseNode>
  )
}
