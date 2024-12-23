export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["complex.done"];
export const emits = ["complex.start"];

export default async function repeatTriggerHandler(input, emit) {
  const { resultCount } = input;
  if (resultCount < 10) {
    await emit({
      type: "complex.start",
      data: { cycleCount: 1, items: [42, 43, 44] },
    });
  }
}
