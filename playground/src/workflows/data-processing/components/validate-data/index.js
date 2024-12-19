export const subscribe = ["data.uploaded"];
export const emits = ["data.validated"];

export default async function validateData(input, emit) {
  const { rawData } = input;
  const isValid = Boolean(rawData && rawData.length > 0);

  if (isValid) {
    await emit({ type: "data.validated", data: { rawData } });
  } else {
    console.error("Data validation failed. No data emitted.");
  }
}
