import * as fs from 'fs'
import * as path from 'path'
import { printMotiaDockerIntro } from './utils/print-intro'
import { buildDockerImage } from './utils/build-docker-image'

export const build = async (projectName?: string): Promise<void> => {
  printMotiaDockerIntro()

  if (!projectName) {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    projectName = packageJson.name
  }

  console.log(`Preparing the docker image for project: ${projectName}`)

  await buildDockerImage(projectName)
}
