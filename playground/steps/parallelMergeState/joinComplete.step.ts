import { EventConfig, StepHandler } from '@motiadev/core'
import { z } from 'zod'

const stepSchema = z.object({ msg: z.string(), timestamp: z.number() })

export const config: EventConfig = {
  type: 'event',
  name: 'Join Complete',
  description: 'Logs the merge',
  subscribes: ['pms.join.complete'],
  emits: [],
  input: z.object({ stepA: stepSchema, stepB: stepSchema, stepC: stepSchema, mergedAt: z.string() }),
  flows: ['parallel-merge'],
}

export const handler: StepHandler<typeof config> = async (input, { logger }) => {
  logger.info('[Join Complete] Handling Join Complete', { input })
}
