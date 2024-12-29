export const config = {
  name: "Node Starter",
  endpoint: "node-agent", // This indicates the node endpoint
  subscribes: ["handshake.initiate"],
  emits: ["handshake.callApi"],
};

export default async (input, emit) => {
  console.log("[Node Starter] Received initiate event:", input);
  const userMessage = input.message || "Hello from Node Starter!";
  // Now emit an event telling the server-based component to do an API call
  await emit({
    type: "handshake.callApi",
    data: { userMessage },
  });
};
