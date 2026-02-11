import { test, expect } from '@playwright/test';

/**
 * E2E Scenario 4: Accessibility & Navigation
 * Verify skip nav, ARIA landmarks, dark mode toggle
 */
test.describe('Accessibility', () => {
  test('has skip to main content link', async ({ page }) => {
    await page.goto('/');
    // The skip link is visually hidden but present in DOM
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('has main landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#main-content');
    await expect(main).toBeAttached();
  });

  test('has navigation landmark', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeAttached();
  });

  test('dark mode toggle changes theme', async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Find theme toggle button
    const themeButton = page
      .locator('button[aria-label*="mode"], button[aria-label*="theme"]')
      .first();
    if (await themeButton.isVisible()) {
      // Click to toggle dark mode
      await themeButton.click();
      await page.waitForTimeout(500);

      // Verify data-bs-theme attribute changed
      const theme = await page.locator('html').getAttribute('data-bs-theme');
      expect(theme).toBe('dark');

      // Toggle back
      await themeButton.click();
      await page.waitForTimeout(500);
      const lightTheme = await page.locator('html').getAttribute('data-bs-theme');
      expect(lightTheme).toBe('light');
    }
  });
});
