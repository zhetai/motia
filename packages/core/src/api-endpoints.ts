import { Express, Response } from 'express'
import zodToJsonSchema from 'zod-to-json-schema'
import { LockedData } from './locked-data'
import { ApiRouteMethod, Step } from './types'
import { ZodObject } from 'zod'
import { isApiStep } from './guards'
import { Server as SocketIOServer } from 'socket.io'

type QueryParam = {
  name: string
  description: string
}

type ApiEndpoint = {
  method: ApiRouteMethod
  path: string
  description?: string
  queryParams?: QueryParam[]
  responseBody?: Record<string, unknown>
  bodySchema?: Record<string, unknown>
}

export const apiEndpoints = (lockedData: LockedData, app: Express, io: SocketIOServer) => {
  const apiStepChange = (step: Step) => {
    if (isApiStep(step)) io.emit('api-endpoint-changed')
  }

  lockedData.onStep('step-created', apiStepChange)
  lockedData.onStep('step-updated', apiStepChange)
  lockedData.onStep('step-removed', apiStepChange)

  app.get('/api-endpoints', (_, res: Response) => {
    const endpoints: ApiEndpoint[] = lockedData.apiSteps().map((step) => ({
      method: step.config.method,
      path: step.config.path,
      description: step.config.description,
      queryParams: step.config.queryParams,
      responseBody:
        step.config.responseBody instanceof ZodObject
          ? zodToJsonSchema(step.config.responseBody)
          : step.config.responseBody,
      bodySchema:
        step.config.bodySchema instanceof ZodObject //
          ? zodToJsonSchema(step.config.bodySchema)
          : step.config.bodySchema,
    }))

    res.status(200).send(endpoints)
  })
}
