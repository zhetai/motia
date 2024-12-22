export const subscribe = [
  "processing.transformed.partA",
  "processing.transformed.partB",
];
export const emits = ["processing.joined"];

let partAData = null;
let partBData = null;

export default async function joinData(input, emit, eventType) {
  if (eventType === "processing.transformed.partA") {
    partAData = input.transformedA;
  }
  if (eventType === "processing.transformed.partB") {
    partBData = input.transformedB;
  }

  if (partAData && partBData) {
    const joinedData = [...partAData, ...partBData];
    await emit({ type: "processing.joined", data: { joinedData } });
    partAData = null;
    partBData = null;
  }
}
