import { LockedData } from './locked-data'
import { RpcProcessor } from './step-handler-rpc-processor'
import { Event, EventConfig, EventManager, InternalStateManager, Step } from './types'
import { spawn } from 'child_process'
import path from 'path'
import { isAllowedToEmit } from './utils'

type StateGetInput = { traceId: string; key: string }
type StateSetInput = { traceId: string; key: string; value: unknown }
type StateDeleteInput = { traceId: string; key: string }
type StateClearInput = { traceId: string }

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
    return { runner: pythonRunner, command: 'python' }
  } else if (isRuby) {
    return { runner: rubyRunner, command: 'ruby' }
  } else if (isNode) {
    return { runner: nodeRunner, command: 'node' }
  }

  throw Error(`Unsupported file extension ${stepFilePath}`)
}

export const callStepFile = <TData>(
  step: Step<EventConfig>,
  lockedData: LockedData,
  event: Event<TData>,
  eventManager: EventManager,
  state: InternalStateManager,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify({ ...event })
    const { runner, command } = getLanguageBasedRunner(step.filePath)

    const child = spawn(command, [runner, step.filePath, jsonData], {
      stdio: [undefined, undefined, undefined, 'ipc'],
    })

    const rpcProcessor = new RpcProcessor(child)

    rpcProcessor.handler<StateGetInput>('close', async () => child.kill())
    rpcProcessor.handler<StateGetInput>('log', async (input: unknown) => event.logger.log(input))
    rpcProcessor.handler<StateGetInput>('state.get', (input) => state.get(input.traceId, input.key))
    rpcProcessor.handler<StateSetInput>('state.set', (input) => state.set(input.traceId, input.key, input.value))
    rpcProcessor.handler<StateDeleteInput>('state.delete', (input) => state.delete(input.traceId, input.key))
    rpcProcessor.handler<StateClearInput>('state.clear', (input) => state.clear(input.traceId))
    rpcProcessor.handler<Event>('emit', async (input) => {
      if (!isAllowedToEmit(step, input.type)) {
        lockedData.printer.printInvalidEmit(step, input.type)

        return
      }

      return eventManager.emit(
        {
          ...input,
          traceId: event.traceId,
          flows: event.flows,
          logger: event.logger,
        },
        step.filePath,
      )
    })

    rpcProcessor.init()

    child.stdout?.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString())
        event.logger.log(message)
      } catch {
        event.logger.info(Buffer.from(data).toString(), { step })
      }
    })

    child.stderr?.on('data', (data) => event.logger.error(Buffer.from(data).toString(), { step }))

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Process exited with code ${code}`))
      } else {
        resolve()
      }
    })
  })
}
