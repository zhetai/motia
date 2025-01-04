export type BaseNodeData = {
  name: string
  description: string
  subscribes: string[]
  emits: Array<string | { type: string; label?: string; conditional?: boolean }>
}

export type TriggerNodeData = {
  name: string
  description: string
  emits: string[]
  action: 'webhook' | 'cron'
  cron?: string
  webhookUrl?: string
}

export type EdgeData = {
  label: string
  variant: 'default' | 'conditional'
}
