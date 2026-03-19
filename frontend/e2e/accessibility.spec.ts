import { test, expect } from '@playwright/test';
import { gotoHome } from './test-helpers.ts';

test.describe('basic accessibility checks', () => {
  test('semantic landmarks exist', async ({ page }) => {
    await gotoHome(page, { width: 1280, height: 900 });
    await expect(page.locator('header[aria-label="Dashboard header"]')).toBeVisible();
    await expect(page.locator('main[aria-label="Dashboard content"]')).toBeVisible();
  });

  test('no rendered images have empty alt text', async ({ page }) => {
    await gotoHome(page, { width: 1280, height: 900 });
    const images = page.locator('img:not([role="presentation"])');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });
});
