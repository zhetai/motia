import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({});

export const config: FlowConfig<Input> = {
  name: "Node Finalizer",
  subscribes: ["handshake.apiResponse"],
  emits: [],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input) => {
  console.log("[Node Finalizer] Received final API response:", input);
  // This is our last step. We won't emit any more events.
};
