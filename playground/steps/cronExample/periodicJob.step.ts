import { CronConfig, FlowContext } from '@motiadev/core'

export const config: CronConfig = {
  type: 'cron',
  name: 'PeriodicJob',
  description: 'Runs every minute and emits a timestamp',
  cron: '0 * * * *', // run every hour at minute 0
  emits: ['cron-ticked'],
  flows: ['cron-example'],
}

export const handler = async ({ emit }: FlowContext) => {
  await emit({
    type: 'cron-ticked',
    data: {
      timestamp: Date.now(),
      message: 'Cron job executed',
    },
  })
}
