import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

// Settings page uses <Section> components with <h2> headings, NOT tabs.
// Sections: Map, Images, Site

test.describe('Admin – Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
  });

  test('shows all section headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Map', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Images', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Site', level: 2 })).toBeVisible();
  });

  test('has save settings button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save settings' })).toBeVisible();
  });

  test('map section has map style selector', async ({ page }) => {
    // The map section has a select for map_style
    await expect(page.locator('select[name="map_style"]')).toBeVisible();
  });

  test('site section has site title input', async ({ page }) => {
    await expect(page.locator('input[name="site_title"]')).toBeVisible();
  });
});
