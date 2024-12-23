export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["processing.validated"];
export const emits = ["processing.splitpartA", "processing.splitpartB"];

export default async function splitData(input, emit) {
  const { rawData } = input;
  const mid = Math.floor(rawData.length / 2);
  const partA = rawData.slice(0, mid);
  const partB = rawData.slice(mid);

  await emit({ type: "processing.splitpartA", data: { partA } });
  await emit({ type: "processing.splitpartB", data: { partB } });
}
