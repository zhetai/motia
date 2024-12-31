// playground/src/workflows/parallelMergeState/components/stepA/index.js
export const config = {
  name: "stepA",
  subscribe: ["pms.start"],
  emits: ["pms.stepA.done"],
};

export default async function stepAHandler(input, emit, ctx) {
  const traceId = ctx.traceId;
  console.log("[stepA] received pms.start, traceId =", traceId);

  const partialResultA = { msg: "Hello from Step A", timestamp: Date.now() };
  await ctx.state.set(traceId, "stepA", partialResultA);

  await emit({
    type: "pms.stepA.done",
    data: partialResultA,
  });
}
