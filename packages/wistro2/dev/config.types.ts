import { FlowConfig } from '../wistro.types'

export type ApiPath = {
  method: string
  emits: string
}

export type ApiConfig = {
  port: number
  paths: Record<string, ApiPath>
}

export type Config = {
  api: ApiConfig
}

export type Workflow = {
  config: FlowConfig<any>
  file: string
  filePath: string
}
