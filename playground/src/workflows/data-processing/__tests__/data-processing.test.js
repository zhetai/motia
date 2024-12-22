import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { WorkflowTestHelper } from "motia/testing";
import path from "path";
import fetch from "node-fetch";

describe("data-processing workflow", () => {
  let helper;

  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../../../../..");
    helper = new WorkflowTestHelper(basePath);
    await helper.setup();
  });

  afterEach(async () => {
    await helper?.cleanup();
  });

  test("processes data through HTTP endpoint", async () => {
    await helper.startServer(3001);

    const testData = [
      { id: 1, value: "test1" },
      { id: 2, value: "test2" },
    ];

    const response = await fetch("http://localhost:3001/api/data/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawData: testData }),
    });

    expect(response.status).toBe(200);

    // Allow events to propagate through the system
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check events received by test message bus
    const events = helper.receivedEvents;
    expect(events).toBeDefined();

    // Verify upload event
    const uploadedEvent = events.find((e) => e.type === "processing.uploaded");
    expect(uploadedEvent.data.rawData).toEqual(testData);

    // No need to check for validated event as it's handled by the agent now
    // Instead, check the final result
    const savedEvent = events.find((e) => e.type === "processing.saved");
    expect(savedEvent.data.count).toBe(2);
    expect(savedEvent.data.status).toBe("success");
  });
});
