import { ApiRouteConfig, StepHandler } from '@motiadev/core'
import { z } from 'zod'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'Test state api trigger',
  description: 'test state',
  path: '/test-state',
  method: 'POST',
  emits: ['test-state'],
  bodySchema: z.object({}),
  flows: ['test-state'],
}

export const handler: StepHandler<typeof config> = async (req, { logger, emit }) => {
  logger.info('[Test motia state] triggering api step', req)

  await emit({
    topic: 'test-state',
    data: {},
  })

  return {
    status: 200,
    body: { message: 'test-state topic emitted' },
  }
}
