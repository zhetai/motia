export const subscribe = ["data.validated"];
export const emits = ["data.split.partA", "data.split.partB"];

export default async function splitData(input, emit) {
  const { rawData } = input;
  const mid = Math.floor(rawData.length / 2);
  const partA = rawData.slice(0, mid);
  const partB = rawData.slice(mid);

  await emit({ type: "data.split.partA", data: { partA } });
  await emit({ type: "data.split.partB", data: { partB } });
}
