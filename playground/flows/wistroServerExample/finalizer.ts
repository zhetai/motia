export const config = {
  name: "Finalizer",
  // endpoint: "wistro-server",
  subscribes: ["ws-server-example.processed"],
  emits: [],
};

export default async (input: unknown) => {
  console.log("[Finalizer] finalizing data:", input);
  // For demonstration, there's no further emit.
  // You could do logging, database calls, etc.
};
