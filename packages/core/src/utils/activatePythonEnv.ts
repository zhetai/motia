import path from 'path'
import fs from 'fs'

interface VenvConfig {
  baseDir: string
  isVerbose?: boolean
}

export const activatePythonVenv = ({ baseDir, isVerbose = false }: VenvConfig): void => {
  // Set the virtual environment path
  const venvPath = path.join(baseDir, 'python_modules')
  const venvBinPath = path.join(venvPath, process.platform === 'win32' ? 'Scripts' : 'bin')

  // Verify that the virtual environment exists
  if (fs.existsSync(venvPath)) {
    // Add virtual environment to PATH
    process.env.PATH = `${venvBinPath}${path.delimiter}${process.env.PATH}`
    // Set VIRTUAL_ENV environment variable
    process.env.VIRTUAL_ENV = venvPath
    // Remove PYTHONHOME if it exists as it can interfere with venv
    delete process.env.PYTHONHOME

    // Log Python environment information if verbose mode is enabled
    if (isVerbose) {
      const pythonPath =
        process.platform === 'win32' ? path.join(venvBinPath, 'python.exe') : path.join(venvBinPath, 'python')
      console.log('🐍 Using Python from:', pythonPath)
    }
  } else {
    console.warn('❌ Python virtual environment not found in python_modules/')
  }
}
