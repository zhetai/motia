import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: "Start Event",
  subscribes: ["ws-server-example.trigger"],
  emits: ["ws-server-example.start"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (_, emit) => {
  console.log(
    "[WISTRO_SERVER_EXAMPLE] start-event is loaded from:",
    // import.meta.url
  );
  console.log("[Start Event] triggered via /api/wistro-server-example");
  await emit({
    type: "ws-server-example.start",
    data: { message: "The workflow has been started!" },
  });
};
