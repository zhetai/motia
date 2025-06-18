import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test'

export const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI
    ? [['html'], ['list'], ['github'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['html'], ['list'], ['dot']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    testIdAttribute: 'data-testid',
  },

  testIgnore: '**/release/**',

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ...(process.env.CI
      ? []
      : [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]),
  ],
}

export default defineConfig(config)
