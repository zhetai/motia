import { EventNodeData, TriggerNodeData, NoopNodeData } from '../views/flow/nodes/nodes.types'

export type BaseNodeProps = EventNodeProps | NoopNodeProps | TriggerNodeProps

export type EventNodeProps = {
  data: EventNodeData
}

export type NoopNodeProps = {
  data: NoopNodeData
}

export type TriggerNodeProps = {
  data: TriggerNodeData
}
