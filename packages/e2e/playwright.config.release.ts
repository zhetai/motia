import { defineConfig, devices } from '@playwright/test'
import { config } from './playwright.config'

export default defineConfig({
  ...config,
  globalSetup: './scripts/global-setup.ts',
  globalTeardown: './scripts/global-teardown.ts',
}) 