import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro2'

type Input = typeof inputSchema

const inputSchema = z.object({
  message: z.string(),
})

export const config: FlowConfig<Input> = {
  name: 'Call OpenAI',
  subscribes: ['call-openai'],
  emits: ['openai-response'],
  input: inputSchema,
}

export const executor: FlowExecutor<Input> = async (input, emit) => {
  console.log('[Call OpenAI] Received callOpenAi event:', input)

  await emit({
    type: 'openai-response',
    data: { message: input.message },
  })
}
