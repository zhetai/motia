export const subscribe = ["example.event"];
export const emits = ["example.response"];

export default async function simpleNodeHandler(input, emit) {
  await emit({
    type: "example.response",
    data: { message: "Hello from example-workflow!" },
  });
}
