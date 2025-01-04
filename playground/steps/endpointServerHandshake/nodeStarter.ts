import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  message: z.string(),
})

export const config: FlowConfig<Input> = {
  name: "Node Starter",
  subscribes: ["handshake.initiate"],
  emits: ["handshake.callApi"],
  input: inputSchema,
  workflow: 'handshake',
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
  console.log("[Node Starter] Received initiate event:", input);
  const userMessage = input.message || "Hello from Node Starter!";
  // Now emit an event telling the server-based component to do an API call
  await emit({
    type: "handshake.callApi",
    data: { userMessage },
  });
};
