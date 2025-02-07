import * as cron from 'node-cron'
import { Server } from 'socket.io'
import { LockedData } from './locked-data'
import { globalLogger, Logger } from './logger'
import { getModuleExport } from './node/get-module-export'
import { EventManager, FlowContext, Step, CronConfig } from './types'

export type CronManager = {
  createCronJob: (step: Step<CronConfig>) => void
  removeCronJob: (step: Step<CronConfig>) => void
  close: () => void
}

export const setupCronHandlers = (lockedData: LockedData, eventManager: EventManager, socketServer: Server) => {
  const cronJobs = new Map<string, cron.ScheduledTask>()

  const createCronJob = (step: Step<CronConfig>) => {
    const { config, filePath } = step
    const { cron: cronExpression, name: stepName } = config

    if (!cron.validate(cronExpression)) {
      globalLogger.error('[cron handler] invalid cron expression', {
        expression: cronExpression,
        step: stepName,
      })
      return
    }

    globalLogger.debug('[cron handler] setting up cron job', {
      filePath,
      step: stepName,
      cron: cronExpression,
    })

    const task = cron.schedule(cronExpression, async () => {
      const traceId = Math.random().toString(36).substring(7)
      const logger = new Logger(traceId, config.flows, stepName, socketServer)
      const flows = config.flows

      try {
        const handler = await getModuleExport(filePath, 'handler')
        const emit = async (event: { type: string; data: unknown }) => {
          await eventManager.emit({ ...event, traceId, flows, logger }, filePath)
        }

        if (handler) {
          await handler({ emit, logger, traceId } as FlowContext)
        } else {
          const data = { timestamp: Date.now() }
          await Promise.all(
            config.emits.map((item) => {
              const type = typeof item === 'string' ? item : item.type
              emit({ type, data })
            }),
          )
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        logger.error('[cron handler] error executing cron job', {
          error: error.message,
          step: step.config.name,
        })
      }
    })

    cronJobs.set(step.filePath, task)
  }

  const removeCronJob = (step: Step<CronConfig>) => {
    const task = cronJobs.get(step.filePath)

    if (task) {
      task.stop()
      cronJobs.delete(step.filePath)
    }
  }

  const close = () => {
    cronJobs.forEach((task) => task.stop())
    cronJobs.clear()
  }

  lockedData.cronSteps().forEach(createCronJob)

  return { createCronJob, removeCronJob, close }
}
