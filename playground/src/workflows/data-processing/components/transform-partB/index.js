export const subscribe = ["processing.split.partB"];
export const emits = ["processing.transformed.partB"];

export default async function transformPartB(input, emit) {
  const { partB } = input;
  const transformedB = partB.map((item) => ({
    ...item,
    transformed: true,
    part: "B",
  }));
  await emit({
    type: "processing.transformed.partB",
    data: { transformedB },
  });
}
