import { z } from 'zod'
import { FlowStep } from '../../dev/config.types'

export const mockFlowSteps: FlowStep[] = [
  {
    config: {
      flows: ['flow1'],
      name: 'Step 1',
      description: 'First step',
      emits: ['event1'],
      subscribes: [],
      input: z.object({}),
    },
    file: 'path',
    filePath: 'step1/path',
  },
  {
    config: {
      flows: ['flow1'],
      name: 'Step 2',
      description: 'Second step',
      emits: ['event2'],
      subscribes: ['event1'],
      input: z.object({}),
    },
    file: 'path',
    filePath: 'step2/path',
  },
  {
    config: {
      flows: ['flow1'],
      name: 'Step 3',
      description: 'Third step',
      emits: ['event3'],
      subscribes: ['event2'],
      input: z.object({}),
    },
    file: 'path',
    filePath: 'step3/path',
  },
]
