import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: "Start Event",
  subscribes: ["pms.initialize"],
  emits: ["pms.start"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (_, emit) => {
  await emit({
    type: "pms.start",
    data: {},
  });
}
