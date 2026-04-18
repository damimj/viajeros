import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

const TEST_TRIP_TITLE = '[TEST] Playwright Trip';

test.describe('Admin – Trips', () => {
  test('trip list page loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Trips' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New Trip' })).toBeVisible();
  });

  test('new trip form renders all fields', async ({ page }) => {
    await page.goto('/admin/trips/new');
    await expect(page.getByRole('heading', { name: 'New Trip' })).toBeVisible();
    await expect(page.locator('input[type="text"][required]')).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator('input[type="color"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('form prevents submit when title is empty (browser validation)', async ({ page }) => {
    await page.goto('/admin/trips/new');
    await expect(page.locator('input[type="text"][required]')).toBeVisible();
    // Title is empty by default; submit without filling it
    await page.getByRole('button', { name: 'Save' }).click();
    // Browser-native required validation should keep us on the same page
    await expect(page).toHaveURL('/admin/trips/new');
  });

  test('full CRUD: create, verify in list, delete', async ({ page }) => {
    // Clean up any leftover test trip first
    await page.goto('/admin');
    const existingTrip = page.getByText(TEST_TRIP_TITLE);
    if (await existingTrip.isVisible().catch(() => false)) {
      const row = page
        .locator('div.flex.items-center.justify-between', {
          has: page.getByText(TEST_TRIP_TITLE),
        })
        .first();
      await row.getByRole('link', { name: 'Edit' }).click();
      await page.waitForURL(/\/admin\/trips\/.+/);
      await page.getByRole('button', { name: 'Delete' }).click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await page.waitForURL('/admin/trips');
      await page.goto('/admin');
    }

    // Create
    await page.goto('/admin/trips/new');
    await expect(page.locator('input[type="text"][required]')).toBeVisible();
    await page.locator('input[type="text"][required]').fill(TEST_TRIP_TITLE);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForURL('/admin');

    // Verify in list
    await expect(page.getByText(TEST_TRIP_TITLE)).toBeVisible();

    // Navigate to edit
    const row = page
      .locator('div.flex.items-center.justify-between', {
        has: page.getByText(TEST_TRIP_TITLE),
      })
      .first();
    await row.getByRole('link', { name: 'Edit' }).click();
    await page.waitForURL(/\/admin\/trips\/.+/);
    await expect(page.getByRole('heading', { name: 'Edit Trip' })).toBeVisible();

    // Delete: first click shows confirmation
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Are you sure? This cannot be undone.')).toBeVisible();

    // Second click confirms deletion
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForURL('/admin/trips');
    await expect(page.getByText(TEST_TRIP_TITLE)).not.toBeVisible();
  });
});
