import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

interface VenvConfig {
  baseDir: string
  isVerbose?: boolean
}

export const installLambdaPythonPackages = ({ baseDir, isVerbose = false }: VenvConfig): void => {
  const sitePackagesPath = `${process.env.PYTHON_SITE_PACKAGES}-lambda`

  // Check if requirements.txt exists
  const requirementsPath = path.join(baseDir, 'requirements.txt')
  if (!fs.existsSync(requirementsPath)) {
    console.warn('❌ requirements.txt not found')
    return
  }

  try {
    // Install packages to lambda site-packages with platform specification
    const command = `pip install -r "${requirementsPath}" --target "${sitePackagesPath}" --platform manylinux2014_x86_64 --only-binary=:all: --upgrade --upgrade-strategy only-if-needed`
    if (isVerbose) {
      console.log('📦 Installing Python packages with platform specification...')
      console.log('📦 Command:', command)
    }
    execSync(command, { stdio: 'inherit' })
    console.log('✅ Python packages for lambda installed successfully')
  } catch (error) {
    console.error('❌ Failed to install Python packages for lambda:', error)
    throw error
  }
}
