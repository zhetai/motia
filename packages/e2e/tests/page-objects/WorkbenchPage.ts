import { expect, type Locator, type Page } from '@playwright/test'
import { MotiaApplicationPage } from './MotiaApplicationPage'

export class WorkbenchPage extends MotiaApplicationPage {
  readonly sidebarContainer: Locator
  readonly logsLink: Locator
  readonly statesLink: Locator
  readonly endpointsLink: Locator
  readonly flowsLink: Locator
  readonly flowLinks: Locator
  readonly startFlowButton: Locator
  readonly flowContainer: Locator

  constructor(page: Page) {
    super(page)
    this.sidebarContainer = page.getByTestId('sidebar')
    this.logsLink = page.getByTestId('header-logs-link')
    this.statesLink = page.getByTestId('header-states-link')
    this.endpointsLink = page.getByTestId('header-endpoints-link')
    this.flowsLink = page.getByTestId('header-flows-link')
    this.flowLinks = page.getByTestId(/flow-.*-link/)
    this.startFlowButton = page.getByTestId('start-flow-button')
    this.flowContainer = page.getByTestId('flow-container')
  }

  async gotoWorkbench() {
    await this.goto('/flow/default')
  }

  async verifyWorkbenchInterface() {
    await expect(this.logoIcon).toBeVisible()
    await expect(this.logsLink).toBeVisible()
    await expect(this.statesLink).toBeVisible()
    await expect(this.endpointsLink).toBeVisible()
    await expect(this.flowsLink).toBeVisible()
  }

  async navigateToLogs() {
    await this.logsLink.click()
    await this.waitForApplication()
  }

  async navigateToStates() {
    await this.statesLink.click()
    await this.waitForApplication()
  }

  async navigateToEndpoints() {
    await this.endpointsLink.click()
    await this.waitForApplication()
  }

  async getFlowCount() {
    await this.flowsLink.click()
    return await this.flowLinks.count()
  }

  async navigateToFlow(flowName: string) {
    await this.flowsLink.hover()
    const flowLink = this.page.getByTestId(`flow-${flowName}-link`)
    await flowLink.click()
    await this.waitForApplication()
  }

  async navigateToFlowByIndex(index: number) {
    await this.flowsLink.hover()
    const flowLink = this.flowLinks.nth(index)
    await flowLink.click()
    await this.waitForApplication()
  }

  async startFlow() {
    await this.startFlowButton.click()
    await this.page.waitForTimeout(3000)
  }

  async executeFlowAndNavigateToLogs(flowName: string = 'default') {
    await this.navigateToFlow(flowName)
    await this.startFlow()
    await this.navigateToLogs()
  }

  async verifyStepsInWorkbench(stepNames: string[]) {
    for (const stepName of stepNames) {
      const stepElement = this.page.getByText(stepName).first()
      const isVisible = await stepElement.isVisible({ timeout: 5000 })
      if (isVisible) {
        await expect(stepElement).toBeVisible()
      }
    }
  }

  async hasWorkbenchFeatures() {
    const workbenchIndicators = [
      this.page.getByText(/workbench/i),
      this.page.getByText(/motia/i),
      this.navigation,
      this.mainContent,
    ]

    for (const indicator of workbenchIndicators) {
      const isVisible = await indicator.first().isVisible({ timeout: 3000 })
      if (isVisible) {
        return true
      }
    }
    return false
  }

  async verifyProjectInformation() {
    const projectIndicators = [this.logsLink, this.statesLink, this.endpointsLink]

    for (const indicator of projectIndicators) {
      const isVisible = await indicator.first().isVisible({ timeout: 5000 })
      if (isVisible) {
        return true
      }
    }
    return false
  }
}
