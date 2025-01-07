import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  cta: z.string().min(1),
})

export const config: FlowConfig<Input> = {
  name: 'Notify User',
  description: 'Notifies the user of an event',
  subscribes: ['ecommerce.notify-user'],
  emits: [],
  input: inputSchema,
  workflow: 'ecommerce',
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  // Here you would integrate with your notification system
  console.log('[Notify User] Sending notification:', {
    userId: input.userId,
    title: input.title,
    description: input.description,
    cta: input.cta,
  })
}
