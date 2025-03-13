import { EventConfig, StepHandler } from '@motiadev/core'
import { z } from 'zod'

type Input = typeof inputSchema

const inputSchema = z.object({
  message: z.string({
    description: 'The message to send to OpenAI',
  }),
})

export const config: EventConfig<Input> = {
  type: 'event',
  name: 'Call OpenAI',
  description: 'Call OpenAI',
  subscribes: ['call-openai'],
  emits: [{ topic: 'openai-response', label: 'OpenAI Response' }],
  input: inputSchema,
  flows: ['openai'],
  includeFiles: ['*.txt'],
}

export const handler: StepHandler<typeof config> = async (input, { logger, emit }) => {
  logger.info('[Call OpenAI] Received callOpenAi event', input)

  await emit({
    topic: 'openai-response',
    data: { message: input.message },
  })
}
