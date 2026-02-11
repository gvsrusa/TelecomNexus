import { test, expect } from '@playwright/test';

/**
 * E2E Scenario 1: Customer Portal Flow
 * View account → Browse plans → Change plan
 */
test.describe('Customer Portal', () => {
  test('displays the dashboard with customer summary', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TelecomNexus/i);

    // Dashboard should load with key sections
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10_000 });
  });

  test('navigates to account page and shows customer info', async ({ page }) => {
    await page.goto('/customer/account');

    // Should display customer account information
    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /account/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to plans page and lists available plans', async ({ page }) => {
    await page.goto('/customer/plans');

    // Should display plans heading
    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /plan/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to tickets page', async ({ page }) => {
    await page.goto('/customer/tickets');

    // Should display tickets section
    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /ticket/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
