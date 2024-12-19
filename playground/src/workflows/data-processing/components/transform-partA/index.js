export const subscribe = ["data.split.partA"];
export const emits = ["data.transformed.partA"];

export default async function transformPartA(input, emit) {
  const { partA } = input;
  const transformedA = partA.map(item => ({ ...item, transformed: true, part: 'A' }));
  await emit({ type: "data.transformed.partA", data: { transformedA } });
}
