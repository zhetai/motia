import { CronManager, setupCronHandlers } from './cron-handler'
import bodyParser from 'body-parser'
import { randomUUID } from 'crypto'
import express, { Express, Request, Response } from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { flowsEndpoint } from './flows-endpoint'
import { isApiStep } from './guards'
import { globalLogger, Logger } from './logger'
import { StateAdapter } from './state/state-adapter'
import { ApiRequest, ApiResponse, ApiRouteConfig, EventManager, Step } from './types'
import { systemSteps } from './steps'
import { LockedData } from './locked-data'
import { callStepFile } from './call-step-file'

export type MotiaServer = {
  app: Express
  server: http.Server
  socketServer: SocketIOServer
  close: () => Promise<void>
  removeRoute: (step: Step<ApiRouteConfig>) => void
  addRoute: (step: Step<ApiRouteConfig>) => void
  cronManager: CronManager
}

export const createServer = async (
  lockedData: LockedData,
  eventManager: EventManager,
  state: StateAdapter,
): Promise<MotiaServer> => {
  const printer = lockedData.printer
  const app = express()
  const server = http.createServer(app)
  const io = new SocketIOServer(server)

  const allSteps = [...systemSteps, ...lockedData.activeSteps]
  const cronManager = setupCronHandlers(lockedData, eventManager, state, io)

  const asyncHandler = (step: Step<ApiRouteConfig>) => {
    return async (req: Request, res: Response) => {
      const traceId = randomUUID()
      const { name, flows } = step.config
      const logger = new Logger(traceId, flows, name, io)

      logger.debug('[API] Received request, processing step', { path: req.path })

      const request: ApiRequest = {
        body: req.body,
        headers: req.headers as Record<string, string | string[]>,
        pathParams: req.params,
        queryParams: req.query as Record<string, string | string[]>,
      }

      try {
        const data = request
        const result = await callStepFile<ApiResponse>({
          contextInFirstArg: false,
          data,
          step,
          printer,
          logger,
          eventManager,
          state,
          traceId,
        })

        if (!result) {
          res.status(500).json({ error: 'Internal server error' })
          return
        }

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

  const router = express.Router()

  const addRoute = (step: Step<ApiRouteConfig>) => {
    const { method, path } = step.config
    globalLogger.debug('[API] Registering route', step.config)

    if (method === 'POST') {
      router.post(path, asyncHandler(step))
    } else if (method === 'GET') {
      router.get(path, asyncHandler(step))
    } else {
      throw new Error(`Unsupported method: ${method}`)
    }
  }

  const removeRoute = (step: Step<ApiRouteConfig>) => {
    const { path, method } = step.config
    const routerStack = router.stack

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredStack = routerStack.filter((layer: any) => {
      if (layer.route) {
        const match = layer.route.path === path && layer.route.methods[method.toLowerCase()]
        return !match
      }
      return true
    })
    router.stack = filteredStack
  }

  allSteps.filter(isApiStep).forEach(addRoute)
  app.use(router)

  flowsEndpoint(lockedData, app)

  server.on('error', (error) => {
    console.error('Server error:', error)
  })

  const close = async (): Promise<void> => {
    cronManager.close()
    await io.close()
    server.close()
  }

  return { app, server, socketServer: io, close, removeRoute, addRoute, cronManager }
}
