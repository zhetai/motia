export const config = {
  name: "API Caller",
  // No 'endpoint' or 'runtime' => runs on the Wistro server by default
  subscribes: ["handshake.callApi"],
  emits: ["handshake.apiResponse"],
};

export default async (input, emit) => {
  console.log("[API Caller] Received callApi event:", input);

  // For demonstration, let's fetch from a public JSON placeholder API:
  const fetch = await import("node-fetch").then((mod) => mod.default || mod);
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const json = await response.json();

  // Combine userMessage + external API result
  const result = {
    externalTodo: json, // e.g. { userId, id, title, completed }
    userMessage: input.userMessage,
  };

  console.log("[API Caller] External API result:", result);

  await emit({
    type: "handshake.apiResponse",
    data: result,
  });
};
