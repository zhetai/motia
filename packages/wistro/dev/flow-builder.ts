import path from 'path'
import fs from 'fs'
import { getPythonConfig } from './python/get-python-config'
import { FlowStep } from './config.types'
import { FlowConfig } from '../wistro.types'
import { globalLogger } from './logger'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const parseFlowFolder = async (folderPath: string, nextFlows: FlowStep[]): Promise<FlowStep[]> => {
  const flowFolderItems = fs.readdirSync(folderPath, { withFileTypes: true })
  const flowFiles = flowFolderItems
    .filter(({ name }) => name.endsWith('.step.ts') || name.endsWith('.step.js') || name.endsWith('.step.py'))
    .map(({ name }) => name)
  const flowRootFolders = flowFolderItems.filter((item) => item.isDirectory())
  let flows: FlowStep[] = [...nextFlows]

  globalLogger.debug('[Flows] Building flows', { flowFiles, flowRootFolders })

  for (const file of flowFiles) {
    const isPython = file.endsWith('.py')

    if (isPython) {
      globalLogger.debug('[Flows] Building Python flow', { file })
      const config = await getPythonConfig(path.join(folderPath, file))
      globalLogger.debug('[Flows] Python flow config', { config })
      flows.push({ config, file, filePath: path.join(folderPath, file) })
    } else {
      globalLogger.debug('[Flows] Building Node flow', { file })
      const module = require(path.join(folderPath, file))
      if (!module.config) {
        globalLogger.debug(`[Flows] skipping file ${file} as it does not have a valid config`)
        continue
      }
      globalLogger.debug('[Flows] processing component', { config: module.config })
      const config = module.config as FlowConfig<any>
      flows.push({ config, file, filePath: path.join(folderPath, file) })
    }
  }

  if (flowRootFolders.length > 0) {
    for (const folder of flowRootFolders) {
      globalLogger.debug('[Flows] Building nested flows in path', { path: path.join(folderPath, folder.name) })
      const nestedFlows = await parseFlowFolder(path.join(folderPath, folder.name), [])
      flows = [...flows, ...nestedFlows]
    }
  }

  return flows
}

export const buildFlows = async (): Promise<FlowStep[]> => {
  // Read all flow folders under /flows directory
  const flowsDir = path.join(process.cwd(), 'steps')

  // Check if steps directory exists
  if (!fs.existsSync(flowsDir)) {
    globalLogger.error('No /steps directory found')
    return []
  }

  // Get all flow folders
  return parseFlowFolder(flowsDir, [])
}
