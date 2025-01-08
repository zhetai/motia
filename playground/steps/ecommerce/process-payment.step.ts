import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  paymentMethod: z.enum(['credit-card', 'paypal', 'bank-transfer']),
})

export const config: FlowConfig<Input> = {
  name: 'Process Payment',
  description: 'Processes the payment for the order',
  subscribes: ['ecommerce.process-payment'],
  emits: [
    { type: 'ecommerce.confirm-order', label: 'Payment successful', conditional: true },
    { type: 'ecommerce.cancel-order', label: 'Payment failed', conditional: true },
  ],
  input: inputSchema,
  flows: ['ecommerce'],
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  const paymentSuccessful = Math.random() > 0.2

  if (paymentSuccessful) {
    console.log('[Process Payment] Payment successful')

    await emit({
      type: 'ecommerce.confirm-order',
      data: { orderId: 'order-123' },
    })
  } else {
    console.log('[Process Payment] Payment failed')

    await emit({
      type: 'ecommerce.cancel-order',
      data: { orderId: 'order-123' },
    })
  }
}
