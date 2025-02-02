import { LockedData, Step, getStepConfig } from '@motiadev/core'
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`
const baseFlowRegex = new RegExp(/flows"?\s?.*\s*\[([^\]]+)\]/)

// Helper function to read config.yml
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readConfig = (configPath: string): any => {
  if (!fs.existsSync(configPath)) {
    console.warn(`Config file not found at ${configPath}`)

    return {}
  }
  const configContent = fs.readFileSync(configPath, 'utf-8')
  return yaml.parse(configContent)
}

// Helper function to recursively collect flow data
const collectFlows = async (baseDir: string): Promise<Step[]> => {
  const folderItems = fs.readdirSync(baseDir, { withFileTypes: true })
  let steps: Step[] = []

  for (const item of folderItems) {
    const filePath = path.join(baseDir, item.name)

    if (item.isDirectory()) {
      steps = steps.concat(await collectFlows(filePath))
    } else if (item.name.match(/\.step\.(ts|js|py|rb)$/)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const flowMatch = fileContent.match(baseFlowRegex)

      const config = await getStepConfig(filePath)

      if (!config) {
        console.warn(`No config found in step ${filePath}, step skipped`)
        continue
      }

      if (flowMatch) {
        steps.push({ filePath, version, config })
      }
    }
  }

  return steps
}

export const generateLockedData = async (projectDir: string): Promise<LockedData> => {
  try {
    /*
     * NOTE: right now for performance and simplicity let's enforce a folder,
     * but we might want to remove this and scan the entire current directory
     */
    const sourceSteps = await collectFlows(path.join(projectDir, 'steps'))
    const lockedData = new LockedData(projectDir)

    sourceSteps.forEach((step) => lockedData.createStep(step))

    return lockedData
  } catch (error) {
    console.error(error)
    throw Error('Failed to parse the project, generating locked data step failed')
  }
}
