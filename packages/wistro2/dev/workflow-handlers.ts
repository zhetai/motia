import { Event, EventManager } from './event-manager'
import { spawn } from 'child_process'
import path from 'path'
import { Workflow } from './config.types'

const nodeRunner = path.join(__dirname, 'node', 'node-runner.js')
const pythonRunner = path.join(__dirname, 'python', 'python-runner.py')

const callWorkflowFile = <TData>(file: string, data: TData, eventManager: EventManager): Promise<void> => {
  const isPython = file.endsWith('.py')

  return new Promise((resolve, reject) => {
    const flowPath = path.join(process.cwd(), 'flows', file)
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

export const createWorkflowHandlers = (workflows: Workflow[], eventManager: EventManager) => {
  console.log(`[Workflows] Creating workflow handlers for ${workflows.length} workflows`)

  workflows.forEach((workflow) => {
    const { config, file } = workflow
    const { subscribes } = config

    subscribes.forEach((subscribe) => {
      eventManager.subscribe(subscribe, file, async (event) => {
        console.log(`[Workflow] ${file} received event`, event)

        try {
          await callWorkflowFile(file, event.data, eventManager)
        } catch (error) {
          console.error(`[Workflow] ${file} error calling workflow`, error)
        }
      })
    })
  })
}
