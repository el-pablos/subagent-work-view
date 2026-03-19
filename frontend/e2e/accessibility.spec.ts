import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have semantic landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for presence of semantic HTML5 landmarks
    // At least one of these should exist in the app
    const main = page.locator('main');
    const nav = page.locator('nav');
    
    // Main content area should exist
    const mainCount = await main.count();
    const navCount = await nav.count();
    
    // At least main or nav should be present (structural requirement)
    expect(mainCount + navCount).toBeGreaterThan(0);
  });

  test('should not have images with empty alt attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find all img elements
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // Check each image - if alt attribute exists, it should not be empty
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // If image has alt attribute, it should not be empty string
      // (null is acceptable for decorative images handled by aria-hidden or role="presentation")
      if (alt !== null) {
        expect(alt.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
