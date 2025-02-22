import { CronConfig, FlowContext, StepHandler } from '@motiadev/core'

export const config: CronConfig = {
  type: 'cron',
  name: 'PeriodicJob',
  description: 'Runs every minute and emits a timestamp',
  cron: '0 * * * *', // run every hour at minute 0
  emits: ['cron-ticked'],
  flows: ['cron-example'],
}

export const handler: StepHandler<typeof config> = async ({ emit, logger }: FlowContext) => {
  logger.info('Running cron job')

  await emit({
    topic: 'cron-ticked',
    data: {
      timestamp: Date.now(),
      message: 'Cron job executed',
    },
  })
}
