import { createServer, MotiaServer } from '../server'
import { createEventManager } from '../event-manager'
import { LockedData } from '../locked-data'
import { ApiRouteConfig, Step } from '../types'
import request from 'supertest'
import { createApiStep } from './fixtures/step-fixtures'
import { MemoryStateAdapter } from '../state/adapters/memory-state-adapter'
import path from 'path'

describe('Server', () => {
  beforeAll(() => {
    process.env._MOTIA_TEST_MODE = 'true'
  })

  describe('API With multiple languages', () => {
    const baseDir = path.join(__dirname, 'steps')
    let server: MotiaServer

    beforeEach(async () => {
      const lockedData = new LockedData(baseDir)
      const eventManager = createEventManager()
      const state = new MemoryStateAdapter()
      server = await createServer(lockedData, eventManager, state)
    })
    afterEach(async () => server?.close())

    it('should run node API steps', async () => {
      const mockApiStep: Step<ApiRouteConfig> = createApiStep(
        { emits: ['TEST_EVENT'], path: '/test', method: 'POST' },
        path.join(baseDir, 'api-step.ts'),
      )

      server.addRoute(mockApiStep)

      const response = await request(server.app).post('/test')
      expect(response.status).toBe(200)
      expect(response.body.traceId).toBeDefined()
    })

    it('should run python API steps', async () => {
      const mockApiStep: Step<ApiRouteConfig> = createApiStep(
        { emits: ['TEST_EVENT'], path: '/test', method: 'POST' },
        path.join(baseDir, 'api-step.py'),
      )

      server.addRoute(mockApiStep)

      const response = await request(server.app).post('/test')
      expect(response.status).toBe(200)
      expect(response.body.traceId).toBeDefined()
    })

    it('should run ruby API steps', async () => {
      const mockApiStep: Step<ApiRouteConfig> = createApiStep(
        { emits: ['TEST_EVENT'], path: '/test', method: 'POST' },
        path.join(baseDir, 'api-step.rb'),
      )

      server.addRoute(mockApiStep)

      const response = await request(server.app).post('/test')
      expect(response.status).toBe(200)
      expect(response.body.traceId).toBeDefined()
    })
  })

  describe('Router', () => {
    it('should create routes from locked data API steps', async () => {
      const eventManager = createEventManager()
      const state = new MemoryStateAdapter()
      const baseDir = __dirname
      const lockedData = new LockedData(baseDir)
      const mockApiStep: Step<ApiRouteConfig> = createApiStep(
        { emits: ['TEST_EVENT'], path: '/test', method: 'POST' },
        path.join(baseDir, 'steps', 'api-step.ts'),
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
})
