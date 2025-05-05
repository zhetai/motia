import path from 'path'
import fs from 'fs'
import { executeCommand } from './utils/executeCommand'
import { activatePythonVenv } from './utils/activatePythonEnv'
import { installLambdaPythonPackages } from './utils/installLambdaPythonPackages'

interface InstallConfig {
  isVerbose?: boolean
  pythonVersion?: string
}

export const install = async ({ isVerbose = false, pythonVersion = '3.13' }: InstallConfig): Promise<void> => {
  const baseDir = process.cwd()
  const venvPath = path.join(baseDir, 'python_modules')
  console.log('📦 Installing Python dependencies...', venvPath)

  try {
    // Check if virtual environment exists
    if (!fs.existsSync(venvPath)) {
      console.log('📦 Creating Python virtual environment...')
      await executeCommand(`python${pythonVersion} -m venv python_modules`, baseDir)
    }

    activatePythonVenv({ baseDir, isVerbose, pythonVersion })
    installLambdaPythonPackages({ baseDir, isVerbose })

    // Install requirements
    console.log('📥 Installing Python dependencies...')

    // Core requirements
    const coreRequirementsPath = path.join(baseDir, 'node_modules', 'motia', 'dist', 'requirements-core.txt')
    if (fs.existsSync(coreRequirementsPath)) {
      if (isVerbose) {
        console.log('📄 Using core requirements from:', coreRequirementsPath)
      }
      await executeCommand(`pip install -r "${coreRequirementsPath}" --only-binary=:all:`, baseDir)
    } else {
      console.warn(`⚠️ Core requirements not found at: ${coreRequirementsPath}`)
    }

    // Snap requirements
    const snapRequirementsPath = path.join(baseDir, 'node_modules', 'motia', 'dist', 'requirements-snap.txt')
    if (fs.existsSync(snapRequirementsPath)) {
      if (isVerbose) {
        console.log('📄 Using snap requirements from:', snapRequirementsPath)
      }
      await executeCommand(`pip install -r "${snapRequirementsPath}" --only-binary=:all:`, baseDir)
    } else {
      console.warn(`⚠️ Snap requirements not found at: ${snapRequirementsPath}`)
    }

    // Project-specific requirements
    const localRequirements = path.join(baseDir, 'requirements.txt')
    if (fs.existsSync(localRequirements)) {
      if (isVerbose) {
        console.log('📄 Using project requirements from:', localRequirements)
      }
      await executeCommand(`pip install -r "${localRequirements}" --only-binary=:all:`, baseDir)
    }

    console.info('✅ Installation completed successfully!')
  } catch (error) {
    console.error('❌ Installation failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}
