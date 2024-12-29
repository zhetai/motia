export const config = {
  name: "Processor",
  // endpoint: "wistro-server",
  subscribes: ["ws-server-example.start"],
  emits: ["ws-server-example.processed"],
};

export default async (input, emit) => {
  console.log("[Processor] received:", input);
  // Just an example: reverse the message string
  const reversed = input.message
    ? input.message.split("").reverse().join("")
    : "(no input.message)";

  await emit({
    type: "ws-server-example.processed",
    data: { reversed },
  });
};
