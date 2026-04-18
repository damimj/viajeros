import { test, expect } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

// Desktop sidebar is the <aside> without the lg:hidden class
// (mobile sidebar carries `lg:hidden`; desktop sidebar does not)
const desktopSidebar = (page: import('@playwright/test').Page) =>
  page.locator('aside:not(.lg\\:hidden)');

test.describe('Admin navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Trips' })).toBeVisible();
  });

  test('dashboard loads with trips heading and new trip button', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'New Trip' })).toBeVisible();
  });

  test('sidebar shows all main nav links', async ({ page }) => {
    const nav = desktopSidebar(page);
    await expect(nav.locator('a[href="/admin/trips"]')).toBeVisible();
    await expect(nav.locator('a[href="/admin/points"]')).toBeVisible();
    await expect(nav.locator('a[href="/admin/routes"]')).toBeVisible();
    await expect(nav.locator('a[href="/admin/tags"]')).toBeVisible();
    await expect(nav.locator('a[href="/admin/settings"]')).toBeVisible();
  });

  test('navigates to Trips page via sidebar', async ({ page }) => {
    await desktopSidebar(page).locator('a[href="/admin/trips"]').click();
    await expect(page).toHaveURL('/admin/trips');
    await expect(page.getByRole('heading', { name: 'Trips' })).toBeVisible();
  });

  test('navigates to Points of Interest page via sidebar', async ({ page }) => {
    await desktopSidebar(page).locator('a[href="/admin/points"]').click();
    await expect(page).toHaveURL('/admin/points');
  });

  test('navigates to Routes page via sidebar', async ({ page }) => {
    await desktopSidebar(page).locator('a[href="/admin/routes"]').click();
    await expect(page).toHaveURL('/admin/routes');
  });

  test('navigates to Settings page via sidebar', async ({ page }) => {
    await desktopSidebar(page).locator('a[href="/admin/settings"]').click();
    await expect(page).toHaveURL('/admin/settings');
  });
});
