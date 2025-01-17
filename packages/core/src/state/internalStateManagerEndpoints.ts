import { Express } from 'express'
import { createStateAdapter } from './createStateAdapter'
import { FileStateAdapter } from './adapters/DefaultStateAdapter'
import path from 'path'
import z from 'zod'

type Input = {
  rootDir: string
  app: Express
}

const basePayloadSchema = z.object({
  key: z.string(),
  traceId: z.string(),
  value: z.optional(z.unknown()),
})

const deletePayloadSchema = z.object({
  key: z.string(),
  traceId: z.string(),
})

export const declareInternalStateManagerEndpoints = ({ app, rootDir }: Input) => {
  const stateAdapter = createStateAdapter({
    adapter: 'default',
    filePath: path.join(rootDir, '.motia'),
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
      console.error('[state manager] failed to set state', error)

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
}
