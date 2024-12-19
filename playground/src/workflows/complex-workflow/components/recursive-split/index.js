export const subscribe = ["workflow.start"];
export const emits = ["data.partA", "data.partB", "workflow.start"];

export default async function recursiveSplitHandler(input, emit) {
  const { cycleCount, items } = input;

  const mid = Math.floor(items.length / 2);
  const partA = items.slice(0, mid);
  const partB = items.slice(mid);

  await emit({ type: "data.partA", data: { cycleCount, partA } });
  await emit({ type: "data.partB", data: { cycleCount, partB } });

  // If cycleCount < 3, re-emit the workflow.start to simulate recursion
  if (cycleCount < 3) {
    await emit({ type: "workflow.start", data: { cycleCount: cycleCount + 1, items: [cycleCount+1, cycleCount+2, cycleCount+3, cycleCount+4] } });
  }
}
