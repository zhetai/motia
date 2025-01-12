import { Event, EventManager } from './../wistro.types'
import { spawn } from 'child_process'
import path from 'path'
import { FlowStep } from './config.types'
import { AdapterConfig } from '../state/createStateAdapter'
import { globalLogger } from './logger'

const nodeRunner = path.join(__dirname, 'node', 'node-runner.js')
const pythonRunner = path.join(__dirname, 'python', 'python-runner.py')
const rubyRunner = path.join(__dirname, 'ruby', 'ruby_runner.rb')

const getLanguageBasedRunner = (
  flowPath = '',
): {
  command: string
  runner: string
} => {
  const isPython = flowPath.endsWith('.py')
  const isRuby = flowPath.endsWith('.rb')
  const isNode = flowPath.endsWith('.js') || flowPath.endsWith('.ts')

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

  throw Error(`Unsupported file extension ${flowPath}`)
}

const callFlowFile = <TData>(
  flowPath: string,
  file: string,
  event: Event<TData>,
  stateConfig: AdapterConfig,
  eventManager: EventManager,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify({ ...event, stateConfig })
    const { runner, command } = getLanguageBasedRunner(flowPath)

    const child = spawn(command, [runner, flowPath, jsonData], {
      stdio: [undefined, undefined, undefined, 'ipc'],
    })

    child.stdout?.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString())
        event.logger.log(message)
      } catch (error) {
        event.logger.info(Buffer.from(data).toString(), { file })
      }
    })

    child.stderr?.on('data', (data) => event.logger.error(Buffer.from(data).toString(), { file }))

    child.on('message', (message: Event<unknown>) => {
      eventManager.emit({ ...message, traceId: event.traceId, flows: event.flows, logger: event.logger }, file)
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

export const createFlowHandlers = (flows: FlowStep[], eventManager: EventManager, stateConfig: AdapterConfig) => {
  globalLogger.debug(`[Flows] Creating flow handlers for ${flows.length} flows`)

  flows.forEach((flow) => {
    const { config, file, filePath } = flow
    const { subscribes } = config

    globalLogger.debug('[Flows] Establishing flow subscriptions', { file })

    subscribes.forEach((subscribe) => {
      eventManager.subscribe(subscribe, file, async (event) => {
        const { logger, ...rest } = event
        globalLogger.debug('[Flow] received event', { event: rest, file })

        try {
          await callFlowFile(filePath, file, event, stateConfig, eventManager)
        } catch (error: any) {
          globalLogger.error(`[Flow] Error calling flow`, { error: error.message, filePath, file })
        }
      })
    })
  })
}
