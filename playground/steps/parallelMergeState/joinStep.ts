import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: "join-step",
  subscribes: ["pms.stepA.done", "pms.stepB.done", "pms.stepC.done"],
  emits: ["pms.join.complete"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (_, emit, ctx) => {
  const traceId = ctx.traceId;
  console.log(
    "[join-step] Checking if all partial results exist for traceId =",
    traceId
  );

  const stepAData = await ctx.state.get(traceId, "stepA");
  const stepBData = await ctx.state.get(traceId, "stepB");
  const stepCData = await ctx.state.get(traceId, "stepC");

  if (!stepAData || !stepBData || !stepCData) {
    console.log("[join-step] Not all steps done yet, ignoring for now.");
    return;
  }

  console.log("[join-step] All steps are complete. Merging results...");
  const merged = {
    stepA: stepAData,
    stepB: stepBData,
    stepC: stepCData,
    mergedAt: new Date().toISOString(),
  };

  await emit({
    type: "pms.join.complete",
    data: merged,
  });

  await ctx.state.clear(traceId);
}
