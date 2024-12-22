export const subscribe = ["processing.splitpartB"];
export const emits = ["processing.transformedpartB"];

export default async function transformPartB(input, emit) {
  const { partB } = input;
  const transformedB = partB.map((item) => ({
    ...item,
    transformed: true,
    part: "B",
  }));
  await emit({
    type: "processing.transformedpartB",
    data: { transformedB },
  });
}
