import { test, expect } from "@playwright/test";
import Redis from "ioredis";

test.describe("endpointServerHandshake + Redis E2E", () => {
  let redisSubscriber;
  let collectedEvents = [];

  test.beforeEach(async () => {
    // Reset our array for each test
    collectedEvents = [];

    // Create a Redis client to subscribe to all Wistro events
    redisSubscriber = new Redis({
      host: "127.0.0.1",
      port: 6379,
    });

    // Subscribe to any channels that match "wistro:events:*"
    await redisSubscriber.psubscribe("wistro:events:*");

    // On receiving a published message, parse and store in `collectedEvents`
    redisSubscriber.on("pmessage", (_pattern, channel, message) => {
      const eventType = channel.replace("wistro:events:", "");
      let parsed;
      try {
        parsed = JSON.parse(message);
      } catch (error) {
        parsed = { error: "Invalid JSON", message };
      }
      collectedEvents.push({ eventType, ...parsed });
    });
  });

  test.afterEach(async () => {
    // Clean up Redis connection
    if (redisSubscriber) {
      await redisSubscriber.punsubscribe("wistro:events:*");
      await redisSubscriber.quit();
    }
  });

  test("Verifies handshake flow & Redis events are published", async ({
    page,
  }) => {

    // 1) Go to the Playground UI
    await page.goto("http://localhost:5173");
    // Wait for the workflow dropdown or a known element
    await expect(page.locator("text=Endpoint Server Handshake")).toBeVisible();

    // 2) Select 'endpointServerHandshake' in the dropdown (from config)
    const workflowSelect = page.getByTestId("handshake");
    await workflowSelect.click();

    // Wait for some node label to appear, e.g. "Node Starter"
    await expect(page.getByTestId("subscribes__handshake.initiate")).toBeVisible();

    // 3) Trigger the workflow by calling the inbound route
    const response = await fetch(
      "http://localhost:3000/api/endpoint-server-handshake",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Optionally pass some JSON data to your workflow
        body: JSON.stringify({
          message: "Hello from endpointServerHandshake test",
        }),
      }
    );

    expect(response.status).toBe(200);

    // Wait a bit for the events to propagate
    await page.waitForTimeout(1000);

    // 4) Check Redis events
    // Extract the eventType from each collected event
    const eventTypes = collectedEvents.map((ev) => ev.eventType);
    // We expect handshake.initiate => handshake.callApi => handshake.apiResponse
    // Possibly the flow might skip some if there's a direct route, adjust as needed
    // We'll just check that at least these show up somewhere.
    expect(eventTypes).toEqual(
      expect.arrayContaining([
        "handshake.initiate",
        "handshake.callApi",
        "handshake.apiResponse",
      ])
    );

    // (Optional) Check the final event's data
    const finalEvent = collectedEvents.find(
      (e) => e.eventType === "handshake.apiResponse"
    );
    expect(finalEvent).toBeDefined();
    // If you want to confirm shape:
    // expect(finalEvent.data).toHaveProperty("externalTodo");
    // expect(finalEvent.data).toHaveProperty("userMessage");

    // 5) (Optional) Confirm final node label or UI text
    await expect(
      page.getByTestId("subscribes__handshake.apiResponse").last()
    ).toBeVisible();
  });
});
