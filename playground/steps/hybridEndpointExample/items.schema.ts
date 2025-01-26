import { z } from 'zod'

export const ItemsListSchema = z.array(
  z.object({
    enriched_by: z.string(),
    processed_at: z.string(),
  }),
)

export const SharedFlowInputSchema = z.object({
  items: ItemsListSchema,
  timestamp: z.number(),
  analysis: z.object({
    total: z.number(),
    average: z.number(),
    count: z.number(),
    analyzed_by: z.string(),
  }),
})
