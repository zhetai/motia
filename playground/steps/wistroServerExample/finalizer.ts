import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: "Finalizer",
  subscribes: ["ws-server-example.processed"],
  emits: [],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input: unknown) => {
  console.log("[Finalizer] finalizing data:", input);
  // For demonstration, there's no further emit.
  // You could do logging, database calls, etc.
};
