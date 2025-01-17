import { JSONSchema7 } from 'json-schema'

export type BaseNodeData = {
  type: string
  name: string
  description?: string
  subscribes: string[]
  emits: Array<string | { type: string; label?: string; conditional?: boolean }>
  language?: string
}

export type NoopNodeData = {
  type: string
  name: string
  description?: string
  virtualEmits: string[]
  virtualSubscribes: string[]
}

export type TriggerNodeData = {
  type: string
  name: string
  description?: string
  emits: string[]
  subscribes?: string[]
  action: 'webhook'
  webhookUrl?: string
  bodySchema?: JSONSchema7
}

export type NodeData = BaseNodeData | TriggerNodeData | NoopNodeData

export type EdgeData = {
  label?: string
  variant: 'default' | 'conditional'
}
