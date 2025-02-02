import { z, ZodObject } from 'zod'
import { Logger } from './logger'

export type InternalStateManager = {
  get<T>(traceId: string, key: string): Promise<T | null>
  set<T>(traceId: string, key: string, value: T): Promise<void>
  delete(traceId: string, key: string): Promise<void>
  clear(traceId: string): Promise<void>
}

export type EmitData = { type: string; data: Record<string, unknown> }
export type Emitter = (event: EmitData) => Promise<void>
export type FlowContext = {
  emit: Emitter
  traceId: string
  state: InternalStateManager
  logger: Logger
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler<TInput extends ZodObject<any>> = (input: z.infer<TInput>, ctx: FlowContext) => Promise<void>

export type Emit = string | { type: string; label?: string; conditional?: boolean }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventConfig<TInput extends ZodObject<any>> = {
  type: 'event'
  name: string
  description?: string
  subscribes: string[]
  emits: Emit[]
  virtualEmits?: Emit[]
  input: TInput
  flows: string[]
}

export type NoopConfig = {
  type: 'noop'
  name: string
  description?: string
  virtualEmits: Emit[]
  virtualSubscribes: string[]
  flows: string[]
}

export type ApiRouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

export type ApiRouteConfig = {
  type: 'api'
  name: string
  description?: string
  path: string
  method: ApiRouteMethod
  emits: string[]
  virtualEmits?: Emit[]
  virtualSubscribes?: string[]
  flows: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bodySchema?: ZodObject<any>
}

export type ApiRequest = {
  pathParams: Record<string, string>
  queryParams: Record<string, string | string[]>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>
  headers: Record<string, string | string[]>
}

export type ApiResponse = {
  status: number
  headers?: Record<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: string | Buffer | Record<string, any>
}

export type ApiRouteHandler = (req: ApiRequest, ctx: FlowContext) => Promise<ApiResponse>

export type CronConfig = {
  type: 'cron'
  name: string
  description?: string
  cron: string
  virtualEmits?: Emit[]
  emits: string[]
  flows: string[]
}

export type StepHandler<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends EventConfig<any>
    ? EventHandler<T['input']>
    : T extends ApiRouteConfig
      ? ApiRouteHandler
      : T extends CronConfig
        ? never
        : never

export type Event<TData = unknown> = {
  type: string
  data: TData
  traceId: string
  flows: string[]
  logger: Logger
}

export type Handler<TData = unknown> = (event: Event<TData>) => Promise<void>

export type SubscribeConfig<TData> = {
  event: string
  handlerName: string
  filePath: string
  handler: Handler<TData>
}

export type UnsubscribeConfig = {
  filePath: string
  event: string
}

export type EventManager = {
  emit: <TData>(event: Event<TData>, file?: string) => Promise<void>
  subscribe: <TData>(config: SubscribeConfig<TData>) => void
  unsubscribe: (config: UnsubscribeConfig) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StepConfig = EventConfig<ZodObject<any>> | NoopConfig | ApiRouteConfig | CronConfig

export type Step<TConfig extends StepConfig = StepConfig> = { filePath: string; version: string; config: TConfig }

export type Flow = {
  name: string
  description?: string
  steps: Step[]
}
