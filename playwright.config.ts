import { defineConfig, devices } from '@playwright/test';
import process from 'process';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Set global test timeout to 30 seconds by default */
  timeout: 30_000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers with different timeouts */
  projects: [
    {
      name: 'chromium-regular',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*game-automated\.spec\.ts/,
      timeout: 30_000, // 30 seconds for regular tests
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-regular',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*game-automated\.spec\.ts/,
      timeout: 30_000, // 30 seconds for regular tests
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-regular',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*game-automated\.spec\.ts/,
      timeout: 30_000, // 30 seconds for regular tests
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'chromium-automated',
      testMatch: /.*game-automated\.spec\.ts/,
      timeout: 300_000, // 5 minutes for automated tests
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-automated',
      testMatch: /.*game-automated\.spec\.ts/,
      timeout: 300_000, // 5 minutes for automated tests
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-automated',
      testMatch: /.*game-automated\.spec\.ts/,
      timeout: 300_000, // 5 minutes for automated tests
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
