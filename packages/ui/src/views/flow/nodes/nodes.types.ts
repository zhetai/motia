import { JSONSchema7 } from 'json-schema'

export type EventNodeData = {
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
  emits: Array<string | { type: string; label?: string; conditional?: boolean }>
  subscribes?: string[]
  action: 'webhook'
  webhookUrl?: string
  bodySchema?: JSONSchema7
}

export type NodeData = EventNodeData | TriggerNodeData | NoopNodeData

export type EdgeData = {
  label?: string
  variant: 'default' | 'conditional'
}
