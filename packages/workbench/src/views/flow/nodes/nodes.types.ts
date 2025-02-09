import { JSONSchema7 } from 'json-schema'

export type EventNodeData = {
  type: string
  name: string
  description?: string
  subscribes: string[]
  emits: Array<string | { type: string; label?: string }>
  language?: string
}

export type NoopNodeData = {
  type: string
  name: string
  description?: string
  virtualEmits: string[]
  subscribes: string[]
}

export type ApiNodeData = {
  type: string
  name: string
  description?: string
  emits: Array<string | { type: string; label?: string }>
  subscribes?: string[]
  webhookUrl?: string
  bodySchema?: JSONSchema7
}

export type CronNodeData = {
  type: string
  name: string
  description?: string
  emits: Array<string | { type: string; label?: string }>
  cronExpression: string
  language?: string
}

export type NodeData = EventNodeData | ApiNodeData | NoopNodeData | CronNodeData

// ducplicate of packages/core/src/flows-endpoint.ts
export type EdgeData = {
  variant: 'event' | 'virtual'
  label?: string
  labelVariant?: 'default' | 'conditional'
}
