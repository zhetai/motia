export const config = {
  name: "Validate Data",
  endpoint: "node-agent",
  subscribes: ["hybrid.received"],
  emits: ["hybrid.validated"],
};

export default async function validateData(input, emit) {
  const data = input.data; // This suggests input should have a 'data' property
  if (!Array.isArray(data)) {
    throw new Error("Input must be an array");
  }

  await emit({
    type: "hybrid.validated",
    data: {
      items: data,
      timestamp: new Date().toISOString(),
    },
  });
}
