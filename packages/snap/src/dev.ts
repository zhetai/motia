import {
  createServer,
  createStepHandlers,
  createEventManager,
  globalLogger,
  createInternalStateManager,
} from '@motiadev/core'
import { applyMiddleware } from '@motiadev/workbench/middleware'
import path from 'path'
import { generateLockedData } from './generate-locked-data'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (port: number): Promise<void> => {
  const rootDir = path.join(process.cwd())
  const lockedData = await generateLockedData(rootDir)
  const steps = [...lockedData.steps.active, ...lockedData.steps.dev]
  const eventManager = createEventManager()
  const stateManagerConfig = {
    // TODO: allow for host configuration
    stateManagerUrl: `http://localhost:${port}/state-manager`,
  }
  const state = createInternalStateManager(stateManagerConfig)
  const { app, server } = await createServer({ steps, rootDir, state, flows: lockedData.flows, eventManager })

  createStepHandlers(steps, eventManager, stateManagerConfig)

  server.listen(port)
  console.log('🚀 Server ready and listening on port', port)

  await applyMiddleware(app)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    server.close()
    process.exit(0)
  })
}
