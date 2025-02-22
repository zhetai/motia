import { ApiRouteConfig, ApiRouteHandler, FlowContext } from '../../types'

export const config: ApiRouteConfig = {
  type: 'api',
  name: 'api-step',
  emits: ['TEST_EVENT'],
  path: '/test',
  method: 'POST',
}

export const handler: ApiRouteHandler = async (_, ctx: FlowContext) => {
  await ctx.emit({ data: { test: 'data' }, topic: 'TEST_EVENT' })

  return { status: 200, body: { traceId: ctx.traceId } }
}
