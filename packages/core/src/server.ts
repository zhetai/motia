import { applyMiddleware } from '@motia/workbench/middleware'
import bodyParser from 'body-parser'
import { randomUUID } from 'crypto'
import express, { Request, Response } from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { StateAdapter } from './state/StateAdapter'
import {
  ApiRequest,
  ApiRouteHandler,
  EmitData,
  EventManager,
  LockedData,
  Step,
  MotiaServer,
  MotiaSocketServer,
} from './types'
import { flowsEndpoint } from './flows-endpoint'
import { isApiStep } from './guards'
import { globalLogger, Logger } from './logger'

type ServerOptions = {
  steps: Step[]
  flows: LockedData['flows']
  state: StateAdapter
  eventManager: EventManager
  port: number
  skipSocketServer?: boolean
}

export const createServer = async (
  options: ServerOptions,
): Promise<{ server: MotiaServer; socketServer?: MotiaSocketServer }> => {
  const { steps, state, eventManager, port, skipSocketServer } = options
  const app = express()
  const server = http.createServer(app)
  let io: SocketIOServer | undefined

  if (!skipSocketServer) {
    globalLogger.debug('[API] Creating socket server')
    io = new SocketIOServer(server)
  }

  const asyncHandler = (step: Step, flows: string[]) => {
    return async (req: Request, res: Response) => {
      const traceId = randomUUID()
      const logger = new Logger(traceId, flows, step.config.name, io)

      logger.debug('[API] Received request, processing step', { path: req.path, step })

      const module = require(step.filePath)
      const handler = module.handler as ApiRouteHandler
      const request: ApiRequest = {
        body: req.body,
        headers: req.headers as Record<string, string | string[]>,
        pathParams: req.params,
        queryParams: req.query as Record<string, string | string[]>,
      }
      const emit = async (event: EmitData) => {
        await eventManager.emit(
          {
            data: event.data,
            type: event.type,
            traceId,
            flows,
            logger,
          },
          step.filePath,
        )
      }

      try {
        const result = await handler(request, { emit, state, logger, traceId })

        if (result.headers) {
          Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value))
        }

        res.status(result.status)
        res.json(result.body)
      } catch (error) {
        logger.error('[API] Internal server error', { error })
        console.log(error)
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  const apiSteps = steps.filter(isApiStep)

  for (const step of apiSteps) {
    const { method, flows, path } = step.config

    globalLogger.debug('[API] Registering route', step.config)

    if (method === 'POST') {
      app.post(path, asyncHandler(step, flows))
    } else if (method === 'GET') {
      app.get(path, asyncHandler(step, flows))
    } else {
      throw new Error(`Unsupported method: ${method}`)
    }
  }

  flowsEndpoint(options.flows, app)
  await applyMiddleware(app)

  server.listen(port)

  return { server, socketServer: io }
}
