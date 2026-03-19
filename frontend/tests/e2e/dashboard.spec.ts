import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
  });

  test("should load dashboard successfully", async ({ page }) => {
    // Wait for the main app to load
    await page.waitForLoadState("networkidle");

    // Check that the main container is present
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display header with session info", async ({ page }) => {
    // Wait for header to load
    await page.waitForSelector("text=Session ID", { timeout: 5000 });

    // Check for session ID display
    await expect(page.locator("text=Session ID")).toBeVisible();

    // Check for connection status indicator
    const connectionStatus = page
      .locator('[data-testid="connection-status"]')
      .or(page.locator("text=/connected|disconnected|connecting/i"));
    await expect(connectionStatus.first()).toBeVisible();
  });

  test("should display Agent Topology panel", async ({ page }) => {
    // Wait for Agent Topology panel header
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Verify panel is visible
    await expect(page.locator("text=Agent Topology")).toBeVisible();

    // Check for agent count display
    const agentCount = page.locator("text=/\\d+ agents?/i");
    await expect(agentCount).toBeVisible();

    // Check for status legend
    await expect(page.locator("text=Idle")).toBeVisible();
    await expect(page.locator("text=Busy")).toBeVisible();
  });

  test("should display Active Tasks panel", async ({ page }) => {
    // Wait for Active Tasks panel
    await page.waitForSelector("text=/Active Tasks|Tasks/i", { timeout: 5000 });

    // Verify tasks panel is visible
    const tasksPanel = page.locator("text=/Active Tasks|Tasks/i").first();
    await expect(tasksPanel).toBeVisible();
  });

  test("should display Communication Log panel", async ({ page }) => {
    // Wait for Communication Log panel
    await page.waitForSelector("text=/Communication Log|Messages/i", {
      timeout: 5000,
    });

    // Verify communication panel is visible
    const commPanel = page
      .locator("text=/Communication Log|Messages/i")
      .first();
    await expect(commPanel).toBeVisible();
  });

  test("should display Task Timeline", async ({ page }) => {
    // Wait for Task Timeline
    await page.waitForSelector("text=Task Timeline", { timeout: 5000 });

    // Verify timeline is visible
    await expect(page.locator("text=Task Timeline")).toBeVisible();
  });

  test("should display Command Console", async ({ page }) => {
    // Wait for Command Console
    await page.waitForSelector("text=Command Console", { timeout: 5000 });

    // Verify console is visible
    await expect(page.locator("text=Command Console")).toBeVisible();

    // Check for command input
    const commandInput = page
      .locator('input[placeholder*="command"]')
      .or(page.locator('textarea[placeholder*="command"]'));
    await expect(commandInput.first()).toBeVisible();
  });

  test("should have responsive layout", async ({ page }) => {
    // Check that main grid layout exists
    const mainContent = page.locator(".grid").first();
    await expect(mainContent).toBeVisible();

    // Verify all major panels are in the DOM
    await expect(page.locator("text=Agent Topology")).toBeVisible();
    await expect(
      page.locator("text=/Active Tasks|Tasks/i").first(),
    ).toBeVisible();
    await expect(page.locator("text=Task Timeline")).toBeVisible();
    await expect(page.locator("text=Command Console")).toBeVisible();
  });

  test("should load with mock data", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check that agents are rendered (from mock data)
    const agentElements = page
      .locator('[data-testid="agent-node"]')
      .or(page.locator("text=/Team Lead|Frontend Dev|Backend Dev/i"));
    const count = await agentElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display stats in header", async ({ page }) => {
    // Wait for header to load
    await page.waitForLoadState("networkidle");

    // Check for active agent count
    const agentStat = page.locator("text=/\\d+.*agents?/i");
    await expect(agentStat.first()).toBeVisible();

    // Check for running task count
    const taskStat = page.locator("text=/\\d+.*tasks?/i");
    await expect(taskStat.first()).toBeVisible();
  });
});
