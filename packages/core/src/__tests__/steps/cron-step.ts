import { CronConfig, CronHandler, FlowContext } from '../../types'

export const config: CronConfig = {
  type: 'cron',
  name: 'cron-step',
  emits: ['TEST_EVENT'],
  cron: '* * * * *', // Run every minute
}

export const handler: CronHandler = async (ctx: FlowContext) => {
  await ctx.emit({ data: { test: 'data' }, topic: 'TEST_EVENT' })
}
