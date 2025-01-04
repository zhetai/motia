import { FastifyInstance } from 'fastify'
import { ApiRoute, Config, WorkflowStep } from './config.types'
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

export const generateWorkflowsList = (config: Config, workflowSteps: WorkflowStep[]): WorkflowResponse[] => {
  const list: WorkflowResponse[] = []

  const configuredWorkflowIdentifiers = Object.keys(config.workflows);
  const workflowStepsMap = workflowSteps.reduce((mappedSteps, workflowStep) => {
    const workflowName = workflowStep.config.workflow;
    if (!workflowName) {
      throw Error(`Invalid step config in ${workflowStep.filePath}, a workflow name is required`);
    }

    if (!configuredWorkflowIdentifiers.includes(workflowName)){
      throw Error(`Unknown workflow name ${workflowName} in ${workflowStep.filePath}, all workflows should be defined in the config.yml`);
    }

    const nextMappedSteps = { ...mappedSteps };
    if (workflowName in nextMappedSteps) {
      nextMappedSteps[workflowName].push(workflowStep);
    } else {
      nextMappedSteps[workflowName] = [workflowStep];
    }

    return nextMappedSteps;
  }, {} as Record<string, WorkflowStep[]>);

  const findStepBySubscribes = (workflowId: string, emits: string) => {
    return workflowStepsMap[workflowId].find((step) => step.config.subscribes.includes(emits))
  }

  const triggerMappingByWorkflowId = Object.keys(config.api.paths).reduce((mapping, path) => {
    const route = config.api.paths[path];
    const workflow = route.workflow;
    const nextRoute = { ...route, path };

    const nextMapping = { ...mapping };

    if (workflow in nextMapping) {
      nextMapping[workflow].push(nextRoute);
    } else {
      nextMapping[workflow] = [nextRoute];
    }

    return nextMapping;

  }, {} as Record<string, ApiRoute[]>);

  Object.keys(config.workflows).forEach((workflowId) => {
    const steps: WorkflowStepResponse[] = []
    const workflowDetails = config.workflows[workflowId]

    if (!(workflowId in workflowStepsMap)) {
      throw Error(`No workflow steps found for workflow with id ${workflowId}`);
    }
    
    if (!(workflowId in triggerMappingByWorkflowId)) {
      throw Error(`No triggers (api or cron) found for workflow with id ${workflowId}`);
    }
    
    triggerMappingByWorkflowId[workflowId]
      .forEach((route) => {
        const step = findStepBySubscribes(workflowId, route.emits);

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

    workflowStepsMap[workflowId].forEach((workflow) => {
      steps.push({
        id: randomUUID(),
        type: 'base',
        name: workflow.config.name,
        description: workflow.config.description,
        emits: workflow.config.emits,
        subscribes: workflow.config.subscribes,
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
    })

    list.push({ id: workflowId, name: workflowDetails.name, steps })
  })

  return list;
}

export const workflowsEndpoint = (config: Config, workflowSteps: WorkflowStep[], fastify: FastifyInstance) => {
  const list = generateWorkflowsList(config, workflowSteps);

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
