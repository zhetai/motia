import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  venuePhoneNumber: z.string(),
  customerPhoneNumber: z.string(),
})

export const config: FlowConfig<Input> = {
  name: "Search Customer",
  subscribes: ["dbz.search-customer"],
  emits: ["dbz.send-text", "dbz.error"],
  input: inputSchema,
  workflow: 'booking'
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  const { venuePhoneNumber, customerPhoneNumber } = input;

  try {
    const cachedValue = await ctx.state.get('123', 'test');

    if (cachedValue !== 'ping') {
      throw new Error('state adapter not working');
    }

    await ctx.state.clear('123');

    const venueResponse = await fetch(
      `https://supreme-voltaic-flyaway.glitch.me/venue/${venuePhoneNumber}`
    );

    if (!venueResponse.ok) {
      throw new Error("venue not found");
    }

    const venue = await venueResponse.json();

    let customerResponse = await fetch(
      `https://supreme-voltaic-flyaway.glitch.me/customer/${customerPhoneNumber}`
    );

    if (!customerResponse.ok) {
      const createCustomerResponse = await fetch(
        `https://supreme-voltaic-flyaway.glitch.me/customer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: customerPhoneNumber }),
        }
      );

      if (!createCustomerResponse.ok) {
        throw new Error("failed to create customer");
      }

      customerResponse = await createCustomerResponse;
    }

    const customer = await customerResponse.json();

    await emit({
      type: "dbz.send-text",
      data: {
        message: `Welcome ${customer.name}, can you provide your seat, row, and ticket numbers please?`,
        phoneNumber: customerPhoneNumber,
      },
    });
  } catch (error: unknown) {
    await emit({
      type: "dbz.error",
      data: { message: error instanceof Error ? error.message : `unknown error captured check logs traceId:${ctx.traceId}` },
    });
  }
}