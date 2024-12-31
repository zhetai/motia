// stepA/index.js
export const config = {
  name: "stepA",
  subscribe: ["pms.start"],
  emits: ["pms.stepA.done"],
};

export default async function stepAHandler(input, emit, ctx) {
  const traceId = input.metadata?.workflowTraceId;
  console.log("[stepA] received pms.start, traceId =", traceId);

  // Example partial result
  const partialResultA = { msg: "Hello from Step A", timestamp: Date.now() };

  // Store partial data in workflow state (assuming ctx.state is available)
  await ctx.state.set(traceId, "stepA", partialResultA);

  await emit({
    type: "pms.stepA.done",
    data: {},
    metadata: { workflowTraceId: traceId },
  });
}
