import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().min(1),
})

export const config: FlowConfig<Input> = {
  name: 'Release Stock',
  description: 'Releases reserved stock',
  subscribes: ['ecommerce.release-stock'],
  emits: [],
  input: inputSchema,
  flows: ['ecommerce'],
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  console.log('[Release Stock] Stock released:', input.sku, input.quantity)
}
