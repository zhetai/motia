import { applyMiddleware } from '@wistro/ui/middleware'
import { Server as SocketIOServer } from 'socket.io'
import bodyParser from 'body-parser'
import { randomUUID } from 'crypto'
import express, { Request, Response } from 'express'
import http from 'http'
import { Config, FlowStep } from './config.types'
import { flowsEndpoint } from './flows-endpoint'
import { Event, EventManager, LockFile, WistroServer, WistroSockerServer } from './../wistro.types'
import { globalLogger, Logger } from './logger'

export const createServer = async (
  lockData: LockFile,
  flowSteps: FlowStep[],
  eventManager: EventManager,
  options?: {
    skipSocketServer?: boolean
  },
): Promise<{ server: WistroServer; socketServer?: WistroSockerServer }> => {
  const app = express()
  const server = http.createServer(app)
  let io: SocketIOServer | undefined

  if (!options?.skipSocketServer) {
    globalLogger.debug('[API] Creating socket server')
    io = new SocketIOServer(server)
  }

  const { api } = lockData.triggers

  globalLogger.debug('[API] Registering routes', { paths: api.paths })

  const asyncHandler = (emits: string, flows: string[]) => {
    return async (req: Request, res: Response) => {
      const traceId = randomUUID()
      const logger = new Logger(traceId, flows, io)
      const event: Omit<Event<unknown>, 'logger'> = {
        traceId,
        flows,
        type: emits,
        data: req.body,
      }

      globalLogger.debug('[API] Request received', { event })

      try {
        await eventManager.emit({ ...event, logger })
        res.send({ success: true, eventType: emits, traceId })
      } catch (error) {
        console.error('[API] Error emitting event', error)
        res.status(500).send({ error: 'Internal server error' })
      }
    }
  }

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  for (const path in api.paths) {
    const { method, emits, flows } = api.paths[path]

    globalLogger.debug('[API] Registering route', { method, path, emits })

    if (method === 'POST') {
      app.post(path, asyncHandler(emits, flows))
    } else if (method === 'GET') {
      app.get(path, asyncHandler(emits, flows))
    } else {
      throw new Error(`Unsupported method: ${method}`)
    }
  }

  flowsEndpoint(lockData, flowSteps, app)
  await applyMiddleware(app)

  globalLogger.debug('[API] Server listening on port', lockData.port)

  server.listen(lockData.port)

  return { server, socketServer: io }
}
