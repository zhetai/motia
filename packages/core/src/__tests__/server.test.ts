import { createServer } from '../server'
import { createEventManager } from '../event-manager'
import { LockedData } from '../locked-data'
import { ApiRouteConfig, Step } from '../types'
import request from 'supertest'
import { createApiStep } from './fixtures/step-fixtures'
import { MemoryStateAdapter } from '../state/adapters/memory-state-adapter'
import path from 'path'

describe('Server', () => {
  beforeAll(async () => {})

  it('should create routes from locked data API steps', async () => {
    const eventManager = createEventManager()
    const state = new MemoryStateAdapter()
    const baseDir = __dirname
    const lockedData = new LockedData(baseDir)
    const mockApiStep: Step<ApiRouteConfig> = createApiStep(
      { emits: ['TEST_EVENT'], path: '/test', method: 'POST' },
      path.join(baseDir, 'api-step.ts'),
    )

    lockedData.createStep(mockApiStep)

    const server = await createServer(lockedData, eventManager, state)

    const response = await request(server.app).post('/test')
    expect(response.status).toBe(200)

    server.removeRoute(mockApiStep)

    const notFound = await request(server.app).post('/test')
    expect(notFound.status).toBe(404)

    server.addRoute(mockApiStep)

    const found = await request(server.app).post('/test')
    expect(found.status).toBe(200)

    await server.close()
  })
})
