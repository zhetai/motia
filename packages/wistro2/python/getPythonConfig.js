const { spawn } = require('child_process')
const path = require('path')

module.exports.getPythonConfig = (file) => {
  const getConfig = path.join(__dirname, 'getConfig.py')

  return new Promise((resolve, reject) => {
    let config = null

    const child = spawn('python', [getConfig, file], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
  
    child.on('message', (message) => {
      console.log('[Python Config] Received message', message)
      config = message
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`))
      } else if (!config) {
        reject(new Error(`No config found for file ${file}`))
      } else {
        resolve(config)
      }
    })
  })
}