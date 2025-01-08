import { z } from 'zod'
import { mockConfigWithoutTriggers, mockValidConfig } from '../../test/fixtures/mockedConfig'
import { mockFlowSteps } from '../../test/fixtures/mockedFlowSteps'
import { FlowStep } from '../config.types'
import { generateFlowsList } from '../flows-endpoint'

// Mock randomUUID for consistent test results
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}))

describe('generateFlowsList', () => {
  it('should generate a list of flows with steps', () => {
    const result = generateFlowsList(mockValidConfig, mockFlowSteps)

    expect(result.map(({ id }) => id)).toEqual(['flow1'])
    expect(result.map(({ steps }) => steps.map((step) => step.name)).flat()).toEqual([
      'Path 1',
      'Path 2',
      'Step 1',
      'Step 2',
      'Step 3',
      'Cron Job 1',
    ])
  })

  it('should throw an error for missing flow in steps', () => {
    const mockFlowSteps: FlowStep[] = [
      {
        config: {
          flows: ['flow2'], // Invalid flow
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        filePath: 'step1/path',
        file: 'path',
      },
    ]

    expect(() => generateFlowsList(mockConfigWithoutTriggers, mockFlowSteps)).toThrow(
      'Unknown flow name flow2 in step1/path, all flows should be defined in the config.yml',
    )
  })

  it('should throw an error if no flow steps are found for a flow', () => {
    const mockFlowSteps: FlowStep[] = []

    expect(() => generateFlowsList(mockConfigWithoutTriggers, mockFlowSteps)).toThrow(
      'No flow steps found for flow with id flow1',
    )
  })

  it('should throw an error if no triggers are found for a flow', () => {
    const mockFlowSteps: FlowStep[] = [
      {
        config: {
          flows: ['flow1'],
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        filePath: 'step1/path',
        file: 'path',
      },
    ]

    expect(() => generateFlowsList(mockConfigWithoutTriggers, mockFlowSteps)).toThrow(
      'No triggers (api or cron) found for flow with id flow1',
    )
  })
})
