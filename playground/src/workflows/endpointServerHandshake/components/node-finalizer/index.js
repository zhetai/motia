export const config = {
  name: "Node Finalizer",
  endpoint: "node-endpoint",
  subscribes: ["handshake.apiResponse"],
  emits: [],
};

export default async (input) => {
  console.log("[Node Finalizer] Received final API response:", input);
  // This is our last step. We won't emit any more events.
};
