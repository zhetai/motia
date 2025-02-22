import { Step, Emit } from './types'
import { isApiStep, isCronStep, isEventStep } from './guards'

const toTopic = (emit: Emit) => (typeof emit === 'string' ? emit : emit.topic)

export const isAllowedToEmit = (step: Step, emit: string) => {
  if (isApiStep(step)) {
    return step.config.emits.map(toTopic).includes(emit)
  }

  if (isEventStep(step)) {
    return step.config.emits.map(toTopic).includes(emit)
  }

  if (isCronStep(step)) {
    return step.config.emits.map(toTopic).includes(emit)
  }

  return false
}
