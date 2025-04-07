import path from 'path'
import fs from 'fs'
import { executeCommand } from './utils/executeCommand'

export const install = async (isVerbose: boolean = false): Promise<void> => {
  const baseDir = process.cwd()
  const venvPath = path.join(baseDir, 'python_modules')
  const isWindows = process.platform === 'win32'
  const venvBinPath = path.join(venvPath, isWindows ? 'Scripts' : 'bin')

  try {
    // Check if virtual environment exists
    if (!fs.existsSync(venvPath)) {
      console.log('📦 Creating Python virtual environment...')
      await executeCommand('python3 -m venv python_modules', baseDir)
    }

    // Install requirements
    console.log('📥 Installing Python dependencies...')
    const pipPath = path.join(venvBinPath, isWindows ? 'pip.exe' : 'pip')
    await executeCommand(`${pipPath} install -r requirements.txt`, baseDir)

    console.log('✅ Installation completed successfully!')

    if (isVerbose) {
      const pythonPath = path.join(venvBinPath, isWindows ? 'python.exe' : 'python')
      console.log('🐍 Using Python from:', pythonPath)
    }
  } catch (error) {
    console.error('❌ Installation failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}
