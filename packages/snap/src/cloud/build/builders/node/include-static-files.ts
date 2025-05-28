import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import archiver from 'archiver'
import { Step } from '@motiadev/core'
import { Builder } from '../../builder'

export const includeStaticFiles = (step: Step, builder: Builder, archive: archiver.Archiver) => {
  if ('includeFiles' in step.config) {
    const staticFiles = step.config.includeFiles

    if (!staticFiles || !Array.isArray(staticFiles) || staticFiles.length === 0) {
      return
    }

    staticFiles.forEach((file) => {
      const globPattern = path.join(path.dirname(step.filePath), file)
      const matches = globSync(globPattern)
      matches.forEach((filePath: string) => {
        const relativeFilePath = path.dirname(filePath.replace(builder.projectDir, ''))
        archive.append(fs.createReadStream(filePath), { name: path.resolve(relativeFilePath, path.basename(filePath)) })
      })
    })
  }
}
