import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

export async function createFolderZip(
  versionId: string,
  folderPath: string,
): Promise<{ filePath: string; cleanup: () => void }> {
  const outputPath = path.join(process.cwd(), '.motia', 'versions')
  fs.mkdirSync(outputPath, { recursive: true })

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(folderPath)) {
      reject(new Error(`Folder not found: ${folderPath}`))
      return
    }

    const distDir = path.dirname(outputPath)
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }

    const zipFileName = `${versionId}.zip`
    const zipFilePath = path.join(outputPath, zipFileName)

    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver('zip', {
      zlib: { level: 0 },
    })

    output.on('close', () => {
      resolve({ filePath: zipFilePath, cleanup: () => removeZipFile(zipFilePath) })
    })

    archive.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)
    archive.directory(folderPath, false)
    archive.finalize()
  })
}

export function removeZipFile(zipFilePath: string): void {
  try {
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath)
    }
  } catch (error) {
    console.error(
      `Failed to remove temporary zip file ${zipFilePath}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
