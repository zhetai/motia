import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { WorkflowTestHelper } from "motia/testing";
import path from "path";

describe("data-processing workflow", () => {
  let helper;

  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../../../../..");
    helper = new WorkflowTestHelper(basePath);
    await helper.setup();
    await helper.startServer(3001);
  });

  afterEach(async () => {
    await helper?.cleanup();
  });

  test("processes data through HTTP endpoint", async () => {
    const testData = [
      { id: 1, value: "test1" },
      { id: 2, value: "test2" },
    ];

    // Use helper's built-in HTTP client instead of fetch
    const response = await helper.post("/api/data/upload", {
      rawData: testData,
    });

    expect(response.status).toBe(200);

    // Get events directly from in-memory bus
    const events = await helper.getEvents();

    expect(events).toContainEventType("processing.uploaded", {
      rawData: testData,
    });

    expect(events).toContainEventType("processing.saved", {
      count: 2,
      status: "success",
    });
  });
});
