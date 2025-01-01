const { randomUUID } = require('crypto')
const Fastify = require('fastify')

module.exports.createServer = (apiConfig, eventManager) => {
  const fastify = Fastify()
  const { paths } = apiConfig

  console.log('[API] Registering routes', paths)

  const asyncHandler = (emits) => {
    return async (req, res) => {
      const traceId = randomUUID()
      const event = {
        traceId,
        metadata: {
          source: 'http',
          path: req.raw.url,
          method: req.raw.method,
          body: req.body,
        },
      }
  
      console.log('[API] Request received', event)
  
      try {
        await eventManager.emit({ type: emits, data: req.body, traceId })
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

  fastify.listen({ port: apiConfig.port, host: '::' });

  return fastify
}