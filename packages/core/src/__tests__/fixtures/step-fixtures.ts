import { z } from 'zod'
import { Step, ApiRouteConfig, EventConfig, CronConfig, NoopConfig } from '../../types'
import path from 'path'

export const createApiStep = (config: Partial<ApiRouteConfig> = {}, filePath?: string): Step<ApiRouteConfig> => ({
  config: {
    type: 'api',
    name: 'Start Event',
    description: 'Start the Motia Server Example flow',
    path: '/api/motia-server-example',
    method: 'POST',
    emits: ['ws-server-example.start'],
    flows: ['motia-server'],
    ...config,
  },
  version: '1',
  filePath: path.join(process.cwd(), filePath || '/playground/steps/motiaServerExample/startServerExample.step.ts'),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEventStep = (config: Partial<EventConfig<any>> = {}, filePath?: string): Step<EventConfig<any>> => ({
  config: {
    type: 'event',
    name: 'Processor',
    subscribes: ['ws-server-example.start'],
    emits: ['ws-server-example.processed'],
    input: z.object({}),
    flows: ['motia-server'],
    ...config,
  },
  version: '1',
  filePath: path.join(process.cwd(), filePath || '/playground/steps/motiaServerExample/processor.step.ts'),
})

export const createCronStep = (config: Partial<CronConfig> = {}, filePath?: string): Step<CronConfig> => ({
  config: {
    type: 'cron',
    name: 'Cron Job',
    cron: '* * * * *',
    emits: [],
    flows: ['motia-server'],
    ...config,
  },
  version: '1',
  filePath: path.join(process.cwd(), filePath || '/playground/steps/motiaServerExample/cronJob.step.ts'),
})

export const createNoopStep = (config: Partial<NoopConfig> = {}, filePath?: string): Step<NoopConfig> => ({
  config: {
    type: 'noop',
    name: 'Noop',
    virtualEmits: ['noop-event'],
    virtualSubscribes: ['noop-subscription'],
    flows: ['motia-server'],
    ...config,
  },
  version: '1',
  filePath: path.join(process.cwd(), filePath || '/playground/steps/motiaServerExample/noop.step.ts'),
})
