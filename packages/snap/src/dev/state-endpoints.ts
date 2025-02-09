import { MotiaServer, StateAdapter } from '@motiadev/core'

export const stateEndpoints = (server: MotiaServer, stateAdapter: StateAdapter) => {
  const { app } = server

  app.get('/motia/state', async (_, res) => {
    try {
      const traceIds = await stateAdapter.traceIds()
      res.json(traceIds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })

  app.get('/motia/state/:traceId', async (req, res) => {
    const { traceId } = req.params

    try {
      const keys = await stateAdapter.keys(traceId)
      res.json(keys)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })

  app.get('/motia/state/:traceId/:key', async (req, res) => {
    const { traceId, key } = req.params

    try {
      const value = await stateAdapter.get(traceId, key)
      res.json(value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  })
}
