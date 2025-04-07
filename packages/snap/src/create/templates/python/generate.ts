import { promises as fs } from 'fs'
import * as path from 'path'

export const generateStepFiles = async (flowDir: string, files: { [key: string]: string }): Promise<void> => {
  try {
    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(flowDir, fileName)
      await fs.writeFile(filePath, content, 'utf8')
      console.log(`Step ${filePath} has been created.`)
    }
  } catch (error) {
    console.error('Error generating template files:', error)
  }
}

export const generatePythonTemplateSteps = async (flowDir: string): Promise<void> => {
  const stepFiles = {
    'noop.step.ts': await fs.readFile(path.join(__dirname, 'steps', 'noop.step.txt'), 'utf8'),
    'noop.step.tsx': await fs.readFile(path.join(__dirname, 'steps', 'noop.step.tsx.txt'), 'utf8'),
    'one.step.py': await fs.readFile(path.join(__dirname, 'steps', 'one.step.txt'), 'utf8'),
    'two.step.py': await fs.readFile(path.join(__dirname, 'steps', 'two.step.txt'), 'utf8'),
    'api.step.py': await fs.readFile(path.join(__dirname, 'steps', 'api.step.txt'), 'utf8'),
  }

  await generateStepFiles(flowDir, stepFiles)
}
