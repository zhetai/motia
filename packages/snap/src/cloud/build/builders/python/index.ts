import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import archiver from 'archiver'
import { Step } from '@motiadev/core'

import { Builder, StepBuilder } from '../../builder'
import { addPackageToArchive } from './add-package-to-archive'
import { activatePythonVenv } from '../../../../utils/activate-python-env'

export class PythonBuilder implements StepBuilder {
  constructor(private readonly builder: Builder) {
    activatePythonVenv({ baseDir: this.builder.projectDir })
  }

  async build(step: Step): Promise<void> {
    const entrypointPath = step.filePath.replace(this.builder.projectDir, '')
    const bundlePath = path.join('python', entrypointPath.replace(/(.*)\.py$/, '$1.zip'))
    const normalizedEntrypointPath = entrypointPath.replace(/[.]step.py$/, '_step.py')
    const outfile = path.join(this.builder.distDir, bundlePath)

    try {
      // Create output directory
      fs.mkdirSync(path.dirname(outfile), { recursive: true })
      this.builder.printer.printStepBuilding(step)

      // Set up archive
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level
      })
      const outputStream = fs.createWriteStream(outfile)
      archive.pipe(outputStream)

      // Get Python builder response
      const { packages } = await this.getPythonBuilderData(step)

      // Add main file to archive
      if (!fs.existsSync(step.filePath)) {
        throw new Error(`Source file not found: ${step.filePath}`)
      }

      archive.append(fs.createReadStream(step.filePath), {
        name: path.relative(this.builder.projectDir, normalizedEntrypointPath),
      })

      // Add all imported files to archive
      this.builder.printer.printStepBuilding(step, 'Adding imported files to archive...')
      const sitePackagesDir = `${process.env.PYTHON_SITE_PACKAGES}-lambda`

      await Promise.all(packages.map(async (packageName) => addPackageToArchive(archive, sitePackagesDir, packageName)))
      this.builder.printer.printStepBuilding(step, `Added ${packages.length} packages to archive`)

      // Finalize the archive and wait for completion
      const size = await new Promise<number>((resolve, reject) => {
        outputStream.on('close', () => resolve(archive.pointer()))
        outputStream.on('error', reject)
        archive.finalize()
      })

      this.builder.registerStep({ entrypointPath: normalizedEntrypointPath, bundlePath, step, type: 'python' })
      this.builder.printer.printStepBuilt(step, size)
    } catch (err) {
      this.builder.printer.printStepFailed(step, err as Error)
      throw err
    }
  }

  private async getPythonBuilderData(step: Step): Promise<{ file: string; files: string[]; packages: string[] }> {
    return new Promise((resolve, reject) => {
      const child = spawn('python', [path.join(__dirname, 'python-builder.py'), step.filePath], {
        cwd: this.builder.projectDir,
        stdio: [undefined, undefined, 'pipe', 'ipc'],
      })
      const err: string[] = []

      child.on('stderr', (data) => err.push(data.toString()))
      child.on('message', resolve)
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(err.join('')))
        }
      })
    })
  }
}
