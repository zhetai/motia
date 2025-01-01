import { z, ZodObject } from 'zod'

export type Emitter = (event: any) => Promise<void>;
export type FlowExecutor<TInput extends ZodObject<any>> = (input: z.infer<TInput>, emit: Emitter) => Promise<void>;

export type FlowConfig<TInput extends ZodObject<any>> = {
  name: string;
  subscribes: string[];
  emits: string[];
  input: TInput;
};

export type Flow<TInput extends ZodObject<any>> = {
  config: FlowConfig<TInput>;
  executor: FlowExecutor<TInput>;
};
