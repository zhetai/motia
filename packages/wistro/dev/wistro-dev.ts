import { createServer } from './server'
import { createFlowHandlers } from './flow-handlers'
import { createEventManager } from './event-manager'
import { buildFlows } from './flow-builder'
import { globalLogger } from './logger'
import { createStateAdapter } from '../state/createStateAdapter'
import { loadLockFile } from './load-lock-file'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (): Promise<void> => {
  const lockData = loadLockFile()
  const steps = await buildFlows(lockData)
  const eventManager = createEventManager()
  const state = createStateAdapter(lockData.state)
  const { server } = await createServer(lockData, steps, state, eventManager)

  createFlowHandlers(steps, eventManager, lockData.state)

  console.log('🚀 Server ready and listening on port', lockData.port)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    server.close()
    process.exit(0)
  })
}
