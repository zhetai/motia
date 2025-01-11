import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

const version = `${randomUUID()}:${Math.floor(Date.now() / 1000)}`

// Helper function to read config.yml
const readConfig = (configPath: string): any => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}`)
  }
  const configContent = fs.readFileSync(configPath, 'utf-8')
  return yaml.parse(configContent)
}

// Helper function to recursively collect flow data
const collectFlows = (folderPath: string, flows: Record<string, any>, baseDir: string): Record<string, any> => {
  const folderItems = fs.readdirSync(folderPath, { withFileTypes: true })

  for (const item of folderItems) {
    const itemPath = path.join(folderPath, item.name)

    if (item.isDirectory()) {
      collectFlows(itemPath, flows, baseDir)
    } else if (item.name.endsWith('.step.ts') || item.name.endsWith('.step.js') || item.name.endsWith('.step.py')) {
      const fileContent = fs.readFileSync(itemPath, 'utf-8')
      const flowMatch = fileContent.match(/flows\"?:\s*\[([^\]]+)\]/)

      if (flowMatch) {
        const flowNames = flowMatch[1].split(',').map((f) => f.trim().replace(/['"`]/g, ''))

        for (const flowName of flowNames) {
          if (!flows[flowName]) {
            flows[flowName] = { steps: [] }
          }
          flows[flowName].steps.push({
            filePath: `./${path.relative(baseDir, itemPath)}`,
            version,
          })
        }
      }
    }
  }

  return flows
}

export const generateLockFile = async (projectDir: string) => {
  const stepsDir = path.join(projectDir, 'steps')
  const configPath = path.join(projectDir, 'config.yml')
  const lockFilePath = path.join(projectDir, 'wistro.lock.json')

  try {
    const config = readConfig(configPath)
    const flows: Record<string, any> = {}

    // Collect flow data from steps folder
    collectFlows(stepsDir, flows, projectDir)

    // Merge flow descriptions from config.yml
    for (const [flowName, flowData] of Object.entries(flows)) {
      const configFlow = config.flows?.[flowName] || {}
      flows[flowName] = {
        ...configFlow,
        steps: flowData.steps,
        version,
      }
    }

    // Prepare the lock file data
    const lockData = {
      version,
      port: config?.port,
      state: config?.state || {},
      triggers: {
        api: config?.api || { paths: {} },
        cron: config?.cron || {},
      },
      flows,
    }

    // Write the lock file
    fs.writeFileSync(lockFilePath, JSON.stringify(lockData, null, 2))

    console.log(`Lock file generated at ${lockFilePath}`)
  } catch (error) {
    console.error('Error generating lock file:', error)
  }
}
