// playground/src/workflows/parallelMergeState/components/stepC/index.js
export const config = {
  name: "stepC",
  subscribe: ["pms.start"],
  emits: ["pms.stepC.done"],
};

export default async function stepCHandler(input, emit, ctx) {
  const traceId = ctx.traceId;
  console.log("[stepC] received pms.start, traceId =", traceId);

  const partialResultA = { msg: "Hello from Step A", timestamp: Date.now() };
  await ctx.state.set(traceId, "stepC", partialResultA);

  await emit({
    type: "pms.stepC.done",
    data: partialResultA,
  });
}
