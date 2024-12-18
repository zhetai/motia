export const subscribe = ["workflow.start"];

export default async function greetingGenerator(input, emit) {
  await emit({ type: "greeting.generated", data: { text: "hello" } });
}
