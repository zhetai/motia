// join-step/index.js
export const config = {
  name: "join-step",
  subscribe: [
    "pms.stepA.done",
    "pms.stepB.done",
    "pms.stepC.done",
  ],
  emits: ["pms.join.complete"],
};

export default async function joinStepHandler(input, emit, ctx) {
  const traceId = input.metadata?.workflowTraceId || "unknown";
  console.log("[join-step] Checking if all partial results exist for traceId =", traceId);

  // Retrieve partial data for A, B, C
  const stepAData = await ctx.state.get(traceId, "stepA");
  const stepBData = await ctx.state.get(traceId, "stepB");
  const stepCData = await ctx.state.get(traceId, "stepC");

  if (!stepAData || !stepBData || !stepCData) {
    console.log("[join-step] Not all steps done yet, ignoring for now.");
    return;
  }

  // Merge data once all are present
  console.log("[join-step] All steps are complete. Merging results...");
  const merged = {
    stepA: stepAData,
    stepB: stepBData,
    stepC: stepCData,
    mergedAt: new Date().toISOString(),
  };

  // Optionally store the merged result
  await ctx.state.set(traceId, "mergedResult", merged);

  // Emit final event
  await emit({
    type: "pms.join.complete",
    data: merged,
    metadata: { workflowTraceId: traceId },
  });

  // Optionally cleanup state
  // await ctx.state.remove(traceId, "stepA");
  // await ctx.state.remove(traceId, "stepB");
  // await ctx.state.remove(traceId, "stepC");
}
