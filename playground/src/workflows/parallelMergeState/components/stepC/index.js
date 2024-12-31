// stepC/index.js
export const config = {
  name: "stepC",
  subscribe: ["pms.start"],
  emits: ["pms.stepC.done"],
};

export default async function stepCHandler(input, emit, ctx) {
  const traceId = input.metadata?.workflowTraceId;
  console.log("[stepC] received pms.start, traceId =", traceId);

  const partialResultC = { isFinished: true, details: "All done in Step C" };

  await ctx.state.set(traceId, "stepC", partialResultC);

  await emit({
    type: "pms.stepC.done",
    data: {},
    metadata: { workflowTraceId: traceId },
  });
}
