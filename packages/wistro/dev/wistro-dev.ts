import path from 'path'
import fs from 'fs'
import { parse } from 'yaml'
import { createServer } from './server'
import { createFlowHandlers } from './flow-handlers'
import { getPythonConfig } from './python/get-python-config'
import { createEventManager } from './event-manager'
import { Config, FlowStep } from './config.types'
import { FlowConfig } from '../wistro.types'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

async function parseFlowFolder(folderPath: string, nextFlows: FlowStep[]): Promise<FlowStep[]> {
  const flowFolderItems = fs.readdirSync(folderPath, { withFileTypes: true })
  const flowFiles = flowFolderItems
    .filter(({ name }) => name.endsWith('.step.ts') || name.endsWith('.step.js') || name.endsWith('.step.py'))
    .map(({ name }) => name)
  const flowRootFolders = flowFolderItems.filter((item) => item.isDirectory())
  let flows: FlowStep[] = [...nextFlows]

  console.log('[Flows] Building flows', flowFiles)

  for (const file of flowFiles) {
    const isPython = file.endsWith('.py')

    if (isPython) {
      console.log('[Flows] Building Python flow', file)
      const config = await getPythonConfig(path.join(folderPath, file))
      console.log('[Flows] Python flow config', config)
      flows.push({ config, file, filePath: path.join(folderPath, file) })
    } else {
      console.log('[Flows] Building Node flow', file)
      const module = require(path.join(folderPath, file))
      if (!module.config) {
        console.log(`[Flows] skipping file ${file} as it does not have a valid config`)
        continue
      }
      console.log(`[Flows] processing component ${module.config.name} for flow ${module.config.tags?.flow ?? file}`)
      const config = module.config as FlowConfig<any>
      flows.push({ config, file, filePath: path.join(folderPath, file) })
    }
  }

  if (flowRootFolders.length > 0) {
    for (const folder of flowRootFolders) {
      console.log('[Flows] Building nested flows in path', path.join(folderPath, folder.name))
      const nestedFlows = await parseFlowFolder(path.join(folderPath, folder.name), [])
      flows = [...flows, ...nestedFlows]
    }
  }

  return flows
}

async function buildFlows(): Promise<FlowStep[]> {
  // Read all flow folders under /flows directory
  const flowsDir = path.join(process.cwd(), 'steps')

  // Check if steps directory exists
  if (!fs.existsSync(flowsDir)) {
    console.log('No /steps directory found')
    return []
  }

  // Get all flow folders
  return parseFlowFolder(flowsDir, [])
}

export const dev = async (): Promise<void> => {
  const configYaml = fs.readFileSync(path.join(process.cwd(), 'config.yml'), 'utf8')
  const config: Config = parse(configYaml)
  const flowSteps = await buildFlows()
  const eventManager = createEventManager()
  const { server, socketServer } = await createServer(config, flowSteps, eventManager)

  createFlowHandlers(flowSteps, eventManager, config.state, socketServer)

  // 6) Gracefully shut down on SIGTERM
  process.on('SIGTERM', async () => {
    console.log('[playground/index] Shutting down...')
    server.close()
    process.exit(0)
  })
}
