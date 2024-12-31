// playground/src/workflows/parallelMergeState/components/stepB/index.js
export const config = {
  name: "stepB",
  subscribe: ["pms.start"],
  emits: ["pms.stepB.done"],
};

export default async function stepBHandler(input, emit, ctx) {
  const traceId = ctx.traceId;
  console.log("[stepB] received pms.start, traceId =", traceId);

  const partialResultA = { msg: "Hello from Step A", timestamp: Date.now() };
  await ctx.state.set(traceId, "stepB", partialResultA);

  await emit({
    type: "pms.stepB.done",
    data: partialResultA,
  });
}
