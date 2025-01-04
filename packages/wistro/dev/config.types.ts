import { FlowConfig } from '../wistro.types'

export type ApiPath = {
  method: string
  emits: string
  name: string
  description?: string
  tags?: string[]
}

export type ApiConfig = {
  port: number
  paths: Record<string, ApiPath>
}

export type WorkflowDefinition = {
  name: string
}

export type CronDefinition = {
  name: string
  description?: string
  cron: string
  emits: string
  tags?: string[]
  workflow: string
}

export type StateConfig = {
  adapter: string
  host: string
  port: number
  password: string
}

export type Config = {
  api: ApiConfig
  workflows: Record<string, WorkflowDefinition>
  cron: Record<string, CronDefinition>
  state: StateConfig
}

export type Workflow = {
  config: FlowConfig<any>
  file: string
  filePath: string
}
