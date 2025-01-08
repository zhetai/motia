import { ZodObject } from 'zod'
import { FlowConfig } from '../wistro.types'

export type ApiPath = {
  method: string
  emits: string
  name: string
  flows: string[]
  description?: string
  tags?: string[]
}

export type ApiRoute = ApiPath & { path: string }

export type ApiConfig = {
  paths: Record<string, ApiPath>
}

export type FlowDefinition = {
  name: string
}

export type CronDefinition = {
  name: string
  description?: string
  cron: string
  emits: string
  tags?: string[]
  flows: string[]
}

export type StateConfig = {
  adapter: string
  host: string
  port: number
  password?: string
}

export type Config = {
  port: number
  api: ApiConfig
  flows: Record<string, FlowDefinition>
  cron: Record<string, CronDefinition>
  state: StateConfig
}

export type FlowStep = {
  config: FlowConfig<ZodObject<any>>
  file: string
  filePath: string
}
