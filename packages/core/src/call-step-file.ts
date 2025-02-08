import { RpcProcessor } from './step-handler-rpc-processor'
import { Event, EventManager, InternalStateManager, Step } from './types'
import { spawn } from 'child_process'
import path from 'path'
import { isAllowedToEmit } from './utils'
import { BaseLogger } from './logger'
import { Printer } from './printer'

type StateGetInput = { traceId: string; key: string }
type StateSetInput = { traceId: string; key: string; value: unknown }
type StateDeleteInput = { traceId: string; key: string }
type StateClearInput = { traceId: string }

const getLanguageBasedRunner = (
  stepFilePath = '',
): {
  command: string
  runner: string
  args: string[]
} => {
  const isPython = stepFilePath.endsWith('.py')
  const isRuby = stepFilePath.endsWith('.rb')
  const isNode = stepFilePath.endsWith('.js') || stepFilePath.endsWith('.ts')

  if (isPython) {
    const pythonRunner = path.join(__dirname, 'python', 'python-runner.py')
    return { runner: pythonRunner, command: 'python', args: [] }
  } else if (isRuby) {
    const rubyRunner = path.join(__dirname, 'ruby', 'ruby-runner.rb')
    return { runner: rubyRunner, command: 'ruby', args: [] }
  } else if (isNode) {
    if (process.env._MOTIA_TEST_MODE === 'true') {
      const nodeRunner = path.join(__dirname, 'node', 'node-runner.ts')
      return { runner: nodeRunner, command: 'node', args: ['-r', 'ts-node/register'] }
    }

    const nodeRunner = path.join(__dirname, 'node', 'node-runner.js')
    return { runner: nodeRunner, command: 'node', args: [] }
  }

  throw Error(`Unsupported file extension ${stepFilePath}`)
}

type CallStepFileOptions = {
  step: Step
  logger: BaseLogger
  eventManager: EventManager
  state: InternalStateManager
  traceId: string
  printer: Printer
  data?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  contextInFirstArg: boolean // if true, the step file will only receive the context object
}

export const callStepFile = <TData>(options: CallStepFileOptions): Promise<TData | undefined> => {
  const { step, printer, eventManager, state, traceId, data, contextInFirstArg } = options
  const logger = options.logger.child({ step: step.config.name })
  const flows = step.config.flows

  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify({ data, flows, traceId, contextInFirstArg })
    const { runner, command, args } = getLanguageBasedRunner(step.filePath)
    let result: TData | undefined

    const child = spawn(command, [...args, runner, step.filePath, jsonData], {
      stdio: [undefined, undefined, undefined, 'ipc'],
    })

    const rpcProcessor = new RpcProcessor(child)

    rpcProcessor.handler<StateGetInput>('close', async () => child.kill())
    rpcProcessor.handler<StateGetInput>('log', async (input: unknown) => logger.log(input))
    rpcProcessor.handler<StateGetInput>('state.get', (input) => state.get(input.traceId, input.key))
    rpcProcessor.handler<StateSetInput>('state.set', (input) => state.set(input.traceId, input.key, input.value))
    rpcProcessor.handler<StateDeleteInput>('state.delete', (input) => state.delete(input.traceId, input.key))
    rpcProcessor.handler<StateClearInput>('state.clear', (input) => state.clear(input.traceId))
    rpcProcessor.handler<TData>('result', async (input) => {
      result = input
    })
    rpcProcessor.handler<Event>('emit', async (input) => {
      if (!isAllowedToEmit(step, input.type)) {
        return printer.printInvalidEmit(step, input.type)
      }

      return eventManager.emit({ ...input, traceId, flows: step.config.flows, logger }, step.filePath)
    })

    rpcProcessor.init()

    child.stdout?.on('data', (data) => {
      try {
        const message = JSON.parse(data.toString())
        logger.log(message)
      } catch {
        logger.info(Buffer.from(data).toString())
      }
    })

    child.stderr?.on('data', (data) => logger.error(Buffer.from(data).toString()))

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Process exited with code ${code}`))
      } else {
        resolve(result)
      }
    })
  })
}
