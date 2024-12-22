export const subscribe = ["processing.split.partA"];
export const emits = ["processing.transformed.partA"];

export default async function transformPartA(input, emit) {
  const { partA } = input;
  const transformedA = partA.map((item) => ({
    ...item,
    transformed: true,
    part: "A",
  }));
  await emit({ type: "processing.transformed.partA", data: { transformedA } });
}
