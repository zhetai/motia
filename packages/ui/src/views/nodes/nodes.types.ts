export type BaseNodeData = {
  label: string
  description: string
  subscribes: string[]
  emits: string[]
}

export type TriggerNodeData = {
  label: string
  description: string
  emits: string[]
  action: 'webhook' | 'cron'
  cronSchedule?: string
  webhookUrl?: string
}

export type EdgeData = {
  label: string
  variant: 'default' | 'conditional'
}
