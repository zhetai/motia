const path = require('path')
const Redis = require('ioredis')

// Add ts-node registration before dynamic imports
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

function parseArgs(arg) {
  try {
    return JSON.parse(arg)
  } catch {
    return arg
  }
}

class StateAdapter {
  constructor(traceId, stateConfig) {
    this.traceId = traceId
    this.client = new Redis(stateConfig)
    this.prefix = 'wistro:state:'

    if (stateConfig.ttl) {
      this.ttl = stateConfig.ttl
    }
  }

  async get(key) {
    const fullKey = this._makeKey(key)
    const value = await this.client.get(fullKey)
    return value ? JSON.parse(value) : null
  }

  async set(key, value) {
    const fullKey = this._makeKey(key)
    await this.client.set(fullKey, JSON.stringify(value), 'EX', this.ttl)
  }

  async delete(key) {
    const fullKey = this._makeKey(key)
    await this.client.del(fullKey)
  }

  async clear() {
    const pattern = this._makeKey('*')
    const keys = await this.client.keys(pattern)

    if (keys.length > 0) {
      await this.client.del(keys)
    }
  }

  async cleanup() {
    await this.client.quit()
  }

  _makeKey(key) {
    return `${this.prefix}${this.traceId}:${key}`
  }
}

async function runTypescriptModule(filePath, args) {
  try {
    // Remove pathToFileURL since we'll use require
    const module = require(path.resolve(filePath))

    // Check if the specified function exists in the module
    if (typeof module.executor !== 'function') {
      throw new Error(`Function executor not found in module ${filePath}`)
    } else if (!args?.stateConfig) {
      throw new Error('State adapter config is required')
    }

    const { stateConfig, ...event } = args
    const traceId = event.traceId
    const state = new StateAdapter(traceId, stateConfig)
    const context = { traceId, state }
    const emit = async (data) => {
      process.send?.(data)
    }

    // Call the function with provided arguments
    await module.executor(event.data, emit, context)
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
