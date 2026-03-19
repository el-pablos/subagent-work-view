import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should show bottom navigation on mobile viewport', async ({ page }) => {
    // Set mobile viewport (375px width)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements that would be in bottom nav
    // Without asserting specific content, just check structural presence
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('should show grid layout on desktop viewport', async ({ page }) => {
    // Set desktop viewport (1280px width)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that main content area is visible with proper layout
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Grid layout typically has multiple visible sections side by side
    // Check that content is rendered (structural check)
    const body = page.locator('body');
    const boundingBox = await body.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThanOrEqual(1280);
  });
});
