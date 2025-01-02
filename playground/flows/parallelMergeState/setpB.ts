import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: "stepB",
  subscribes: ["pms.start"],
  emits: ["pms.stepB.done"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (_, emit, ctx) => {
  const traceId = ctx.traceId;
  console.log("[stepB] received pms.start, traceId =", traceId);

  const partialResultA = { msg: "Hello from Step A", timestamp: Date.now() };
  await ctx.state.set(traceId, "stepB", partialResultA);

  await emit({
    type: "pms.stepB.done",
    data: partialResultA,
  });
}
