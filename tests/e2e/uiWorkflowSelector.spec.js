import { test, expect } from "@playwright/test";

// We'll define a helper array of workflows we want to test
// Each object has the workflow's "selectOption" value and a unique node label.
const WORKFLOWS = [
  {
    // This is the "name" from wistroServerExample/config.js
    // which your UI returns in /api/workflows
    workflowName: "wistroServerExample",
    uniqueNodeLabel: "ws-server-example.start", // e.g. the label from your node's UI
  },
  {
    // The "name" from hybridEndpointExample/config.js
    workflowName: "hybridEndpointExample",
    uniqueNodeLabel: "hybrid.validated", // or "Transform Data", etc.
  },
  {
    // The "name" from endpointServerHandshake/config.js
    workflowName: "endpointServerHandshake",
    uniqueNodeLabel: "handshake.",
  },
];

test.describe("Workflow Selector & Visual Tests", () => {
  test("the workflow selector is visible", async ({ page }) => {
    // Go to your Playground UI root (adjust if needed)
    await page.goto("http://localhost:5173/");
    const selectorHeading = page.locator("text=Select Workflow");
    await expect(selectorHeading).toBeVisible();
  });

  test("can switch among the three workflows", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Wait for the workflow selector to appear
    const workflowSelect = page.locator("select");
    await expect(workflowSelect).toBeVisible();

    // For each workflow definition, select it and check a unique node
    for (const wf of WORKFLOWS) {
      await workflowSelect.selectOption(wf.workflowName);
      // Wait for a UI element that's unique to that workflow
      await page.locator(`text=${wf.uniqueNodeLabel}`).first().waitFor();
    }
  });

  test("visual regression for the three workflows", async ({ page }) => {
    // 1) Navigate to the main Playground UI
    await page.goto("http://localhost:5173/");
    await page.locator("text=Select Workflow").waitFor();

    // 2) For each workflow, select it, wait for the node, then take a screenshot
    const workflowSelect = page.locator("select");
    for (const wf of WORKFLOWS) {
      // Switch workflow
      await workflowSelect.selectOption(wf.workflowName);
      // Wait for a known node label
      await page.locator(`text=${wf.uniqueNodeLabel}`).first().waitFor();

      // 3) Visual regression screenshot
      // This will create or compare against a baseline named <workflowName>.png
      await expect(page).toHaveScreenshot(`${wf.workflowName}.png`);
    }
  });
});
