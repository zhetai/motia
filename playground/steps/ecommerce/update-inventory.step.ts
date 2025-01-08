import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'

type Input = typeof inputSchema

const inputSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().min(1),
})

export const config: FlowConfig<Input> = {
  name: 'Update Inventory',
  description: 'Updates the inventory for the order',
  subscribes: ['ecommerce.update-inventory'],
  emits: [],
  input: inputSchema,
  flows: ['ecommerce'],
}

export const executor: FlowExecutor<Input> = async (input, emit, ctx) => {
  // Here you would integrate with your inventory management system
  console.log('[Update Inventory] Updating inventory:', {
    sku: input.sku,
    quantity: input.quantity,
  })
}
