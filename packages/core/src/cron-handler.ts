import { EventManager, Step, CronConfig, FlowContext } from './types'
import { globalLogger, Logger } from './logger'
import * as cron from 'node-cron'
import { Server } from 'socket.io'
import { isCronStep } from './guards'
import { getModuleExport } from './node/get-module-export'

const cronJobs = new Map<string, cron.ScheduledTask>()

export const setupCronHandlers = (steps: Step[], eventManager: EventManager, socketServer?: Server) => {
  steps.filter(isCronStep).forEach(async (step) => {
    const { config, filePath } = step
    const { cron: cronExpression } = config

    if (!cron.validate(cronExpression)) {
      globalLogger.error('[cron handler] invalid cron expression', {
        expression: cronExpression,
        step: step.config.name
      })
      return
    }

    globalLogger.debug('[cron handler] setting up cron job', {
      filePath,
      step: step.config.name,
      cron: cronExpression
    })

    const task = cron.schedule(cronExpression, async () => {
      const traceId = Math.random().toString(36).substring(7)
      const logger = new Logger(traceId, config.flows, step.config.name, socketServer)

      try {
        const handler = await getModuleExport(filePath, 'handler')
        const emit = async (event: { type: string; data: any }) => {
          await eventManager.emit({
            ...event,
            traceId,
            flows: config.flows,
            logger
          }, filePath)
        }

        if (handler) {
          await handler({ emit, logger, traceId } as FlowContext)
        } else {
          await emit({
            type: config.emits[0],
            data: { timestamp: Date.now() }
          })
        }
      } catch (error: any) {
        logger.error('[cron handler] error executing cron job', {
          error: error.message,
          step: step.config.name
        })
      }
    })

    cronJobs.set(step.config.name, task)
  })

  return () => {
    cronJobs.forEach((task) => task.stop())
    cronJobs.clear()
  }
}