import fs from 'fs'
import path from 'path'
import { createInterface } from 'readline'
import { CLIOutputManager, Message } from './cli-output-manager'
import { ApiFactory } from './api'
import { VersionService } from './deploy/services/version-service'
import { CliError } from './api/core/cli-error'

export interface Environment {
  id: string
  name: string
  description?: string
  apiUrl?: string
  projectId?: string
}

export interface ProjectConfig {
  id: string
  name: string
  description?: string
  selectedEnvironment?: string
}

export const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
})

export function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    readline.question(query, (answer) => {
      resolve(answer)
    })
  })
}

export function getConfigPath(): string {
  return path.join(process.cwd(), 'motia.config.json')
}

export function readConfig(): ProjectConfig | null {
  const configPath = getConfigPath()

  if (!fs.existsSync(configPath)) {
    return null
  }

  try {
    const configData = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(configData)
  } catch (error) {
    console.error('Error reading config file:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export function writeConfig(config: ProjectConfig): boolean {
  const configPath = getConfigPath()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('Error writing config file:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

export function exitWithError(output: CLIOutputManager, msg: string, error?: unknown): never {
  output.log('error', (message) => {
    message.tag('failed').append(msg)

    if (error) {
      message.box([error instanceof Error ? error.message : 'Unknown error'], 'red')
    }

    return message
  })
  readline.close()
  process.exit(1)
}

export class CliContext {
  private readonly output: CLIOutputManager

  public readonly config: ProjectConfig | null
  public readonly apiFactory: ApiFactory
  public readonly versionService: VersionService

  constructor(apiKey: string) {
    this.output = new CLIOutputManager()
    this.config = readConfig()
    this.apiFactory = new ApiFactory(apiKey)
    this.versionService = new VersionService(this)
  }

  requireConfig(): ProjectConfig {
    if (!this.config) {
      this.exitWithError('No motia.config.json found. Please initialize the project first with motiacloud init')
    }

    return this.config
  }

  log(id: string, callback: (message: Message) => void) {
    this.output.log(id, callback)
  }

  exitWithError(msg: string, error?: unknown): never {
    this.output.log('error', (message) => {
      message.tag('failed').append(msg)

      if (error) {
        message.box([error instanceof Error ? error.message : 'Unknown error'], 'red')
      }
    })
    readline.close()
    process.exit(1)
  }

  exit(code: number): never {
    readline.close()
    process.exit(code)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CliHandler = <TArgs extends Record<string, any>>(args: TArgs, context: CliContext) => Promise<void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handler(handler: CliHandler): (args: Record<string, any>) => Promise<void> {
  return async (args: Record<string, unknown>) => {
    const context = new CliContext(args.apiKey as string)

    try {
      await handler(args, context)
      context.exit(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof CliError) {
        context.log('error', (message) => error.print(message.tag('failed')))
        context.exit(1)
      } else {
        context.exitWithError('An error occurred', error)
      }
    }
  }
}
