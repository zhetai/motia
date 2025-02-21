import fs from 'fs'
import path from 'path'
import { MotiaServer } from '@motiadev/core'

export const workflowConfigEndpoints = (server: MotiaServer, baseDir: string) => {
  const { app } = server

  app.post('/flows/:id/config', async (req, res) => {
    const { id } = req.params
    const config = req.body
    const configDir = path.join(baseDir, '.motia', 'flow-config')
    const configPath = path.join(configDir, `${id}.workflow.config.json`)

    try {
      fs.mkdirSync(configDir, { recursive: true })
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      res.status(200).send({ message: 'Workflow config saved' })
    } catch (error) {
      console.error('Error saving workflow config:', error)
      res.status(500).json({ error: 'Failed to save workflow config' })
    }
  })

  app.get('/flows/:id/config', async (req, res) => {
    const { id } = req.params
    const configPath = path.join(baseDir, '.motia', 'flow-config', `${id}.workflow.config.json`)

    try {
      const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {}
      res.status(200).send(config)
    } catch (error) {
      console.error('Error reading workflow config:', error)
      res.status(200).send({})
    }
  })
}
