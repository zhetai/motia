import path from 'path'
import { getPythonConfig } from './python/get-python-config'
import { FlowStep } from './config.types'
import { LockFile } from '../wistro.types'
import { globalLogger } from './logger'
import { getRubyConfig } from './ruby/get-ruby-config'

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
})

export const buildLockDataFlows = async (lockData: LockFile, nextFlows: FlowStep[]): Promise<FlowStep[]> => {
  const flowsFromLock = lockData.flows || {}
  let flows: FlowStep[] = [...nextFlows]

  globalLogger.debug('[Flows] Building flows from lock file', { version: lockData.version })

  for (const [_, flowData] of Object.entries(flowsFromLock)) {
    for (const { filePath: stepPath } of flowData.steps) {
      const stepFilePath = path.join(lockData.baseDir, stepPath)
      const isPython = stepFilePath.endsWith('.py')
      const isRuby = stepFilePath.endsWith('.rb')
      const isJsTs = stepFilePath.endsWith('.ts') || stepFilePath.endsWith('.js')

      if (isPython) {
        globalLogger.debug('[Flows] Building Python flow from lock', { stepPath: stepFilePath })
        const config = await getPythonConfig(stepFilePath)
        flows.push({ config, file: path.basename(stepFilePath), filePath: stepFilePath })
      } else if (isRuby) {
        globalLogger.debug('[Flows] Building Ruby flow from lock', { stepPath: stepFilePath })
        const config = await getRubyConfig(stepFilePath)
        flows.push({ config, file: path.basename(stepFilePath), filePath: stepFilePath })
      } else if (isJsTs) {
        globalLogger.debug('[Flows] Building Node flow from lock', { stepPath: stepFilePath })
        const module = require(stepFilePath)
        if (!module.config) {
          globalLogger.debug(`[Flows] Skipping step ${stepFilePath} as it does not have a valid config`)
          continue
        }
        const config = module.config
        flows.push({ config, file: path.basename(stepFilePath), filePath: stepFilePath })
      } else {
        globalLogger.debug('[Flows] Skipping step, file extension not supported', { stepPath: stepFilePath })
      }
    }
  }

  return flows
}

// Updated buildFlows to use lock file
export const buildFlows = async (lockData: LockFile): Promise<FlowStep[]> => {
  return buildLockDataFlows(lockData, [])
}
