import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Subagent Work View/i);
  });

  test('should display main layout structure', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to render
    await page.waitForLoadState('networkidle');
    
    // Check for main structural elements without asserting specific content
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Layout should have visible content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
