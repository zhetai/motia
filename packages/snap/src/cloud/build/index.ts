import { LockedData } from '@motiadev/core'
import fs from 'fs'
import path from 'path'
import { collectFlows } from '../../generate-locked-data'
import { Builder } from './builder'
import { NodeBuilder } from './builders/node'
import { PythonBuilder } from './builders/python'

export const build = async (): Promise<Builder> => {
  const projectDir = process.cwd()
  const builder = new Builder(projectDir)
  const stepsConfigPath = path.join(projectDir, 'dist', 'motia.steps.json')

  // Register language-specific builders
  builder.registerBuilder('node', new NodeBuilder(builder))

  const distDir = builder.distDir
  fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })

  const lockedData = new LockedData(projectDir)

  lockedData.disablePrinter()

  await collectFlows(projectDir, lockedData)

  const hasPythonSteps = lockedData.activeSteps.some((step) => step.filePath.endsWith('.py'))

  if (hasPythonSteps) {
    builder.registerBuilder('python', new PythonBuilder(builder))
  }

  await Promise.all(lockedData.activeSteps.map((step) => builder.buildStep(step)))

  fs.writeFileSync(stepsConfigPath, JSON.stringify(builder.stepsConfig, null, 2))

  return builder
}
