import { promises as fs, statSync } from 'fs'
import * as path from 'path'
import { globSync } from 'glob'
import { CliContext } from '../../cloud/config-utils'

export type Generator = (rootDir: string, context: CliContext) => Promise<void>

export const generateTemplateSteps = (templateDir: string): Generator => {
  return async (rootDir: string, context: CliContext): Promise<void> => {
    const templatePath = path.join(__dirname, templateDir)
    const files = globSync('**/*', { absolute: false, cwd: templatePath })

    try {
      for (const fileName of files) {
        const filePath = path.join(templatePath, fileName)

        if (statSync(filePath).isDirectory()) {
          // ignore folders
          continue
        }

        const sanitizedFileName = fileName.replace('.txt', '')
        const generateFilePath = path.join(rootDir, sanitizedFileName)
        const content = await fs.readFile(filePath, 'utf8')

        await fs.writeFile(generateFilePath, content, 'utf8')
        context.log(sanitizedFileName, (message) => {
          message.tag('success').append('File').append(sanitizedFileName, 'cyan').append('has been created.')
        })
      }
    } catch (error) {
      console.error('Error generating template files:', error)
    }
  }
}
