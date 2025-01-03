import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({
  userMessage: z.string(),
})

export const config: FlowConfig<Input> = {
  name: "API Caller",
  subscribes: ["handshake.callApi"],
  emits: ["handshake.apiResponse"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
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
