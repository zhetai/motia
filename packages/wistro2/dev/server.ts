import { randomUUID } from 'crypto'
import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import { ApiConfig } from './config.types'
import { Event, EventManager } from './event-manager'

export const createServer = (apiConfig: ApiConfig, eventManager: EventManager) => {
  const fastify = Fastify()
  const { paths } = apiConfig

  console.log('[API] Registering routes', paths)

  const asyncHandler = (emits: string) => {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const traceId = randomUUID()
      const event: Event<unknown> = {
        traceId,
        type: emits,
        data: req.body,
      }

      console.log('[API] Request received', event)

      try {
        await eventManager.emit(event)
        res.send({ success: true, eventType: emits, traceId })
      } catch (error) {
        console.error('[API] Error emitting event', error)
        res.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  for (const path in paths) {
    const { method, emits } = paths[path]

    console.log('[API] Registering route', { method, path, emits })

    fastify.route({
      method: method.toUpperCase(),
      url: path,
      handler: asyncHandler(emits),
    })
  }

  fastify.listen({ port: apiConfig.port, host: '::' })

  return fastify
}
