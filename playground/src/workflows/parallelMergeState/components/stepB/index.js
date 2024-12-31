// stepB/index.js
export const config = {
  name: "stepB",
  subscribe: ["pms.start"],
  emits: ["pms.stepB.done"],
};

export default async function stepBHandler(input, emit, ctx) {
  const traceId = input.metadata?.workflowTraceId;
  console.log("[stepB] received pms.start, traceId =", traceId);

  const partialResultB = { data: "Step B complete", value: 42 };

  await ctx.state.set(traceId, "stepB", partialResultB);

  await emit({
    type: "pms.stepB.done",
    data: {},
    metadata: { workflowTraceId: traceId },
  });
}
