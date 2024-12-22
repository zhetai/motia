export const subscribe = ["processing.partA", "processing.partB"];
export const emits = ["processing.joined"];

let partAData = null;
let partBData = null;

export default async function joinData(input, emit, eventType) {
  if (eventType === "processing.partA") {
    partAData = input.transformedA;
  }
  if (eventType === "processing.partB") {
    partBData = input.transformedB;
  }

  if (partAData && partBData) {
    const joinedData = [...partAData, ...partBData];
    await emit({ type: "processing.joined", data: { joinedData } });
    partAData = null;
    partBData = null;
  }
}
