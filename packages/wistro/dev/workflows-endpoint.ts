import { FastifyInstance } from 'fastify'
import { Config, Workflow } from './config.types'
import { randomUUID } from 'crypto'
import { Emit } from '..'

type WorkflowListResponse = {
  id: string
  name: string
}

type WorkflowStep = {
  id: string
  name: string
  type: 'base' | 'trigger'
  description?: string
  subscribes?: string[]
  emits: Emit[]
  action?: 'webhook' | 'cron'
  webhookUrl?: string
  cron?: string
}

type WorkflowResponse = WorkflowListResponse & {
  steps: WorkflowStep[]
}

const exists = <T>(item: T | undefined | null): item is T => item !== undefined && item !== null

export const workflowsEndpoint = (config: Config, workflowSteps: Workflow[], fastify: FastifyInstance) => {
  const list: WorkflowResponse[] = []

  // TODO: review with sergio what needs to be saved from here
  // function getWorkflowSteps(eventTypes: string[], importedWorkflows: Workflow[]): Workflow[] {
  //   const filteredWorkflows = workflows.filter((workflow) => !importedWorkflows.includes(workflow))
  //   const steps = eventTypes
  //     .map((eventType) => filteredWorkflows.filter((workflow) => workflow.config.subscribes.includes(eventType)))
  //     .filter(exists)
  //     .flat()

  //   if (eventTypes.includes('pms.start')) {
  //     filteredWorkflows
  //       .filter((a) => a.config.subscribes[0] === 'pms.start')
  //       .forEach((a) => {
  //         console.log('start', a.config.name, eventTypes, steps)
  //       })
  //   }

  //   const result = [...steps]

  //   for (const step of steps) {
  //     const emitsString = step.config.emits.map((emit: Emit) => (typeof emit === 'string' ? emit : emit.type))
  //     result.push(...getWorkflowSteps(emitsString, [...importedWorkflows, ...result]))
  //   }

  //   return result
  // }

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
  }, {} as Record<string, Workflow[]>);

  Object.keys(config.workflows).forEach((workflowId) => {
    const steps: WorkflowStep[] = [];
    const workflowDetails = config.workflows[workflowId]
    const allSteps: Workflow[] = []

    Object.keys(config.api.paths)
      .filter((path) => config.api.paths[path].tags?.includes(workflowId))
      .forEach((path) => {
        const route = config.api.paths[path]

        steps.push({
          id: randomUUID(),
          type: 'trigger',
          name: route.name,
          description: route.description,
          emits: [route.emits],
          action: 'webhook',
          webhookUrl: `${route.method} ${path}`,
        })

        workflowStepsMap[workflowId]
        .forEach((workflow) => {
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

      if (cron.workflow !== workflowId) return;

      steps.push({
        id: randomUUID(),
        type: 'trigger',
        name: cron.name,
        description: cron.description,
        emits: [cron.emits],
        action: 'cron',
        cron: cron.cron,
      })

      // TODO: review how we want cron jobs to be injected into workflows
      // if (!cron.workflow)  throw Error('Invalid cron config, a workflow name is required');

      // // getWorkflowSteps([cron.emits], allSteps)
      // workflowStepsMap[cron.workflow].forEach((workflow) => {
      //   // TODO: identify if thhe workflow already exists, since a cron can piggy back into an existing workflow
      //   // allSteps.push(workflow)
      //   steps.push({
      //     id: randomUUID(),
      //     type: 'base',
      //     name: workflow.config.name,
      //     description: workflow.config.description,
      //     emits: workflow.config.emits,
      //     subscribes: workflow.config.subscribes,
      //   })
      // })
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
