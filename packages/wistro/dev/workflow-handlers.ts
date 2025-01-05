import { Event, EventManager } from './event-manager'
import { spawn } from 'child_process'
import path from 'path'
import { WorkflowStep } from './config.types'
import { AdapterConfig } from '../state/createStateAdapter'
import { broadcastLog } from './wistro-ws'

const nodeRunner = path.join(__dirname, 'node', 'node-runner.js')
const pythonRunner = path.join(__dirname, 'python', 'python-runner.py')

const callWorkflowFile = <TData>(flowPath: string, data: TData, eventManager: EventManager): Promise<void> => {
  const isPython = flowPath.endsWith('.py')

  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data)

    const runner = isPython ? pythonRunner : nodeRunner
    const command = isPython ? 'python' : 'node'

    const child = spawn(command, [runner, flowPath, jsonData], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })

    child.on('message', (message: Event<unknown>) => {
      console.log(`[${command} Runner] Received message`, message)
      eventManager.emit(message)
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

export const createWorkflowHandlers = (
  workflows: WorkflowStep[],
  eventManager: EventManager,
  stateConfig: AdapterConfig,
) => {
  console.log(`[Workflows] Creating workflow handlers for ${workflows.length} workflows`)

  workflows.forEach((workflow) => {
    const { config, file, filePath } = workflow
    const { subscribes } = config

    console.log(`[Workflows] Establishing workflow subscriptions ${file}`)

    subscribes.forEach((subscribe) => {
      eventManager.subscribe(subscribe, file, async (event) => {
        console.log(`[Workflow] ${file} received event`, event)
        broadcastLog(`[Workflow] ${file} received event`, { event })

        try {
          await callWorkflowFile(filePath, [event.data, stateConfig], eventManager)
        } catch (error) {
          console.error(`[Workflow] ${file} error calling workflow`, { error, filePath })
        }
      })
    })
  })
}
