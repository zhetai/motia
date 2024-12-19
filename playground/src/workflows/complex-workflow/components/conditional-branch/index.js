export const subscribe = ["data.merged"];
export const emits = ["workflow.finalize", "workflow.start"];

export default async function conditionalBranchHandler(input, emit) {
  const { cycleCount, merged } = input;
  // If cycleCount < 3, let's do another cycle.
  // Else, finalize the workflow.
  if (cycleCount < 3) {
    await emit({ type: "workflow.start", data: { cycleCount: cycleCount + 1, items: [cycleCount+10, cycleCount+20] } });
  } else {
    await emit({ type: "workflow.finalize", data: { merged, message: "Workflow completed" } });
  }
}
