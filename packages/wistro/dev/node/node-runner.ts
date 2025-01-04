import path from 'path'
import { AdapterConfig, createStateAdapter } from '../../state/createStateAdapter'

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

async function runTypescriptModule(filePath: string, args: [any, AdapterConfig]) {
  try {
    // Remove pathToFileURL since we'll use require
    const module = require(path.resolve(filePath))

    // Check if the specified function exists in the module
    if (typeof module.executor !== 'function') {
      throw new Error(`Function executor not found in module ${filePath}`)
    }

    if (!Array.isArray(args)) {
      throw new Error('Arguments must be an array')
    }

    if (!args?.[1]) {
      throw new Error('State adapter config is required')
    }

    const state = createStateAdapter({
      ...args[1],
    });
  
    const context = {
      state,
    }

    const emit = async (data: any) => {
      process.send?.(data)
    }

    // Call the function with provided arguments
    const result = await module.executor(args[0], emit, context)

    // Log the result if any
    if (result !== undefined) {
      console.log('Result:', result)
    }
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
