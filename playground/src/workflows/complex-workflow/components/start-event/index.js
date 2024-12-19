export const subscribe = [];
export const emits = ["workflow.start"];

export default async function startEventHandler(_, emit) {
  await emit({ type: "workflow.start", data: { cycleCount: 1, items: [1,2,3,4] } });
}
