import { test, expect } from '@playwright/test';
import { gotoHome } from './test-helpers.ts';

test.describe('responsive layout', () => {
  test('mobile viewport 375px shows bottom navigation', async ({ page }) => {
    await gotoHome(page, { width: 375, height: 812 });

    await expect(page.getByRole('navigation', { name: 'Mobile panel navigation' })).toBeVisible();
    await expect(page.getByRole('button', { name: /show .* panel/i })).toHaveCount(3);
    await expect(page.locator('footer[aria-label="Task history and console"]')).toBeHidden();
  });

  test('desktop viewport 1280px shows grid layout', async ({ page }) => {
    await gotoHome(page, { width: 1280, height: 900 });

    const mainLayout = page.locator('main[aria-label="Dashboard content"] > div').first();
    await expect(page.getByRole('navigation', { name: 'Mobile panel navigation' })).toBeHidden();
    await expect(page.locator('footer[aria-label="Task history and console"]')).toBeVisible();
    await expect.poll(async () => mainLayout.evaluate((element) => window.getComputedStyle(element).display)).toBe('grid');
  });
});
