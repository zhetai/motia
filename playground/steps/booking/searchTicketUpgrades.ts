import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  customerPhoneNumber: z.string().min(1),
  section: z.number(),
  row: z.number(),
  seat: z.number(),
})

export const config: FlowConfig<Input> = {
  name: "Search Ticket Upgrades",
  subscribes: ["dbz.evaluate-upgrades"],
  emits: ["dbz.error", "dbz.send-text"],
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

  try {
    const customerResponse = await fetch(
      `https://supreme-voltaic-flyaway.glitch.me/customer/${input.customerPhoneNumber}`
    );

    if (!customerResponse.ok) {
      throw new Error("invalid customer phone number");
    }

    const seatsResponse = await fetch(
      `https://supreme-voltaic-flyaway.glitch.me/seats/upgrade?section=${input.section}&row=${input.row}&seat=${input.seat}`
    );

    if (!seatsResponse.ok) {
      throw new Error("failed to retrieve upgrade seats");
    }

    const { upgradedSeats } = await seatsResponse.json();

    if (!upgradedSeats.length) {
      await emit({
        type: "dbz.send-text",
        data: {
          message: "Sorry, there are no available seats for your venue",
          phoneNumber: input.customerPhoneNumber,
        },
      });
      return;
    }

    const seatList = upgradedSeats
      .map(
        (seat: {
          section: string;
          row: string;
          seat: string;
        }) => `Section: ${seat.section}, Row: ${seat.row}, Seat: ${seat.seat}`
      )
      .join("\n");

    await emit({
      type: "dbz.send-text",
      data: {
        message: `Here are your VIP upgrades:\n${seatList}`,
        phoneNumber: input.customerPhoneNumber,
      },
    });
  } catch (error) {
    await emit({
      type: "dbz.error",
      data: { message: error instanceof Error ? error.message : `unknown error captured check logs traceId:${ctx.traceId}` },
    });
  }
}