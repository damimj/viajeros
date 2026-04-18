import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Admin – Points of Interest', () => {
  test('points list page loads', async ({ page }) => {
    await page.goto('/admin/points');
    await expect(page.getByRole('link', { name: 'New Point' })).toBeVisible();
  });

  test('new point form renders required fields', async ({ page }) => {
    await page.goto('/admin/points/new');
    await expect(page.getByRole('heading', { name: 'New Point of Interest' })).toBeVisible();
    // Trip selector
    await expect(page.locator('select').first()).toBeVisible();
    // Title input
    await expect(page.locator('input[type="text"][required]')).toBeVisible();
    // Lat / Lng inputs
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
    await expect(page.locator('input[type="number"]').nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});
