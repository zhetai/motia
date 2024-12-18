export const subscribe = ["greeting.uppercased"];
export const emits = ["greeting.final"];

export default async function greetingExclaimer(input, emit) {
  const exclaimed = input.text + "!!!";
  await emit({ type: "greeting.final", data: { text: exclaimed } });
}
