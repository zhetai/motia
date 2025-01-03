import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'
import { SharedFlowInputSchema } from './items.schema'

type Input = typeof inputSchema

const inputSchema = SharedFlowInputSchema

export const config: FlowConfig<Input> = {
  name: "Enrich Data",
  subscribes: ["hybrid.transformed"],
  emits: ["hybrid.enriched"],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
  const enriched = input.items.map((item) => ({
    ...item,
    enriched_by: "node",
    processed_at: new Date().toISOString(),
  }));

  await emit({
    type: "hybrid.enriched",
    data: {
      items: enriched,
      timestamp: input.timestamp,
    },
  });
};
