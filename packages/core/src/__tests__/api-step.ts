import { ApiRouteHandler, FlowContext } from '../types'

export const handler: ApiRouteHandler = async (_, ctx: FlowContext) => {
  await ctx.emit({ data: { test: 'data' }, type: 'TEST_EVENT' })

  return { status: 200, body: { traceId: ctx.traceId } }
}
