import { expect, type Page } from '@playwright/test';

export async function gotoHome(
  page: Page,
  viewport?: { width: number; height: number },
) {
  if (viewport) {
    await page.setViewportSize(viewport);
  }

  await page.route('**/api/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.goto('/');
  await expect(page.locator('header[aria-label="Dashboard header"]')).toBeVisible();
}
