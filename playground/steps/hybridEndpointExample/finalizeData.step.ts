import { FlowConfig, FlowExecutor } from 'wistro'
import { SharedFlowInputSchema } from './items.schema';

type Input = typeof inputSchema

const inputSchema = SharedFlowInputSchema;

export const config: FlowConfig<Input> = {
  name: "Fanialize Data",
  subscribes: ["hybrid.analyzed"],
  emits: ["hybrid.completed"],
  input: inputSchema,
  workflow: "hybrid-example"
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
  const { items, analysis, timestamp } = input;

  await emit({
    type: "hybrid.completed",
    data: {
      summary: {
        itemCount: items.length,
        statistics: analysis,
        startTime: timestamp,
        endTime: new Date().toISOString(),
      },
    },
  });
};
