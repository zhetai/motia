export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["complex.merged"];
export const emits = ["complex.finalize", "complex.start"];

export default async function conditionalBranchHandler(input, emit) {
  const { cycleCount, merged } = input;
  // If cycleCount < 3, let's do another cycle.
  // Else, finalize the complex.
  if (cycleCount < 3) {
    await emit({
      type: "complex.start",
      data: {
        cycleCount: cycleCount + 1,
        items: [cycleCount + 10, cycleCount + 20],
      },
    });
  } else {
    await emit({
      type: "complex.finalize",
      data: { merged, message: "Workflow completed" },
    });
  }
}
