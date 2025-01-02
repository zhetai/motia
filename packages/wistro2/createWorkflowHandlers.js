const { spawn } = require('child_process')
const path = require('path')

const nodeRunner = path.join(__dirname, 'node', 'nodeRunner.js')
const pythonRunner = path.join(__dirname, 'python', 'pythonRunner.py')

const callWorkflowFile = (file, data, eventManager) => {
  const isPython = file.endsWith('.py')

  return new Promise((resolve, reject) => {
    const flowPath = path.join(process.cwd(), 'flows', file)
    const jsonData = JSON.stringify(data)

    const runner = isPython ? pythonRunner : nodeRunner
    const command = isPython ? 'python' : 'node'

    const child = spawn(command, [runner, flowPath, jsonData], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })

    child.on('message', (message) => {
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


const createWorkflowHandlers = (workflows, eventManager) => {
  console.log(`[Workflows] Creating workflow handlers for ${workflows.length} workflows`)
  
  workflows.forEach(workflow => {
    const { config, file } = workflow
    const { subscribes } = config

    subscribes.forEach(subscribe => {
      console.log(`[Workflow Sub] ${file} subscribing to ${subscribe}`)
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

exports.createWorkflowHandlers = createWorkflowHandlers
