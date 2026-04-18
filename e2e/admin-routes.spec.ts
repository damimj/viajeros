import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe('Admin – Routes', () => {
  test('routes list page loads', async ({ page }) => {
    await page.goto('/admin/routes');
    await expect(page.getByRole('link', { name: 'New Route' })).toBeVisible();
  });

  test('new route form renders required fields', async ({ page }) => {
    await page.goto('/admin/routes/new');
    await expect(page.getByRole('heading', { name: 'New Route' })).toBeVisible();
    // Trip selector (first select)
    await expect(page.locator('select').first()).toBeVisible();
    // Transport type selector (second select)
    await expect(page.locator('select[value], select').nth(1)).toBeVisible();
    // GeoJSON textarea has rows=8 and required
    await expect(page.locator('textarea[required]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });
});
