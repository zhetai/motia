export const metadata = {
  runtime: "node",
  agent: "node-agent",
};

export const subscribe = ["complex.finalize"];
export const emits = ["complex.done"];

export default async function finalizeHandler(input, emit) {
  const { merged, message } = input;
  await emit({
    type: "complex.done",
    data: { status: "success", resultCount: merged.length },
  });
}
