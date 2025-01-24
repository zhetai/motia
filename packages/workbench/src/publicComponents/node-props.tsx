import { EventNodeData, ApiNodeData, NoopNodeData, CronNodeData } from '../views/flow/nodes/nodes.types'

export type BaseNodeProps = EventNodeProps | NoopNodeProps | ApiNodeProps | CronNodeProps

export type EventNodeProps = {
  data: EventNodeData
}

export type NoopNodeProps = {
  data: NoopNodeData
}

export type ApiNodeProps = {
  data: ApiNodeData
}

export type CronNodeProps = {
  data: CronNodeData
}
