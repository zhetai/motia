import path from 'path'
import { Step } from '../types'
import { config as emitConfig } from './emit.step'

export const systemSteps: Step[] = [
  {
    filePath: path.join(__dirname, 'emit.step.ts'),
    version: '1',
    config: emitConfig,
  },
]
