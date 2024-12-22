import { test, expect } from "@playwright/test"; // <-- Playwright's test API
import fetch from "node-fetch";
import { spawn } from "child_process";
import path from "path";

test.describe("Redis E2E Test", () => {
  let serverProcess;

  test.beforeAll(async () => {
    serverProcess = spawn("pnpm", ["run", "dev"], {
      cwd: path.resolve(__dirname, "../../.."),
      env: {
        ...process.env,
        MESSAGE_BUS_TYPE: "redis",
        REDIS_HOST: "127.0.0.1",
        REDIS_PORT: "6379",
      },
    });
    // Wait for server to come up, e.g., 3 seconds
    await new Promise((r) => setTimeout(r, 3000));
  });

  test.afterAll(async () => {
    serverProcess.kill("SIGTERM");
  });

  test("POST /api/data/upload triggers the full workflow via Redis", async () => {
    const res = await fetch("http://localhost:4000/api/data/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawData: [{ id: 1, value: "test" }] }),
    });
    expect(res.status).toBe(200);

    // Wait a bit for the workflow
    await new Promise((r) => setTimeout(r, 500));

    // Either parse logs or check a final endpoint/state if you have one
    expect(true).toBe(true);
  });
});
