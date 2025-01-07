import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: "stepA",
  subscribes: ["pms.start"],
  emits: ["pms.stepA.done"],
  input: inputSchema,
  workflow: "parallel-merge"
}

export const executor: FlowExecutor<Input> = async (_, emit, ctx) => {
  const traceId = ctx.traceId;
  console.log("[stepA] received pms.start, traceId =", traceId);

  const partialResultA = { msg: "Hello from Step A", timestamp: Date.now() };
  await ctx.state.set<{msg: string, timestamp: number}>(traceId, "stepA", partialResultA);

  await emit({
    type: "pms.stepA.done",
    data: partialResultA,
  });
}
