import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: 'stepC',
  subscribes: ['pms.start'],
  emits: ['pms.stepC.done'],
  input: inputSchema,
  flows: ['parallel-merge'],
}

export const executor: FlowExecutor<Input> = async (_, emit, ctx) => {
  const traceId = ctx.traceId
  console.log('[stepC] received pms.start, traceId =', traceId)

  const partialResultA = { msg: 'Hello from Step A', timestamp: Date.now() }
  await ctx.state.set(traceId, 'stepC', partialResultA)

  await emit({
    type: 'pms.stepC.done',
    data: partialResultA,
  })
}
