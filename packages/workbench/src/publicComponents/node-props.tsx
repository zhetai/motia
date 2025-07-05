import { ApiNodeData, CronNodeData, EventNodeData, NoopNodeData } from '../views/flow/nodes/nodes.types'

export type NodeProps = EventNodeProps | NoopNodeProps | ApiNodeProps | CronNodeProps
export type BaseNodeProps = {
  id: string
  nodeConfig?: {
    sourceHandlePosition?: 'bottom' | 'right'
    targetHandlePosition?: 'top' | 'left'
  }
}

export type EventNodeProps = { data: BaseNodeProps & EventNodeData }
export type NoopNodeProps = { data: BaseNodeProps & NoopNodeData }
export type ApiNodeProps = { data: BaseNodeProps & ApiNodeData }
export type CronNodeProps = { data: BaseNodeProps & CronNodeData }
