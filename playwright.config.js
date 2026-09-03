import { defineConfig, devices } from '@playwright/test';

/*
 * Smoke coverage, not exhaustive UI testing: every route loads without
 * throwing, plus the handful of interactions (keyboard drag physics, deep
 * links, offline fallbacks) that are easy to silently break with an
 * unrelated change and tedious to re-verify by hand every time.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    // CI images and this environment ship the full chromium binary, not the
    // separate chrome-headless-shell Playwright's default project looks
    // for headless — point at whichever is actually on disk instead.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
