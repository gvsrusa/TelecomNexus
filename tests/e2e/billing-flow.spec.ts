import { test, expect } from '@playwright/test';

/**
 * E2E Scenario 3: Billing Console Flow
 * View invoices → Check usage → View payments
 */
test.describe('Billing Console', () => {
  test('navigates to invoices page', async ({ page }) => {
    await page.goto('/billing/invoices');

    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /invoice/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to usage analytics page', async ({ page }) => {
    await page.goto('/billing/usage');

    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /usage/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to payments page', async ({ page }) => {
    await page.goto('/billing/payments');

    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /payment/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
