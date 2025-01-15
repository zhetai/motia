import { Event, EventManager, Step } from './types'
import { spawn } from 'child_process'
import path from 'path'
import { AdapterConfig } from './state/createStateAdapter'
import { globalLogger } from './logger'
import { isEventStep } from './guards'

const nodeRunner = path.join(__dirname, 'node', 'node-runner.js')
const pythonRunner = path.join(__dirname, 'python', 'python-runner.py')
const rubyRunner = path.join(__dirname, 'ruby', 'ruby_runner.rb')

const getLanguageBasedRunner = (
  stepFilePath = '',
): {
  command: string
  runner: string
} => {
  const isPython = stepFilePath.endsWith('.py')
  const isRuby = stepFilePath.endsWith('.rb')
  const isNode = stepFilePath.endsWith('.js') || stepFilePath.endsWith('.ts')

  if (isPython) {
    return {
      runner: pythonRunner,
      command: 'python',
    }
  }

  if (isRuby) {
    return {
      runner: rubyRunner,
      command: 'ruby',
    }
  }

  if (isNode) {
    return {
      runner: nodeRunner,
      command: 'node',
    }
  }

  throw Error(`Unsupported file extension ${stepFilePath}`)
}

const callStepFile = <TData>(
  stepPath: string,
  step: string,
  event: Event<TData>,
  stateConfig: AdapterConfig,
  eventManager: EventManager,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify({ ...event, stateConfig })
    const { runner, command } = getLanguageBasedRunner(stepPath)

    const child = spawn(command, [runner, stepPath, jsonData], {
      stdio: [undefined, undefined, undefined, 'ipc'],
    })

    child.stdout?.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString())
        event.logger.log(message)
      } catch (error) {
        event.logger.info(Buffer.from(data).toString(), { step })
      }
    })

    child.stderr?.on('data', (data) => event.logger.error(Buffer.from(data).toString(), { step }))

    child.on('message', (message: Event<unknown>) => {
      eventManager.emit({ ...message, traceId: event.traceId, flows: event.flows, logger: event.logger }, stepPath)
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}

export const createStepHandlers = (steps: Step[], eventManager: EventManager, stateConfig: AdapterConfig) => {
  globalLogger.debug(`[step handler] creating step handlers for ${steps.length} steps`)

  steps.filter(isEventStep).forEach((step) => {
    const { config, filePath } = step
    const { subscribes } = config

    globalLogger.debug('[step handler] establishing step subscriptions', { filePath, step: step.config.name })

    subscribes.forEach((subscribe) => {
      eventManager.subscribe(subscribe, step.config.name, async (event) => {
        const { logger, ...rest } = event
        globalLogger.debug('[step handler] received event', { event: rest, step: step.config.name })

        try {
          await callStepFile(filePath, step.config.name, event, stateConfig, eventManager)
        } catch (error: any) {
          globalLogger.error(`[step handler] error calling steo`, {
            error: error.message,
            filePath,
            step: step.config.name,
          })
        }
      })
    })
  })
}
