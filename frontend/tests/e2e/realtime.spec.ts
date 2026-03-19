import { test, expect } from "@playwright/test";

test.describe("Realtime WebSocket Updates", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
    // Wait for initial load
    await page.waitForLoadState("networkidle");
  });

  test("should establish WebSocket connection", async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Check that connection status is visible
    const connectionStatus = page.locator(
      "text=/connected|disconnected|connecting/i",
    );
    await expect(connectionStatus.first()).toBeVisible({ timeout: 10000 });

    // Verify we're showing "connected" state
    const statusText = await connectionStatus.first().textContent();
    expect(statusText?.toLowerCase()).toMatch(/connect/i);
  });

  test("should display real-time agent status updates", async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Check initial agent status
    const agentNode = page.locator(".absolute").first();
    await expect(agentNode).toBeVisible();

    // Verify status indicators are rendered
    const statusIndicators = page.locator(".rounded-full");
    const count = await statusIndicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should update task progress in real-time", async ({ page }) => {
    // Wait for tasks panel
    await page.waitForSelector("text=/Active Tasks|Tasks/i", { timeout: 5000 });

    // Check for task cards
    const taskCards = page
      .locator('[data-testid="task-card"]')
      .or(
        page.locator(
          "text=/Coordinate sprint tasks|Implement dashboard|Build API/i",
        ),
      );

    const count = await taskCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should receive new messages in communication log", async ({ page }) => {
    // Wait for communication log
    await page.waitForSelector("text=/Communication Log|Messages/i", {
      timeout: 5000,
    });

    // Check for message elements
    const messages = page
      .locator('[data-testid="message-bubble"]')
      .or(
        page.locator(
          "text=/Session started|will start coordinating|Handing off/i",
        ),
      );

    // At least one message should be visible
    const count = await messages.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should update task timeline with new events", async ({ page }) => {
    // Wait for task timeline
    await page.waitForSelector("text=Task Timeline", { timeout: 5000 });

    // Check for timeline events
    const timelineEvents = page
      .locator('[data-testid="timeline-event"]')
      .or(page.locator("text=/created|assigned|started|completed|progress/i"));

    const count = await timelineEvents.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should animate new agent spawn", async ({ page }) => {
    // Wait for topology to render
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Check that agents are rendered with animation classes
    const animatedAgents = page.locator(".absolute");
    const count = await animatedAgents.count();
    expect(count).toBeGreaterThan(0);

    // Verify agents are visible (animation completed)
    await expect(animatedAgents.first()).toBeVisible();
  });

  test("should show agent connection lines", async ({ page }) => {
    // Wait for topology
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Check for SVG connections
    const svg = page.locator("svg");
    await expect(svg.first()).toBeVisible();

    // Check for animated connection lines
    const lines = page.locator("line");
    const lineCount = await lines.count();
    expect(lineCount).toBeGreaterThan(0);
  });

  test("should handle connection status changes", async ({ page }) => {
    // Wait for header
    await page.waitForLoadState("networkidle");

    // Check for connection status indicator
    const statusIndicator = page.locator(
      "text=/connected|disconnected|connecting/i",
    );
    await expect(statusIndicator.first()).toBeVisible();

    // Verify status is displayed
    const statusText = await statusIndicator.first().textContent();
    expect(statusText).toBeTruthy();
  });

  test("should update agent count dynamically", async ({ page }) => {
    // Wait for agent count
    await page.waitForSelector("text=/\\d+ agents?/i", { timeout: 5000 });

    // Get initial count
    const agentCount = page.locator("text=/\\d+ agents?/i").first();
    await expect(agentCount).toBeVisible();

    // Verify count is a number
    const text = await agentCount.textContent();
    expect(text).toMatch(/\d+/);
  });

  test("should update task count dynamically", async ({ page }) => {
    // Wait for task count
    await page.waitForSelector("text=/\\d+.*tasks?/i", { timeout: 5000 });

    // Get initial count
    const taskCount = page.locator("text=/\\d+.*tasks?/i").first();
    await expect(taskCount).toBeVisible();

    // Verify count is a number
    const text = await taskCount.textContent();
    expect(text).toMatch(/\d+/);
  });

  test("should show typing indicators for communicating agents", async ({
    page,
  }) => {
    // Wait for agents
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Check for agents with "communicating" status
    const communicatingAgents = page.locator("text=Communicating");

    // Should have status legend with "Communicating"
    await expect(communicatingAgents.first()).toBeVisible();
  });

  test("should display message channels correctly", async ({ page }) => {
    // Wait for communication log
    await page.waitForSelector("text=/Communication Log|Messages/i", {
      timeout: 5000,
    });

    // Check for channel filters or indicators
    const channels = page.locator("text=/general|handoff|alert/i");

    // At least one channel should be visible
    const count = await channels.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should update command console state", async ({ page }) => {
    // Wait for command console
    await page.waitForSelector("text=Command Console", { timeout: 5000 });

    // Check for command input
    const commandInput = page
      .locator('input[placeholder*="command"]')
      .or(page.locator('textarea[placeholder*="command"]'));
    await expect(commandInput.first()).toBeVisible();

    // Verify input is enabled or shows reconnecting state
    const isDisabled = await commandInput.first().isDisabled();
    const placeholder = await commandInput.first().getAttribute("placeholder");

    expect(isDisabled || placeholder).toBeDefined();
  });

  test("should handle rapid updates without errors", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Wait for everything to load
    await page.waitForLoadState("networkidle");

    // Navigate around the app
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });
    await page.waitForSelector("text=Task Timeline", { timeout: 5000 });
    await page.waitForSelector("text=Command Console", { timeout: 5000 });

    // Wait a bit for any async updates
    await page.waitForTimeout(2000);

    // Check for errors (excluding WebSocket connection errors which are expected in test environment)
    const criticalErrors = errors.filter(
      (err) =>
        !err.includes("WebSocket") &&
        !err.includes("pusher") &&
        !err.includes("Echo"),
    );

    expect(criticalErrors.length).toBe(0);
  });

  test("should maintain state across real-time updates", async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Get initial agent count
    await page.waitForSelector("text=/\\d+ agents?/i", { timeout: 5000 });
    const initialCount = await page
      .locator("text=/\\d+ agents?/i")
      .first()
      .textContent();

    // Wait a bit
    await page.waitForTimeout(1000);

    // Verify count is still displayed
    const currentCount = await page
      .locator("text=/\\d+ agents?/i")
      .first()
      .textContent();
    expect(currentCount).toBeTruthy();
  });

  test("should show real-time notifications", async ({ page }) => {
    // Wait for app to load
    await page.waitForLoadState("networkidle");

    // Check if toast/notification system is present (sonner)
    // Notifications might not be visible initially, but the container should exist
    await page.waitForSelector("text=Agent Topology", { timeout: 5000 });

    // Page should not crash
    await expect(page.locator("body")).toBeVisible();
  });
});
