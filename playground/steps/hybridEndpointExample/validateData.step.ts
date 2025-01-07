import { FlowConfig, FlowExecutor } from 'wistro'
import { ItemsListSchema } from './items.schema';
import { z } from 'zod';

type Input = typeof inputSchema

const inputSchema = z.object({
  data: ItemsListSchema
});

export const config: FlowConfig<Input> = {
  name: "Validate Data",
  subscribes: ["hybrid.received"],
  emits: ["hybrid.validated"],
  input: inputSchema,
  workflow: "hybrid-example"
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
  await emit({
    type: "hybrid.validated",
    data: {
      items: input.data,
      timestamp: new Date().toISOString(),
    },
  });
}
