export const subscribe = ["data.partA"];
export const emits = ["data.transformedA"];

export default async function transformAHandler(input, emit) {
  const { partA, cycleCount } = input;
  const transformedA = partA.map(item => ({ value: item * 2, source: 'A', cycleCount }));
  await emit({ type: "data.transformedA", data: { cycleCount, transformedA } });
}
