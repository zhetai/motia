import { LockFile } from '../../wistro.types'

export const mockValidConfig: LockFile = {
  baseDir: './',
  version: '1.0.0',
  flows: {
    flow1: {
      name: 'Flow 1',
      description: 'Flow 1 description',
      steps: [{ filePath: 'step1/path', version: '1.0.0' }],
      version: '1.0.0',
    },
  },
  triggers: {
    api: {
      paths: {
        '/path1': { name: 'Path 1', emits: 'event1', flows: ['flow1'], method: 'GET', description: 'test' },
        '/path2': { name: 'Path 2', emits: 'event2', flows: ['flow1'], method: 'POST', description: 'test' },
      },
    },
    cron: {
      cron1: {
        name: 'Cron Job 1',
        emits: 'event1',
        flows: ['flow1'],
        cron: '* * * * *',
        description: 'test',
      },
    },
  },
  state: {
    adapter: 'redis',
    host: 'localhost',
    port: 6397,
  },
  port: 3000,
}

export const mockConfigWithoutTriggers: LockFile = {
  baseDir: './',
  version: '1.0.0',
  flows: {
    flow1: {
      name: 'Flow 1',
      description: 'Flow 1 description',
      steps: [{ filePath: 'step1/path', version: '1.0.0' }],
      version: '1.0.0',
    },
  },
  triggers: {
    api: { paths: {} },
    cron: {},
  },
  state: {
    adapter: 'redis',
    host: 'localhost',
    port: 6379,
  },
  port: 3000,
}
