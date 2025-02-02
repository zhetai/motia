import { createApiStep, createEventStep } from './fixtures/step-fixtures'
import { generateFlowsList } from '../flows-endpoint'
import { LockedData } from '../locked-data'
import { z } from 'zod'
import { Step } from '../types'

const mockFlowSteps: Step[] = [
  createApiStep({
    name: 'Start Event',
    description: 'Start the Motia Server Example flow',
    path: '/api/motia-server-example',
    method: 'POST',
    emits: ['ws-server-example.start'],
    flows: ['motia-server'],
  }),
  createEventStep({
    name: 'Processor',
    subscribes: ['ws-server-example.start'],
    emits: ['ws-server-example.processed'],
    input: z.object({}),
    flows: ['motia-server'],
  }),
  createEventStep({
    name: 'Finalizer',
    subscribes: ['ws-server-example.processed'],
    emits: [],
    input: z.object({}),
    flows: ['motia-server'],
  }),
]

describe('generateFlowsList', () => {
  it('should generate a list of flows with steps', () => {
    const lockedData = new LockedData(process.cwd())
    mockFlowSteps.forEach((step) => lockedData.createStep(step))

    const result = generateFlowsList(lockedData)

    expect(result.map(({ id }) => id)).toEqual(['motia-server'])
    expect(result.map(({ steps }) => steps.map((step) => step.name)).flat()).toEqual([
      'Start Event',
      'Processor',
      'Finalizer',
    ])
  })
})
