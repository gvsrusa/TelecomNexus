import { test, expect } from '@playwright/test';

/**
 * E2E Scenario 2: NOC Dashboard Flow
 * View topology → Check telemetry → Monitor alerts
 */
test.describe('NOC Dashboard', () => {
  test('navigates to network topology page', async ({ page }) => {
    await page.goto('/noc/topology');

    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /topology/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to telemetry page', async ({ page }) => {
    await page.goto('/noc/telemetry');

    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /telemetry/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('navigates to alerts page', async ({ page }) => {
    await page.goto('/noc/alerts');

    await expect(page.locator('h1, h2, h3, h4, h5').filter({ hasText: /alert/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
