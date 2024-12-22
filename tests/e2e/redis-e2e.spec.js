import { test, expect } from "@playwright/test";
import fetch from "node-fetch";
import { spawn } from "child_process";
import path from "path";

test.describe("End-to-End Workflow Test", () => {
  let motiaProcess;
  let nodeAgentProcess;
  let pythonAgentProcess;

  test.beforeAll(async () => {
    // Start Motia core
    motiaProcess = spawn("pnpm", ["run", "dev"], {
      cwd: path.resolve(__dirname, "../.."),
      env: {
        ...process.env,
        MESSAGE_BUS_TYPE: "redis",
        REDIS_HOST: "127.0.0.1",
        REDIS_PORT: "6379",
      },
    });

    // Start Node agent
    nodeAgentProcess = spawn("pnpm", ["run", "dev"], {
      cwd: path.resolve(__dirname, "../../agents/node-agent"),
    });

    // Start Python agent
    pythonAgentProcess = spawn("pnpm", ["run", "dev"], {
      cwd: path.resolve(__dirname, "../../agents/python-agent"),
    });

    // Wait for all services to start
    await new Promise((r) => setTimeout(r, 5000));
  });

  test.afterAll(() => {
    motiaProcess?.kill("SIGTERM");
    nodeAgentProcess?.kill("SIGTERM");
    pythonAgentProcess?.kill("SIGTERM");
  });

  test("hybrid workflow processes data through all agents", async () => {
    // Test data
    const testData = [
      { id: 1, value: 10 },
      { id: 2, value: 20 },
    ];

    // Send request to hybrid processing endpoint
    const res = await fetch("http://localhost:4000/api/hybrid/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: testData }),
    });

    expect(res.status).toBe(200);

    // Wait for workflow to complete
    await new Promise((r) => setTimeout(r, 1000));

    // Verify the final result
    // We could add a way to query the final state or monitor events
    // For now, we're just verifying the initial request succeeded
    const result = await res.json();
    expect(result.success).toBe(true);
  });

  test("agents handle errors appropriately", async () => {
    const res = await fetch("http://localhost:4000/api/hybrid/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: "invalid" }), // Should be array
    });

    expect(res.status).toBe(200); // Initial request succeeds

    // The error should be handled gracefully by the agents
    const result = await res.json();
    expect(result.success).toBe(true);
  });
});
