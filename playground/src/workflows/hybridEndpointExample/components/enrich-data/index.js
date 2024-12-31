export const config = {
  name: "Enrich Data",
  endpoint: "node-agent",
  subscribes: ["hybrid.transformed"],
  emits: ["hybrid.enriched"],
};

export default async (input, emit) => {
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
};
