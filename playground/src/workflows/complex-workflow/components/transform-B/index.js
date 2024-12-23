export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["complex.partB"];
export const emits = ["complex.transformedB"];

export default async function transformBHandler(input, emit) {
  const { partB, cycleCount } = input;
  const transformedB = partB.map((item) => ({
    value: item * 3,
    source: "B",
    cycleCount,
  }));
  await emit({
    type: "complex.transformedB",
    data: { cycleCount, transformedB },
  });
}
