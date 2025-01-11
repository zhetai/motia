import { Express } from 'express'
import { ApiRoute, Config, FlowStep } from './config.types'
import { randomUUID } from 'crypto'
import { Emit, LockFile } from '..'
import zodToJsonSchema from 'zod-to-json-schema'

type FlowListResponse = {
  id: string
  name: string
}

type FlowStepResponse = {
  id: string
  name: string
  type: 'base' | 'trigger'
  description?: string
  subscribes?: string[]
  emits: Emit[]
  action?: 'webhook' | 'cron'
  webhookUrl?: string
  inputSchema?: any
  cron?: string
}

type FlowResponse = FlowListResponse & {
  steps: FlowStepResponse[]
}

export const generateFlowsList = (lockData: LockFile, flowSteps: FlowStep[]): FlowResponse[] => {
  const list: FlowResponse[] = []
  const configuredFlowIdentifiers = Object.keys(lockData.flows)
  const flowStepsMap = flowSteps.reduce(
    (mappedSteps, flowStep) => {
      const flowNames = flowStep.config.flows // Now an array
      if (!flowNames || flowNames.length === 0) {
        throw Error(`Invalid step config in ${flowStep.filePath}, at least one flow name is required`)
      }

      // Validate each flow name
      flowNames.forEach((flowName: string) => {
        if (!configuredFlowIdentifiers.includes(flowName)) {
          throw Error(
            `Unknown flow name ${flowName} in ${flowStep.filePath}, all flows should be defined in the config.yml`,
          )
        }
      })

      // Add step to each flow it belongs to
      flowNames.forEach((flowName: string) => {
        if (flowName in mappedSteps) {
          mappedSteps[flowName].push(flowStep)
        } else {
          mappedSteps[flowName] = [flowStep]
        }
      })

      return mappedSteps
    },
    {} as Record<string, FlowStep[]>,
  )

  const findStepBySubscribes = (flowId: string, emits: string) => {
    return flowStepsMap[flowId].find((step) => step.config.subscribes.includes(emits))
  }

  const { cron, api } = lockData.triggers

  const triggerMappingByFlowId = Object.keys(api.paths).reduce(
    (mapping, path) => {
      const route = api.paths[path]
      const flows = route.flows
      const nextRoute = { ...route, path }

      flows.forEach((flow) => {
        if (flow in mapping) {
          mapping[flow].push(nextRoute)
        } else {
          mapping[flow] = [nextRoute]
        }
      })

      return mapping // Return the original mapping that we modified
    },
    {} as Record<string, ApiRoute[]>,
  )

  Object.keys(lockData.flows).forEach((flowId) => {
    const steps: FlowStepResponse[] = []
    const flowDetails = lockData.flows[flowId]

    if (!(flowId in flowStepsMap)) {
      throw Error(`No flow steps found for flow with id ${flowId}`)
    }

    if (!(flowId in triggerMappingByFlowId)) {
      throw Error(`No triggers (api or cron) found for flow with id ${flowId}`)
    }

    triggerMappingByFlowId[flowId].forEach((route) => {
      const step = findStepBySubscribes(flowId, route.emits)

      steps.push({
        id: randomUUID(),
        type: 'trigger',
        name: route.name,
        description: route.description,
        emits: [route.emits],
        action: 'webhook',
        webhookUrl: `${route.method} ${route.path}`,
        inputSchema: step?.config.input ? zodToJsonSchema(step.config.input) : undefined,
      })
    })

    flowStepsMap[flowId].forEach((flow) => {
      steps.push({
        id: randomUUID(),
        type: 'base',
        name: flow.config.name,
        description: flow.config.description,
        emits: flow.config.emits,
        subscribes: flow.config.subscribes,
      })
    })

    Object.keys(cron).forEach((cronId) => {
      const cronDetails = cron[cronId]

      if (!cronDetails.flows.includes(flowId)) return

      steps.push({
        id: randomUUID(),
        type: 'trigger',
        name: cronDetails.name,
        description: cronDetails.description,
        emits: [cronDetails.emits],
        action: 'cron',
        cron: cronDetails.cron,
      })
    })

    list.push({ id: flowId, name: flowDetails.name, steps })
  })

  return list
}

export const flowsEndpoint = (lockData: LockFile, flowSteps: FlowStep[], app: Express) => {
  const list = generateFlowsList(lockData, flowSteps)

  app.get('/flows', async (_, res) => {
    res.status(200).send(list.map(({ id, name }) => ({ id, name })))
  })

  app.get('/flows/:id', async (req, res) => {
    const { id } = req.params as { id: string }
    const flow: FlowListResponse | undefined = list.find((flow) => flow.id === id)

    if (!flow) {
      res.status(404).send({ error: 'Flow not found' })
    } else {
      res.status(200).send(flow)
    }
  })
}
