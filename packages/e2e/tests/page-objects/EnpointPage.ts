import { type Locator, type Page } from '@playwright/test'
import { MotiaApplicationPage } from './MotiaApplicationPage'

export class EndpointPage extends MotiaApplicationPage {
  readonly firstEndpointItem: Locator
  readonly bodyTextarea: Locator
  readonly playButton: Locator
  readonly invalidJsonMessage: Locator
  readonly responseContainer: Locator

  constructor(page: Page) {
    super(page)
    this.firstEndpointItem = page.getByTestId('endpoint-POST-/default')
    this.bodyTextarea = page.getByTestId('endpoint-body-textarea')
    this.playButton = page.getByTestId('endpoint-play-button')
    this.invalidJsonMessage = page.getByTestId('endpoint-invalid-json-message')
    this.responseContainer = page.getByTestId('endpoint-response-container')
  }
}
