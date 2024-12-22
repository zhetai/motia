export const subscribe = ["processing.validated"];
export const emits = ["processing.split.partA", "processing.split.partB"];

export default async function splitData(input, emit) {
  const { rawData } = input;
  const mid = Math.floor(rawData.length / 2);
  const partA = rawData.slice(0, mid);
  const partB = rawData.slice(mid);

  await emit({ type: "processing.split.partA", data: { partA } });
  await emit({ type: "processing.split.partB", data: { partB } });
}
