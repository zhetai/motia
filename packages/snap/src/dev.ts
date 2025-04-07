// packages/snap/src/dev.ts
import {
  createServer,
  createStepHandlers,
  createEventManager,
  globalLogger,
  createStateAdapter,
  createMermaidGenerator,
} from '@motiadev/core'
import { generateLockedData } from './generate-locked-data'
import path from 'path'
import fs from 'fs'
import { FileStateAdapter } from '@motiadev/core/dist/src/state/adapters/default-state-adapter'
import { createDevWatchers } from './dev-watchers'
import { stateEndpoints } from './dev/state-endpoints'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const dev = async (port: number, isVerbose: boolean, enableMermaid: boolean): Promise<void> => {
  const baseDir = process.cwd()

  // Set the virtual environment path
  const venvPath = path.join(baseDir, 'python_modules')
  const venvBinPath = path.join(venvPath, process.platform === 'win32' ? 'Scripts' : 'bin')

  // Verify that the virtual environment exists
  if (fs.existsSync(venvPath)) {
    // Add virtual environment to PATH
    process.env.PATH = `${venvBinPath}${path.delimiter}${process.env.PATH}`
    // Set VIRTUAL_ENV environment variable
    process.env.VIRTUAL_ENV = venvPath
    // Remove PYTHONHOME if it exists as it can interfere with venv
    delete process.env.PYTHONHOME

    // Log Python environment information if verbose mode is enabled
    if (isVerbose) {
      const pythonPath =
        process.platform === 'win32' ? path.join(venvBinPath, 'python.exe') : path.join(venvBinPath, 'python')
      console.log('🐍 Using Python from:', pythonPath)
    }
  } else {
    console.warn('❌ Python virtual environment not found in python_modules/')
  }

  const lockedData = await generateLockedData(baseDir)
  const eventManager = createEventManager()
  const state = createStateAdapter({
    adapter: 'default',
    filePath: path.join(baseDir, '.motia'),
  })
  await (state as FileStateAdapter).init()

  const config = { isVerbose }
  const motiaServer = await createServer(lockedData, eventManager, state, config)
  const motiaEventManager = createStepHandlers(lockedData, eventManager, state)
  const watcher = createDevWatchers(lockedData, motiaServer, motiaEventManager, motiaServer.cronManager)

  // Initialize mermaid generator
  if (enableMermaid) {
    const mermaidGenerator = createMermaidGenerator(baseDir)
    mermaidGenerator.initialize(lockedData)
  }

  watcher.init()

  stateEndpoints(motiaServer, state)
  motiaServer.server.listen(port)
  console.log('🚀 Server ready and listening on port', port)
  console.log(`🔗 Open http://localhost:${port}/ to open workbench 🛠️`)

  const { applyMiddleware } = process.env.__MOTIA_DEV_MODE__
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@motiadev/workbench/middleware')
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@motiadev/workbench/dist/middleware')
  await applyMiddleware(motiaServer.app)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    globalLogger.info('🛑 Shutting down...')
    motiaServer.server.close()
    await watcher.stop()
    process.exit(0)
  })
}
