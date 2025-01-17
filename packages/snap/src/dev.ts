import {
  createServer,
  createStepHandlers,
  createEventManager,
  globalLogger,
  createInternalStateManager,
} from '@motia/core'
import path from 'path'
import { generateLockedData } from './generate/locked-data'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (port: number): Promise<void> => {
  const rootDir = path.join(process.cwd())
  const lockedData = await generateLockedData(rootDir)
  const steps = [...lockedData.steps.active, ...lockedData.steps.dev]
  const eventManager = createEventManager()
  const state = createInternalStateManager({
    // TODO: allow for host configuration
    stateManagerUrl: `http://localhost:${port}`,
  })
  const { server } = await createServer({ steps, rootDir, state, flows: lockedData.flows, eventManager })

  createStepHandlers(steps, eventManager)

  server.listen(port)
  console.log('🚀 Server ready and listening on port', port)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    server.close()
    process.exit(0)
  })
}
