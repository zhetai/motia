// tests/e2e/parallelMergeState-redis.spec.js
import { test, expect } from "@playwright/test";
import Redis from "ioredis";

test.describe("Parallel Merge State Workflow + Redis E2E", () => {
  let redisClient;
  let collectedEvents = [];

  test.beforeEach(async () => {
    // Reset collected events
    collectedEvents = [];

    // Create Redis client for state checks
    redisClient = new Redis({
      host: "127.0.0.1",
      port: 6379,
    });

    // Subscribe to Wistro events
    const redisSubscriber = new Redis({
      host: "127.0.0.1",
      port: 6379,
    });

    await redisSubscriber.psubscribe("wistro:events:*");

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
    // Clean up Redis connections
    await redisClient.quit();
  });

  test("verifies parallel merge workflow state & events", async ({ page }) => {
    // 1. Trigger the workflow
    const response = await fetch("http://localhost:4000/api/parallel-merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Start parallel merge test",
      }),
    });
    expect(response.status).toBe(200);

    // Wait for events to propagate
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Verify event sequence
    const eventTypes = collectedEvents.map((ev) => ev.eventType);

    // Expected event sequence
    expect(eventTypes).toEqual(
      expect.arrayContaining([
        "pms.initialize",
        "pms.start",
        "pms.stepA.done",
        "pms.stepB.done",
        "pms.stepC.done",
        "pms.join.complete",
      ])
    );

    // 3. Get the workflow trace ID
    const startEvent = collectedEvents.find(
      (ev) => ev.eventType === "pms.start"
    );
    const traceId = startEvent.metadata.workflowTraceId;
    expect(traceId).toBeDefined();

    // 4. Verify state in Redis at key points
    const verifyRedisState = async (step, shouldExist = true) => {
      const key = `wistro:state:${traceId}:${step}`;
      const value = await redisClient.get(key);

      if (shouldExist) {
        expect(value).not.toBeNull();
        const parsed = JSON.parse(value);
        expect(parsed).toBeDefined();
      } else {
        expect(value).toBeNull();
      }
    };

    // After workflow completion, check that state was cleaned up
    await verifyRedisState("stepA", false);
    await verifyRedisState("stepB", false);
    await verifyRedisState("stepC", false);
    await verifyRedisState("mergedResult", false);

    // 5. Verify final completion event data
    const completionEvent = collectedEvents.find(
      (ev) => ev.eventType === "pms.join.complete"
    );
    expect(completionEvent).toBeDefined();
    expect(completionEvent.data).toMatchObject({
      stepA: expect.any(Object),
      stepB: expect.any(Object),
      stepC: expect.any(Object),
      mergedAt: expect.any(String),
    });
  });
});
