import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import { platform } from 'os'

async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...')

  try {
    console.log('🛑 Stopping test project server...')
    
    const isWindows = platform() === 'win32'
    
    if (isWindows) {
      try {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'pipe' })
      } catch (error) {
      }
    } else {
      try {
        execSync('lsof -ti:3000 | xargs kill -9', { stdio: 'pipe' })
      } catch (error) {
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    const testProjectPath = process.env.TEST_PROJECT_PATH
    if (testProjectPath && existsSync(testProjectPath)) {
      console.log('🗑️  Removing test project directory...')
      rmSync(testProjectPath, { recursive: true, force: true })
    }

    console.log('✅ E2E test environment cleanup complete!')

  } catch (error) {
    console.error('❌ Failed to cleanup E2E test environment:', error)
  }
}

export default globalTeardown 