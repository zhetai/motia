import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  venuePhoneNumber: z.string().min(1),
  customerPhoneNumber: z.string().min(1),
})

export const config: FlowConfig<Input> = {
  name: "Initialize",
  subscribes: ["dbz.initialize"],
  emits: ["dbz.search-customer", "dbz.error"],
  input: inputSchema,
  workflow: 'booking'
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  const validation = inputSchema.safeParse(input);

  if (!validation.success) {
    await emit({
      type: "dbz.error",
      data: { message: "input validation error" },
    });
    return;
  }

  await ctx.state.set('123', 'test', 'ping');

  await emit({
    type: "dbz.search-customer",
    data: {
      venuePhoneNumber: input.venuePhoneNumber,
      customerPhoneNumber: input.customerPhoneNumber,
    },
  });
}