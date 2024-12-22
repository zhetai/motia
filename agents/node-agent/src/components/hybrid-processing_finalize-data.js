export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["hybrid.analyzed"];
export const emits = ["hybrid.completed"];

export default async function finalizeData(input, emit) {
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
