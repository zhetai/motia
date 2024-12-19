export const subscribe = ["data.transformedA", "data.transformedB"];
export const emits = ["data.merged"];

let tempA = null;
let tempB = null;

export default async function mergeResultsHandler(input, emit, eventType) {
  const { cycleCount } = input;
  if (eventType === "data.transformedA") {
    tempA = input.transformedA;
  } else if (eventType === "data.transformedB") {
    tempB = input.transformedB;
  }

  if (tempA && tempB) {
    const merged = [...tempA, ...tempB];
    await emit({ type: "data.merged", data: { cycleCount, merged } });
    tempA = null;
    tempB = null;
  }
}
