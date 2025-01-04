import { randomUUID } from 'crypto'
import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import { Config } from './config.types'
import { Event, EventManager } from './event-manager'
import { Workflow } from './config.types'
import { workflowsEndpoint } from './workflows-endpoint'

export const createServer = (config: Config, workflowSteps: Workflow[], eventManager: EventManager) => {
  const fastify = Fastify()

  console.log('[API] Registering routes', config.api.paths)

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

  for (const path in config.api.paths) {
    const { method, emits } = config.api.paths[path]

    console.log('[API] Registering route', { method, path, emits })

    fastify.route({
      method: method.toUpperCase(),
      url: path,
      handler: asyncHandler(emits),
    })
  }

  fastify.addHook('onRequest', (request, reply, done) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')

    if (request.method === 'OPTIONS') {
      reply.send()
      return
    }

    done()
  })

  workflowsEndpoint(config, workflowSteps, fastify)

  fastify.listen({ port: config.api.port, host: '::' })

  return fastify
}
