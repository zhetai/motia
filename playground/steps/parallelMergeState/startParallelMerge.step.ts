import { ApiRouteConfig, StepHandler, ApiMiddleware } from '@motiadev/core'

const timingMiddleware: ApiMiddleware = async (_, ctx, next) => {
  const start = Date.now()

  const response = await next()

  const duration = Date.now() - start
  ctx.logger.info(`Request completed in ${duration}ms`)

  return response
}

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'Parallel Merge',
  description: 'Triggered when a message is received from parallel merge',
  path: '/api/parallel-merge',
  method: 'POST',
  virtualSubscribes: ['/api/parallel-merge'],
  emits: ['pms.start'],
  flows: ['parallel-merge'],
  middleware: [timingMiddleware],
}

export const handler: StepHandler<typeof config> = async (req, { emit, logger }) => {
  logger.info('Starting parallel merge')

  await emit({ topic: 'pms.start', data: {} })

  return { status: 200, body: { message: 'Started parallel merge' } }
}
