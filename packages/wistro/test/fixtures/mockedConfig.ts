import { Config } from '../../dev/config.types'

export const mockValidConfig: Config = {
  workflows: {
    workflow1: { name: 'Workflow 1' },
  },
  api: {
    paths: {
      '/path1': { name: 'Path 1', emits: 'event1', workflow: 'workflow1', method: 'GET' },
      '/path2': { name: 'Path 2', emits: 'event2', workflow: 'workflow1', method: 'POST' },
    },
  },
  cron: {
    cron1: { name: 'Cron Job 1', emits: 'event1', workflow: 'workflow1', cron: '* * * * *' },
  },
  state: {
    adapter: 'redis',
    host: 'localhost',
    port: 6397,
  },
  port: 3000,
}

export const mockConfigWithoutTriggers: Config = {
  workflows: {
    workflow1: { name: 'Workflow 1' },
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
