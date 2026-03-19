import { test, expect } from '@playwright/test';
import { gotoHome } from './test-helpers.ts';

test('homepage loads with title and core layout visible', async ({ page }) => {
  await gotoHome(page, { width: 1280, height: 900 });
  await expect(page).toHaveTitle(/SubAgent Work View/i);
  await expect(page.locator('header[aria-label="Dashboard header"]')).toBeVisible();
  await expect(page.locator('main[aria-label="Dashboard content"]')).toBeVisible();
});
