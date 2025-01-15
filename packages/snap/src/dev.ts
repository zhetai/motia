import { createServer, createStepHandlers, createEventManager, globalLogger, createStateAdapter } from '@motia/core'
import path from 'path'
import { generateLockedData } from './generate/locked-data'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (port: number): Promise<void> => {
  const lockedData = await generateLockedData(path.join(process.cwd()))
  const steps = [...lockedData.steps.active, ...lockedData.steps.dev]
  const eventManager = createEventManager()
  const state = createStateAdapter(lockedData.state)
  const { server } = await createServer({ port, steps, flows: lockedData.flows, state, eventManager })

  createStepHandlers(steps, eventManager, lockedData.state)

  console.log('🚀 Server ready and listening on port', port)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    server.close()
    process.exit(0)
  })
}
