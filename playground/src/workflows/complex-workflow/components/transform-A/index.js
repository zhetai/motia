export const subscribe = ["complex.data.partA"];
export const emits = ["complex.transformedA"];

export default async function transformAHandler(input, emit) {
  const { partA, cycleCount } = input;
  const transformedA = partA.map((item) => ({
    value: item * 2,
    source: "A",
    cycleCount,
  }));
  await emit({
    type: "complex.transformedA",
    data: { cycleCount, transformedA },
  });
}
