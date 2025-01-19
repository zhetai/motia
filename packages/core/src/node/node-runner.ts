import path from 'path'
import { createInternalStateManager } from '../state/create-internal-state-manager'
import { Logger } from './logger'

// Add ts-node registration before dynamic imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

function parseArgs(arg: string) {
  try {
    return JSON.parse(arg)
  } catch {
    return arg
  }
}

async function runTypescriptModule(filePath: string, args: Record<string, unknown>) {
  try {
    // Remove pathToFileURL since we'll use require
    const module = require(path.resolve(filePath))

    // Check if the specified function exists in the module
    if (typeof module.handler !== 'function') {
      throw new Error(`Function handler not found in module ${filePath}`)
    } else if (!args?.stateConfig) {
      throw new Error('State adapter config is required')
    }

    const { stateConfig, ...event } = args
    const { traceId, flows } = event
    const logger = new Logger(traceId as string, flows as string[], filePath.split('/').pop())
    // TODO: check that state config is defined, otherwise default to in-memory state management
    const stateManagerUrl = (stateConfig as { stateManagerUrl: string }).stateManagerUrl
    const state = createInternalStateManager({ stateManagerUrl })

    const emit = async (data: unknown) => process.send?.(data)
    const context = { traceId, flows, logger, state, emit }

    // Call the function with provided arguments
    await module.handler(event.data, context)
  } catch (error) {
    console.error('Error running TypeScript module:', error)
    process.exit(1)
  }
}

const [, , filePath, arg] = process.argv

if (!filePath) {
  console.error('Usage: node nodeRunner.js <file-path> <arg>')
  process.exit(1)
}

runTypescriptModule(filePath, parseArgs(arg)).catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
