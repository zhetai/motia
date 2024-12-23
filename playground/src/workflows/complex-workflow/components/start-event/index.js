export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = [];
export const emits = ["complex.start"];

export default async function startEventHandler(_, emit) {
  await emit({
    type: "complex.start",
    data: { cycleCount: 1, items: [1, 2, 3, 4] },
  });
}
