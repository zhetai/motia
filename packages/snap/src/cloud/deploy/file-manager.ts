import { CliContext } from '../config-utils'
import { createFolderZip } from './utils/archive'

export class FileManager {
  constructor(private readonly context: CliContext) {}

  async createDeployableZip(versionId: string, folderPath: string): Promise<{ filePath: string; cleanup: () => void }> {
    try {
      this.context.log('preparing-zip', (message) =>
        message.tag('progress').append('Preparing version package file...'),
      )
      const zipFilePath = await createFolderZip(versionId, folderPath)

      this.context.log('preparing-zip', (message) =>
        message.tag('success').append('Version package file created successfully'),
      )

      return zipFilePath
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.context.log('preparing-zip', (message) =>
        message.tag('failed').append(`Failed to create version package file: ${errorMessage}`, 'red'),
      )
      process.exit(1)
    }
  }
}
