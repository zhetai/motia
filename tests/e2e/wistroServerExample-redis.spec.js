import { test, expect } from '@playwright/test'
import Redis from 'ioredis'

test.describe('WistroServerExample + Redis E2E', () => {
  let redisSubscriber
  let collectedEvents = []

  test.beforeEach(async () => {
    collectedEvents = []

    // 1) Connect a Redis subscriber to capture Wistro events
    redisSubscriber = new Redis({
      host: '127.0.0.1',
      port: 6379,
    })

    // Listen for all event channels that Wistro publishes, e.g. wistro:events:*
    await redisSubscriber.psubscribe('wistro:events:*')

    redisSubscriber.on('pmessage', (_pattern, channel, message) => {
      const eventType = channel.replace('wistro:events:', '')
      let parsed
      try {
        parsed = JSON.parse(message)
      } catch (err) {
        // In case message isn’t valid JSON
        parsed = { error: 'Invalid JSON', message }
      }
      // Store the event in an array for later assertions
      collectedEvents.push({ eventType, ...parsed })
    })
  })

  test.afterEach(async () => {
    await redisSubscriber?.quit()
  })

  test('verifies wistroServerExample flow & Redis events', async ({ page }) => {
    // 2) Navigate to Playground UI
    await page.goto('http://localhost:5173')
    await expect(page.locator('text=Select Flow')).toBeVisible()

    // 3) Select the "wistroServerExample" flow
    const flowSelect = page.locator('select')
    await flowSelect.selectOption('wistroServerExample')

    // For example, wait for a node named "Start Event"
    await expect(page.locator('text=.start').first()).toBeVisible()

    // 4) Trigger the flow by POSTing to the Wistro server
    const response = await fetch('http://localhost:4000/api/wistro-server-example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ greeting: 'Hello from Redis E2E test' }),
    })
    expect(response.status).toBe(200)

    // Give time for the flow to run and events to publish
    await page.waitForTimeout(1000)

    // 5) Assert we saw expected Redis events
    // For example, if your flow emits “wistroServerExample.started”, “wistroServerExample.processed”, etc.
    const eventTypes = collectedEvents.map((ev) => ev.eventType)

    // Check that we have at least one or more relevant event types
    // Adjust these to match your actual event names:
    expect(eventTypes).toEqual(
      expect.arrayContaining(['ws-server-example.trigger', 'ws-server-example.start', 'ws-server-example.processed']),
    )

    // Optional: Inspect the data of a particular event
    const doneEvent = collectedEvents.find((ev) => ev.eventType === 'ws-server-example.processed')
    expect(doneEvent).toBeDefined()
    // If there's some known shape of doneEvent.data, e.g. { result: ... }
    // expect(doneEvent.data.result).toBe("SomeValue");

    // 6) Optionally confirm the final UI state
    // e.g., a "Finalizer" node or some text indicating completion
    await expect(page.locator('text=Subscribes: ws-server-example.processed')).toBeVisible()
  })
})
