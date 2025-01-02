import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({
  message: z.string(),
})

export const config: FlowConfig<Input> = {
  name: 'OpenAI Response',
  subscribes: ['openai-response'],
  emits: [],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input) => {
  console.log('[OpenAI Response] Received event', input)
}
