import { EventConfig, EventManager, Step } from './types'
import { globalLogger } from './logger'
import { callStepFile } from './call-step-file'
import { LockedData } from './locked-data'
import { StateAdapter } from './state/state-adapter'

export type MotiaEventManager = {
  createHandler: (step: Step<EventConfig>) => void
  removeHandler: (step: Step<EventConfig>) => void
}

export const createStepHandlers = (
  lockedData: LockedData,
  eventManager: EventManager,
  state: StateAdapter,
): MotiaEventManager => {
  const eventSteps = lockedData.eventSteps()

  globalLogger.debug(`[step handler] creating step handlers for ${eventSteps.length} steps`)

  const createHandler = (step: Step<EventConfig>) => {
    const { config, filePath } = step
    const { subscribes } = config

    globalLogger.debug('[step handler] establishing step subscriptions', { filePath, step: step.config.name })

    subscribes.forEach((subscribe) => {
      eventManager.subscribe({
        filePath,
        event: subscribe,
        handlerName: step.config.name,
        handler: async (event) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { logger, ...rest } = event
          globalLogger.debug('[step handler] received event', { event: rest, step: step.config.name })

          try {
            await callStepFile(step, lockedData, event, eventManager, state)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            globalLogger.error(`[step handler] error calling step`, {
              error: error.message,
              filePath,
              step: step.config.name,
            })
          }
        },
      })
    })
  }

  const removeHandler = (step: Step<EventConfig>) => {
    const { config, filePath } = step
    const { subscribes } = config

    subscribes.forEach((subscribe) => {
      eventManager.unsubscribe({ filePath, event: subscribe })
    })
  }

  eventSteps.forEach(createHandler)

  return { removeHandler, createHandler }
}
