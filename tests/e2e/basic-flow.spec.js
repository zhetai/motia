import { test, expect } from "@playwright/test";

test("the workflow selector is visible", async ({ page }) => {
  await page.goto("/");
  const selectorHeading = page.locator("text=Select Workflow");
  await expect(selectorHeading).toBeVisible();
});

test("can switch workflows", async ({ page }) => {
  await page.goto("/");
  const workflowSelect = page.locator("select");
  await workflowSelect.selectOption("data-processing");
  const node = page.locator("text=Split Data");
  await expect(node).toBeVisible();
});

test("visual regression of main and data-processing workflows", async ({
  page,
}) => {
  // Navigate to the main page (Playground URL)
  await page.goto("/");
  // Wait for the main workflow selector to appear
  await page.locator("text=Select Workflow").waitFor();
  // Take a screenshot of the default page/workflow
  // This will create or compare against a baseline named main-default-workflow.png
  await expect(page).toHaveScreenshot("main-default-workflow.png");
  // Change the workflow in the selector (adjust workflow name as needed)
  const workflowSelect = page.locator("select");
  await workflowSelect.selectOption("data-processing");
  // Wait for an element unique to the data-processing workflow UI to appear
  await page.locator("text=Split Data").waitFor();
  // Take a screenshot of the UI after switching workflows
  // This will create or compare against a baseline named data-processing-workflow.png
  await expect(page).toHaveScreenshot("data-processing-workflow.png");
});
