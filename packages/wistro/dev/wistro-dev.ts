import { createServer } from './server'
import { createFlowHandlers } from './flow-handlers'
import { createEventManager } from './event-manager'
import { buildFlows } from './flow-builder'
import { globalLogger } from './logger'
import { loadLockFile } from './load-lock-file'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (): Promise<void> => {
  const lockData = loadLockFile()
  const flowSteps = await buildFlows(lockData)
  const eventManager = createEventManager()
  const { server } = await createServer(lockData, flowSteps, eventManager)

  createFlowHandlers(flowSteps, eventManager, lockData.state)

  console.log('🚀 Server ready and listening on port', lockData.port)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    server.close()
    process.exit(0)
  })
}
