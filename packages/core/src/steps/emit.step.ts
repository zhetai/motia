import { ApiRouteConfig, StepHandler } from '../types'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'Event Emitter',
  description: 'System endpoint for emitting events',
  path: '/emit',
  method: 'POST',
  emits: [], // Dynamic emissions
  flows: ['_system'],
  bodySchema: z.object({
    type: z.string(),
    data: z.record(z.unknown()),
  }),
}

export const handler: StepHandler<typeof config> = async (req, { emit, logger }) => {
  const { type, data } = req.body

  logger.info('[Event Emitter] Emitting event', { type, data })
  await emit({ type, data })

  return {
    status: 200,
    body: { success: true, emitted: { type, data } },
  }
}
