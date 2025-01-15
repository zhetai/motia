import { ApiRouteConfig, EventConfig, NoopConfig, Step } from './types'

export const isApiStep = (step: Step): step is Step<ApiRouteConfig> => step.config.type === 'api'
export const isEventStep = (step: Step): step is Step<EventConfig<any>> => step.config.type === 'event'
export const isNoopStep = (step: Step): step is Step<NoopConfig> => step.config.type === 'noop'
