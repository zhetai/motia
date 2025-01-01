import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 3000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5173", // Change if your Playground runs on a different port
    headless: true,
  },
  webServer: {
    command: "pnpm run dev", // Adjust if needed
    port: 5173, // Adjust to match your Playground's port
    reuseExistingServer: !process.env.CI,
  },
});
