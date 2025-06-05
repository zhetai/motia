import { test, expect } from '@playwright/test'
import { WorkbenchPage, EndpointPage } from '../page-objects' // Assuming WorkbenchPage is in this location

test.describe('Workbench - Endpoint Call JSON Validation', () => {
  let workbench: WorkbenchPage
  let endpoint: EndpointPage

  test.beforeEach(async ({ page }) => {
    workbench = new WorkbenchPage(page)
    endpoint = new EndpointPage(page)
    await workbench.gotoWorkbench()
    await workbench.navigateToEndpoints()
    await endpoint.firstEndpointItem.click()
  })

  test('should validate JSON body input', async () => {
    const { invalidJsonMessage, playButton, bodyTextarea, responseContainer } = endpoint

    await test.step('Initial state: Play button should be enabled with default/valid JSON', async () => {
      await expect(playButton).toBeEnabled()
      await expect(invalidJsonMessage).not.toBeVisible()
      await expect(bodyTextarea).not.toHaveClass(/border-red-500/)
    })

    await test.step('Enter invalid JSON', async () => {
      await bodyTextarea.fill('{\"invalid_json\": "test",')
      await expect(invalidJsonMessage).toBeVisible()
      await expect(bodyTextarea).toHaveClass(/border-red-500/)
      await expect(playButton).toBeDisabled()
    })

    await test.step('Enter valid JSON after invalid', async () => {
      await bodyTextarea.fill('{\"valid_json\": "test"}')
      await expect(invalidJsonMessage).not.toBeVisible()
      await expect(bodyTextarea).not.toHaveClass(/border-red-500/)
      await expect(playButton).toBeEnabled()
    })

    await test.step('Enter invalid JSON again to ensure re-validation', async () => {
      await bodyTextarea.fill('{\"another_invalid\":')
      await expect(invalidJsonMessage).toBeVisible()
      await expect(bodyTextarea).toHaveClass(/border-red-500/)
      await expect(playButton).toBeDisabled()
    })

    await test.step('Clear input with valid JSON', async () => {
      await bodyTextarea.fill('{}')
      await expect(invalidJsonMessage).not.toBeVisible()
      await expect(bodyTextarea).not.toHaveClass(/border-red-500/)
      await expect(playButton).toBeEnabled()
    })

    await test.step('Clear input with empty string', async () => {
      await bodyTextarea.fill('')
      await expect(invalidJsonMessage).toBeVisible()
      await expect(bodyTextarea).toHaveClass(/border-red-500/)
      await expect(playButton).toBeDisabled()
    })

    await test.step('Play button should be disabled when invalid JSON is present', async () => {
      await bodyTextarea.fill('{\"invalid_json\": "test",')
      await expect(playButton).toBeDisabled()
    })

    await test.step('Play button should be enabled when valid JSON is present', async () => {
      await bodyTextarea.fill('{\"valid_json\": "test"}')
      await expect(playButton).toBeEnabled()
    })

    await test.step('Play button should play the request', async () => {
      await bodyTextarea.fill('{\"valid_json\": "test"}')
      await expect(playButton).toBeEnabled()
      await playButton.click()
      await expect(responseContainer).toBeVisible()
    })
  })
})
