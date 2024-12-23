export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["processing.splitpartA"];
export const emits = ["processing.transformedpartA"];

export default async function transformPartA(input, emit) {
  const { partA } = input;
  const transformedA = partA.map((item) => ({
    ...item,
    transformed: true,
    part: "A",
  }));
  await emit({ type: "processing.transformedpartA", data: { transformedA } });
}
