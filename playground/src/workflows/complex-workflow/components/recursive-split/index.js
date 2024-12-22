export const subscribe = ["complex.start"];
export const emits = ["processing.partA", "processing.partB", "complex.start"];

export default async function recursiveSplitHandler(input, emit) {
  const { cycleCount, items } = input;

  const mid = Math.floor(items.length / 2);
  const partA = items.slice(0, mid);
  const partB = items.slice(mid);

  await emit({ type: "processing.partA", data: { cycleCount, partA } });
  await emit({ type: "processing.partB", data: { cycleCount, partB } });

  // If cycleCount < 3, re-emit the workflow.start to simulate recursion
  if (cycleCount < 3) {
    await emit({
      type: "complex.start",
      data: {
        cycleCount: cycleCount + 1,
        items: [cycleCount + 1, cycleCount + 2, cycleCount + 3, cycleCount + 4],
      },
    });
  }
}
