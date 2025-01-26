import { ApiRouteConfig, EventConfig, NoopConfig, Step, CronConfig } from './types'

export const isApiStep = (step: Step): step is Step<ApiRouteConfig> => step.config.type === 'api'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEventStep = (step: Step): step is Step<EventConfig<any>> => step.config.type === 'event'
export const isNoopStep = (step: Step): step is Step<NoopConfig> => step.config.type === 'noop'
export const isCronStep = (step: Step): step is Step<CronConfig> => step.config.type === 'cron'
