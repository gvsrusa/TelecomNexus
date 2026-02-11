import { test, expect } from '@playwright/test';

/**
 * T-7.6: Visual Regression Tests
 * Screenshots at different viewports and themes.
 * These establish baselines for visual regression.
 */
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'dashboard', path: '/' },
  { name: 'account', path: '/customer/account' },
  { name: 'topology', path: '/noc/topology' },
  { name: 'invoices', path: '/billing/invoices' },
];

for (const viewport of VIEWPORTS) {
  for (const pageConfig of PAGES) {
    test(`visual: ${pageConfig.name} at ${viewport.name} (${viewport.width}px) - light`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // Take screenshot for baseline
      await expect(page).toHaveScreenshot(`${pageConfig.name}-${viewport.name}-light.png`, {
        maxDiffPixelRatio: 0.05,
        timeout: 15_000,
      });
    });
  }
}
