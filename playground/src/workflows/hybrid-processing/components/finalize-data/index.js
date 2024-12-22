export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["hybrid.analyzed"];
export const emits = ["hybrid.completed"];

let invocationCount = 0;
export default async function finalizeData(input, emit) {
  invocationCount++;
  console.log("validateData invocation #", invocationCount);
  const { items, analysis, timestamp } = input;

  await emit({
    type: "hybrid.completed",
    data: {
      summary: {
        itemCount: items.length,
        statistics: analysis,
        startTime: timestamp,
        endTime: new Date().toISOString(),
      },
    },
  });
}
