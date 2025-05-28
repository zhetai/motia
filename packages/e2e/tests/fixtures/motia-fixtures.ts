import { test as base } from '@playwright/test'
import { MotiaApplicationPage, WorkbenchPage, LogsPage, ApiHelpers } from '../page-objects'

type MotiaFixtures = {
  motiaApp: MotiaApplicationPage
  workbench: WorkbenchPage
  logsPage: LogsPage
  api: ApiHelpers
}

export const test = base.extend<MotiaFixtures>({
  motiaApp: async ({ page }, use) => {
    const motiaApp = new MotiaApplicationPage(page)
    await use(motiaApp)
  },

  workbench: async ({ page }, use) => {
    const workbench = new WorkbenchPage(page)
    await use(workbench)
  },

  logsPage: async ({ page }, use) => {
    const logsPage = new LogsPage(page)
    await use(logsPage)
  },

  api: async ({ page }, use) => {
    const api = new ApiHelpers(page)
    await use(api)
  },
})

export { expect } from '@playwright/test' 