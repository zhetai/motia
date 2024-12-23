export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["complex.transformedA", "complex.transformedB"];
export const emits = ["complex.merged"];

let tempA = null;
let tempB = null;

export default async function mergeResultsHandler(input, emit, eventType) {
  const { cycleCount } = input;
  if (eventType === "complex.transformedA") {
    tempA = input.transformedA;
  } else if (eventType === "complex.transformedB") {
    tempB = input.transformedB;
  }

  if (tempA && tempB) {
    const merged = [...tempA, ...tempB];
    await emit({ type: "complex.merged", data: { cycleCount, merged } });
    tempA = null;
    tempB = null;
  }
}
