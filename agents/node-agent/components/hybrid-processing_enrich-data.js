export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["hybrid.transformed"];
export const emits = ["hybrid.enriched"];

let invocationCount = 0;
export default async function enrichData(input, emit) {
  invocationCount++;
  console.log("validateData invocation #", invocationCount);
  const enriched = input.items.map((item) => ({
    ...item,
    enriched_by: "node",
    processed_at: new Date().toISOString(),
  }));

  await emit({
    type: "hybrid.enriched",
    data: {
      items: enriched,
      timestamp: input.timestamp,
    },
  });
}
