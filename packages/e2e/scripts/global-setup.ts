import { execSync, exec } from 'child_process'
import { existsSync, rmSync } from 'fs'
import path from 'path'

const TEST_PROJECT_NAME = 'motia-e2e-test-project'
const TEST_PROJECT_PATH = path.join(process.cwd(), TEST_PROJECT_NAME)

async function globalSetup() {
  console.log('🚀 Setting up E2E test environment...')

  try {
    if (existsSync(TEST_PROJECT_PATH)) {
      console.log('🧹 Cleaning up existing test project...')
      rmSync(TEST_PROJECT_PATH, { recursive: true, force: true })
    }

    console.log('📦 Creating test project with Motia CLI...')
    const motiaVersion = process.env.MOTIA_VERSION || 'next'
    execSync(`npx motia@${motiaVersion} create -n ${TEST_PROJECT_NAME}`, {
      stdio: 'pipe',
      cwd: process.cwd()
    })

    console.log('🏗️  Building test project...')

    console.log('🌟 Starting test project server...')
    const serverProcess = exec('npm run dev', { cwd: TEST_PROJECT_PATH })

    console.log('⏳ Waiting for server to be ready...')
    await waitForServer('http://localhost:3000', 60000)

    console.log('✅ E2E test environment setup complete!')

    process.env.TEST_PROJECT_PATH = TEST_PROJECT_PATH
    process.env.TEST_PROJECT_NAME = TEST_PROJECT_NAME

  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error)
    
    if (existsSync(TEST_PROJECT_PATH)) {
      rmSync(TEST_PROJECT_PATH, { recursive: true, force: true })
    }
    
    throw error
  }
}

async function waitForServer(url: string, timeout: number): Promise<void> {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch (error) {
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  throw new Error(`Server at ${url} did not start within ${timeout}ms`)
}

export default globalSetup 