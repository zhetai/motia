export const subscribe = ["workflow.finalize"];
export const emits = ["workflow.done"];

export default async function finalizeHandler(input, emit) {
  const { merged, message } = input;
  console.log("Finalizing workflow:", { merged, message });
  await emit({ type: "workflow.done", data: { status: "success", resultCount: merged.length } });
}
