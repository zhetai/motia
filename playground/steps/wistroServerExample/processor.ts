import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({
  message: z.string(),
})

export const config: FlowConfig<Input> = {
  name: "Processor",
  subscribes: ["ws-server-example.start"],
  emits: ["ws-server-example.processed"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
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
