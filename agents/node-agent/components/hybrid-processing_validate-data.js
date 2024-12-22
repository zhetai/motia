export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["hybrid.received"];
export const emits = ["hybrid.validated"];

let invocationCount = 0;
export default async function validateData(input, emit) {
  invocationCount++;
  console.log("validateData invocation #", invocationCount);
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
