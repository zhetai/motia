import { FastifyInstance } from 'fastify'
import { Config, WorkflowStep } from './config.types'
import { randomUUID } from 'crypto'
import { Emit } from '..'
import zodToJsonSchema from 'zod-to-json-schema'

type WorkflowListResponse = {
  id: string
  name: string
}

type WorkflowStepResponse = {
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

type WorkflowResponse = WorkflowListResponse & {
  steps: WorkflowStepResponse[]
}

const exists = <T>(item: T | undefined | null): item is T => item !== undefined && item !== null

export const workflowsEndpoint = (config: Config, workflowSteps: WorkflowStep[], fastify: FastifyInstance) => {
  const list: WorkflowResponse[] = []
  const findStepBySubscribes = (subscribes: string) => {
    return workflowSteps.find((step) => step.config.subscribes.includes(subscribes))
  }

  function getWorkflowSteps(eventTypes: string[], importedSteps: WorkflowStep[]): WorkflowStep[] {
    const filteredWorkflows = workflowSteps.filter((step) => !importedSteps.includes(step))
    const steps = eventTypes
      .map((eventType) => filteredWorkflows.filter((step) => step.config.subscribes.includes(eventType)))
      .filter(exists)
      .flat()

    const result = [...steps]

    for (const step of steps) {
      const emitsString = step.config.emits.map((emit: Emit) => (typeof emit === 'string' ? emit : emit.type))
      result.push(...getWorkflowSteps(emitsString, [...importedSteps, ...result]))
    }

    return result
  }

  Object.keys(config.workflows).forEach((workflowId) => {
    const steps: WorkflowStepResponse[] = []
    const workflowDetails = config.workflows[workflowId]
    const allSteps: WorkflowStep[] = []

    Object.keys(config.api.paths)
      .filter((path) => config.api.paths[path].tags?.includes(workflowId))
      .forEach((path) => {
        const route = config.api.paths[path]
        const step = findStepBySubscribes(route.emits)
        steps.push({
          id: randomUUID(),
          type: 'trigger',
          name: route.name,
          description: route.description,
          emits: [route.emits],
          action: 'webhook',
          webhookUrl: `${route.method} ${path}`,
          inputSchema: step?.config.input ? zodToJsonSchema(step.config.input) : undefined,
        })

        getWorkflowSteps([route.emits], allSteps).forEach((workflow) => {
          allSteps.push(workflow)
          steps.push({
            id: randomUUID(),
            type: 'base',
            name: workflow.config.name,
            description: workflow.config.description,
            emits: workflow.config.emits,
            subscribes: workflow.config.subscribes,
          })
        })
      })

    Object.keys(config.cron).forEach((cronId) => {
      const cron = config.cron[cronId]

      if (cron.workflow !== workflowId) return

      steps.push({
        id: randomUUID(),
        type: 'trigger',
        name: cron.name,
        description: cron.description,
        emits: [cron.emits],
        action: 'cron',
        cron: cron.cron,
      })

      getWorkflowSteps([cron.emits], allSteps).forEach((workflow) => {
        steps.push({
          id: randomUUID(),
          type: 'base',
          name: workflow.config.name,
          description: workflow.config.description,
          emits: workflow.config.emits,
          subscribes: workflow.config.subscribes,
        })
      })
    })

    list.push({ id: workflowId, name: workflowDetails.name, steps })
  })

  fastify.get('/workflows', async (_, res) => {
    res.status(200).send(list.map(({ id, name }) => ({ id, name })))
  })

  fastify.get('/workflows/:id', async (req, res) => {
    const { id } = req.params as { id: string }
    const workflow: WorkflowListResponse | undefined = list.find((workflow) => workflow.id === id)

    if (!workflow) {
      res.status(404).send({ error: 'Workflow not found' })
    } else {
      res.status(200).send(workflow)
    }
  })
}
