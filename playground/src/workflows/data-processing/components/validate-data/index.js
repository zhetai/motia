export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["processing.uploaded"];
export const emits = ["processing.validated"];

export default async function validateData(input, emit) {
  const { rawData } = input;
  const isValid = Boolean(rawData && rawData.length > 0);

  if (isValid) {
    await emit({ type: "processing.validated", data: { rawData } });
  } else {
    console.error("Data validation failed. No data emitted.");
  }
}
