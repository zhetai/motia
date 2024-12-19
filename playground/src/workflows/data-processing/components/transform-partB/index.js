export const subscribe = ["data.split.partB"];
export const emits = ["data.transformed.partB"];

export default async function transformPartB(input, emit) {
  const { partB } = input;
  const transformedB = partB.map(item => ({ ...item, transformed: true, part: 'B' }));
  await emit({ type: "data.transformed.partB", data: { transformedB } });
}
