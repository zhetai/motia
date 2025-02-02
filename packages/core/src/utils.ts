import { Step, Emit } from './types'
import { isApiStep, isEventStep } from './guards'

const toType = (emit: Emit) => (typeof emit === 'string' ? emit : emit.type)

export const isAllowedToEmit = (step: Step, emit: string) => {
  if (isApiStep(step)) {
    return step.config.emits.map(toType).includes(emit)
  }

  if (isEventStep(step)) {
    return step.config.emits.map(toType).includes(emit)
  }

  return false
}
