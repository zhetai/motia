export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = [
  "processing.transformedpartA",
  "processing.transformedpartB",
];
export const emits = ["processing.joined"];

let partAData = null;
let partBData = null;

export default async function joinData(input, emit, eventType) {
  if (eventType === "processing.transformedpartA") {
    partAData = input.transformedA;
  }
  if (eventType === "processing.transformedpartB") {
    partBData = input.transformedB;
  }

  if (partAData && partBData) {
    const joinedData = [...partAData, ...partBData];
    await emit({ type: "processing.joined", data: { joinedData } });
    partAData = null;
    partBData = null;
  }
}
