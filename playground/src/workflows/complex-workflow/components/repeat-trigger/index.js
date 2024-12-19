export const subscribe = ["workflow.done"];
export const emits = ["workflow.start"];

export default async function repeatTriggerHandler(input, emit) {
  const { resultCount } = input;
  if (resultCount < 10) {
    await emit({ type: "workflow.start", data: { cycleCount: 1, items: [42,43,44] } });
  }
}
