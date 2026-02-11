import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for TelecomNexus E2E tests.
 * Requires the full stack to be running:
 *   npx turbo run dev
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  /* Start the dev server automatically if needed */
  // webServer: {
  //   command: 'npx turbo run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env['CI'],
  //   timeout: 120_000,
  // },
});
