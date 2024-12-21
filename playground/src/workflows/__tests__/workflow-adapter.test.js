// tests/unit/workflow-adapter.test.js
import { describe, test, beforeAll, afterAll, expect } from "vitest";
import { WorkflowTestHelper } from "motia/testing";
import { InMemoryMessageBus } from "motia";
import { RedisMessageBusAdapter } from "motia/core/adapters";
import path from "path";

describe("Workflow Testing with different Adapters", () => {
  let basePath;

  beforeAll(() => {
    // Path to your monorepo root or wherever the Playground is
    basePath = path.resolve(__dirname, "../../../..");
  });

  test("InMemoryMessageBus processes data end to end", async () => {
    const helper = new WorkflowTestHelper(basePath, new InMemoryMessageBus());
    await helper.setup();

    // Trigger a fake event in code (if you want to do direct testing)
    await helper.core.emit({ type: "data.uploaded", data: { rawData: [] } });

    // Or spin up the server if you want HTTP-based tests:
    // await helper.startServer(3001);
    // Make HTTP request to /api/data/upload, etc.

    // Wait for events to propagate
    await new Promise((resolve) => setTimeout(resolve, 100));

    const events = helper.receivedEvents;
    // Now ensure workflow logic took place
    expect(events.some((e) => e.type === "data.uploaded")).toBe(true);

    await helper.cleanup();
  });

  test("RedisMessageBusAdapter processes data end to end", async () => {
    // This assumes a local or container-based Redis is running on default port
    const redisAdapter = new RedisMessageBusAdapter({
      host: "127.0.0.1",
      port: 6379,
      channelPrefix: "test:motia:events:",
    });
    const helper = new WorkflowTestHelper(basePath, redisAdapter);

    await helper.setup();

    // E.g., direct event approach:
    await helper.core.emit({ type: "data.uploaded", data: { rawData: [] } });

    // Wait for events
    await new Promise((resolve) => setTimeout(resolve, 100));

    // For Redis-based tests, your “receivedEvents” might not reflect
    // every message, unless your bus is also storing them in memory.
    // Typically, you'd confirm the final expected state in your workflow.
    // If you use a specialized test bus that extends RedisMessageBusAdapter,
    // you could add a "getEvents()" method that tracks published events.

    await helper.cleanup();
  });
});
