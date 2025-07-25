import { LockedData } from './locked-data'
import { Express } from 'express'
import fs from 'fs/promises'
import { generateStepId } from './helper/flows-helper'

export const stepEndpoint = (app: Express, lockedData: LockedData) => {
  app.get('/step/:stepId', async (req, res) => {
    const stepId = req.params.stepId

    const allSteps = [...lockedData.activeSteps, ...lockedData.devSteps]
    const step = allSteps.find((step) => generateStepId(step.filePath) === stepId)

    if (!step) {
      res.status(404).send({
        error: 'Step not found',
      })
      return
    }

    try {
      const content = await fs.readFile(step.filePath, 'utf8')
      res.status(200).send({
        id: stepId,
        content,
      })
    } catch (error) {
      console.error('Error reading step file:', error)
      res.status(500).send({
        error: 'Failed to read step file',
      })
    }
  })
}
