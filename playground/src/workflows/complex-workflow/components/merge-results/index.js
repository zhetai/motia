export const subscribe = ["processing.transformedA", "processing.transformedB"];
export const emits = ["processing.merged"];

let tempA = null;
let tempB = null;

export default async function mergeResultsHandler(input, emit, eventType) {
  const { cycleCount } = input;
  if (eventType === "processing.transformedA") {
    tempA = input.transformedA;
  } else if (eventType === "processing.transformedB") {
    tempB = input.transformedB;
  }

  if (tempA && tempB) {
    const merged = [...tempA, ...tempB];
    await emit({ type: "processing.merged", data: { cycleCount, merged } });
    tempA = null;
    tempB = null;
  }
}
