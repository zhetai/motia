export const subscribe = ["data.transformed.partA", "data.transformed.partB"];
export const emits = ["data.joined"];

let partAData = null;
let partBData = null;

export default async function joinData(input, emit, eventType) {
  if (eventType === "data.transformed.partA") {
    partAData = input.transformedA;
  }
  if (eventType === "data.transformed.partB") {
    partBData = input.transformedB;
  }

  if (partAData && partBData) {
    const joinedData = [...partAData, ...partBData];
    await emit({ type: "data.joined", data: { joinedData } });
    partAData = null;
    partBData = null;
  }
}
