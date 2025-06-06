import { StreamConfig } from 'motia'
import { z } from 'zod'

export const config: StreamConfig = {
  name: 'message',
  schema: z.object({
    message: z.string(),
    from: z.enum(['user', 'assistant']),
    status: z.enum(['created', 'pending', 'completed']),
  }),
  baseConfig: { storageType: 'default' },
}
