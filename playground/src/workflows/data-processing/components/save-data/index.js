export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["processing.joined"];
export const emits = ["processing.saved"];

export default async function saveData(input, emit) {
  const { joinedData } = input;
  await emit({
    type: "processing.saved",
    data: { count: joinedprocessing.length, status: "success" },
  });
}
