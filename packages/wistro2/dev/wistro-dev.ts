import path from 'path'
import fs from 'fs'
import { parse } from 'yaml'
import { createServer } from './server'
import { createWorkflowHandlers } from './workflow-handlers'
import { getPythonConfig } from './python/get-python-config'
import { createEventManager } from './event-manager'
import { Workflow } from './config.types'
import { FlowConfig } from '../wistro.types'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

async function buildWorkflows(): Promise<Workflow[]> {
  // Read all workflow folders under /flows directory
  const flowsDir = path.join(process.cwd(), 'flows')
  const workflows: Workflow[] = []

  // Check if flows directory exists
  if (!fs.existsSync(flowsDir)) {
    console.log('No /flows directory found')
    return []
  }

  // Get all workflow folders
  const workflowFiles = fs
    .readdirSync(flowsDir, { withFileTypes: true })
    .filter(({ name }) => name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.py'))
    .map(({ name }) => name)

  console.log('[Workflows] Building workflows', workflowFiles)

  for (const file of workflowFiles) {
    const isPython = file.endsWith('.py')

    if (isPython) {
      console.log('[Workflows] Building Python workflow', file)
      const config = await getPythonConfig(path.join(flowsDir, file))
      console.log('[Workflows] Python workflow config', config)
      workflows.push({ config, file })
    } else {
      console.log('[Workflows] Building Node workflow', file)
      const module = require(path.join(flowsDir, file))
      const config = module.config as FlowConfig<any>
      workflows.push({ config, file })
    }
  }

  return workflows
}

export const dev = async () => {
  const configYaml = fs.readFileSync(path.join(process.cwd(), 'config.yml'), 'utf8')
  const config = parse(configYaml)

  const workflows = await buildWorkflows()
  const eventManager = createEventManager()

  const server = createServer(config.api, eventManager)
  createWorkflowHandlers(workflows, eventManager)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    console.log('[playground/index] Shutting down...')
    server.close()
    process.exit(0)
  })
}
