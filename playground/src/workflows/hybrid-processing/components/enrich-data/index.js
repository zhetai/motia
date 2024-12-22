export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["hybrid.transformed"];
export const emits = ["hybrid.enriched"];

export default async function enrichData(input, emit) {
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
