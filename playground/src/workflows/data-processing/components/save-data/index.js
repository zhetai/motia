export const subscribe = ["data.joined"];
export const emits = ["data.saved"];

export default async function saveData(input, emit) {
  const { joinedData } = input;
  console.log("Saving data:", joinedData);
  await emit({ type: "data.saved", data: { count: joinedData.length, status: "success" } });
}
