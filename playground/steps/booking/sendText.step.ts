import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  phoneNumber: z.string(),
    message: z.string(),
})

export const config: FlowConfig<Input> = {
  name: "Send SMS",
  subscribes: ["dbz.send-text"],
  emits: ["dbz.error"],
  input: inputSchema,
  workflow: 'booking'
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  try {
    const response = await fetch(
      `https://supreme-voltaic-flyaway.glitch.me/send-sms`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: input.phoneNumber, message: input.message }),
      }
    );

    if (!response.ok) {
      console.error('failed to send text', {
        error: await response.text(),
      })
      throw new Error("failed to send text message");
    }

  } catch (error) {
    await emit({
      type: "dbz.error",
      data: { message: error instanceof Error ? error.message : `unknown error captured check logs traceId:${ctx.traceId}` },
    });
  }
}