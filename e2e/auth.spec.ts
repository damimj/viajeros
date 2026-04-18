import { test, expect } from '@playwright/test';

// All tests in this file use an empty browser context (no saved auth state).
// Each test manages its own auth lifecycle so the shared storageState is never affected.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test('shows error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Invalid email or password.')).toBeVisible({ timeout: 10_000 });
  });

  test('redirects /admin to /login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('valid login redirects to /admin', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? '';

    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin', { timeout: 15_000 });
  });

  test('authenticated user visiting /login is redirected to /admin', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? '';

    // Log in
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin', { timeout: 15_000 });

    // Visiting /login again while authenticated should redirect back to /admin
    await page.goto('/login');
    await expect(page).toHaveURL('/admin', { timeout: 10_000 });
  });

  // Logout is tested here with its own login so the shared storageState is not invalidated.
  test('logout redirects to /login', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? '';

    // Log in fresh
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin', { timeout: 15_000 });

    // Click logout in the desktop sidebar
    await page.locator('aside:not(.lg\\:hidden)').getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/login', { timeout: 10_000 });
  });
});
