import { Config } from '../../dev/config.types'

export const mockValidConfig: Config = {
  flows: {
    flow1: { name: 'Flow 1' },
  },
  api: {
    paths: {
      '/path1': { name: 'Path 1', emits: 'event1', flows: ['flow1'], method: 'GET' },
      '/path2': { name: 'Path 2', emits: 'event2', flows: ['flow1'], method: 'POST' },
    },
  },
  cron: {
    cron1: {
      name: 'Cron Job 1',
      emits: 'event1',
      flows: ['flow1'],
      cron: '* * * * *',
    },
  },
  state: {
    adapter: 'redis',
    host: 'localhost',
    port: 6397,
  },
  port: 3000,
}

export const mockConfigWithoutTriggers: Config = {
  flows: {
    flow1: { name: 'Flow 1' },
  },
  api: { paths: {} },
  cron: {},
  state: {
    adapter: 'redis',
    host: 'localhost',
    port: 6379,
  },
  port: 3000,
}
