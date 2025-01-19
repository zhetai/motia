import { Express } from 'express'
import { createStateAdapter } from './create-state-adapter'
import { FileStateAdapter } from './adapters/default-state-adapter'
import path from 'path'
import z from 'zod'

const basePayloadSchema = z.object({
  key: z.string(),
  traceId: z.string(),
  value: z.optional(z.unknown()),
})

const deletePayloadSchema = z.object({ key: z.string(), traceId: z.string() })
const clearPayloadSchema = z.object({ traceId: z.string() })

export const declareInternalStateManagerEndpoints = (app: Express) => {
  const stateAdapter = createStateAdapter({
    adapter: 'default',
    filePath: path.join(process.cwd(), '.motia'),
  }) as FileStateAdapter

  stateAdapter.init()

  app.post('/state-manager/get', async (req, res) => {
    try {
      const { key, traceId } = basePayloadSchema.parse(req.body)
      const result = await stateAdapter.get(traceId, key)
      res.status(200).json({ data: result })
    } catch (error: unknown) {
      console.error('[state manager] failed getting state', error)

      res.status(400).json({ error: error instanceof Error ? error?.message : 'unkown error occurred' })
    }
  })

  app.post('/state-manager/set', async (req, res) => {
    try {
      const { key, traceId, value } = basePayloadSchema.parse(req.body)
      await stateAdapter.set(traceId, key, value)
      res.status(200).json({})
    } catch (error: unknown) {
      console.error('[state manager] failed to set state', { error: JSON.stringify(error, null, 2) })

      res.status(400).json({ error: error instanceof Error ? error?.message : 'unkown error occurred' })
    }
  })

  app.post('/state-manager/delete', async (req, res) => {
    try {
      const { key, traceId } = deletePayloadSchema.parse(req.body)
      await stateAdapter.delete(traceId, key)
      res.status(200).json({})
    } catch (error: unknown) {
      console.error('[state manager] failed to delete from state', error)

      res.status(400).json({ error: error instanceof Error ? error?.message : 'unkown error occurred' })
    }
  })

  app.post('/state-manager/clear', async (req, res) => {
    try {
      const { traceId } = clearPayloadSchema.parse(req.body)
      await stateAdapter.clear(traceId)
      res.status(200).json({})
    } catch (error: unknown) {
      console.error('[state manager] failed to clear state', error)

      res.status(400).json({ error: error instanceof Error ? error?.message : 'unkown error occurred' })
    }
  })
}
