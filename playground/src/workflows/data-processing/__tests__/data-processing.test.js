import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { WorkflowTestHelper } from "motia/testing";
import path from "path";
import fetch from "node-fetch";

describe("data-processing workflow", () => {
  let helper;

  beforeEach(async () => {
    // TODO Fix this so it isn't hardcoded
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

    // Allow events to propagate
    await new Promise((resolve) => setTimeout(resolve, 100));

    const events = helper.receivedEvents;
    expect(events).toBeDefined();

    const uploadedEvent = events.find((e) => e.type === "data.uploaded");
    expect(uploadedEvent.data.rawData).toEqual(testData);

    const validatedEvent = events.find((e) => e.type === "data.validated");
    expect(validatedEvent.data.rawData).toEqual(testData);

    const savedEvent = events.find((e) => e.type === "data.saved");
    expect(savedEvent.data.count).toBe(2);
    expect(savedEvent.data.status).toBe("success");
  });

  test("handles empty data appropriately", async () => {
    await helper.startServer(3002);

    const response = await fetch("http://localhost:3002/api/data/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawData: [] }),
    });

    expect(response.status).toBe(200);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const events = helper.receivedEvents;
    expect(events.some((e) => e.type === "data.uploaded")).toBe(true);
    expect(events.some((e) => e.type === "data.validated")).toBe(false);
  });
});
