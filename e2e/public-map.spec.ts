import { test, expect } from '@playwright/test';

test.describe('Public map', () => {
  test('loads and shows the map canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
  });

  test('shows the trip sidebar with Trips heading', async ({ page }) => {
    await page.goto('/');
    // Sidebar renders as soon as loading completes (same render as canvas)
    await expect(page.locator('aside h2')).toBeVisible({ timeout: 30_000 });
  });

  test('shows the locale switcher (EN / ES)', async ({ page }) => {
    await page.goto('/');
    // Wait until the sidebar is rendered (confirms MapView loading = false)
    await expect(page.locator('aside h2')).toBeVisible({ timeout: 30_000 });
    // Locale switcher container has backdrop-blur-sm; locate by text content
    await expect(page.locator('button:text-is("EN")')).toBeVisible();
    await expect(page.locator('button:text-is("ES")')).toBeVisible();
  });
});
