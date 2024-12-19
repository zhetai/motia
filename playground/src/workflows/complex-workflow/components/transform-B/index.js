export const subscribe = ["data.partB"];
export const emits = ["data.transformedB"];

export default async function transformBHandler(input, emit) {
  const { partB, cycleCount } = input;
  const transformedB = partB.map(item => ({ value: item * 3, source: 'B', cycleCount }));
  await emit({ type: "data.transformedB", data: { cycleCount, transformedB } });
}
