import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  // Explicitly target only the E2E folder
  testDir: path.join(__dirname, 'tests/e2e'),

  // Ensure Jest unit tests are ignored
  testIgnore: [
    path.join(__dirname, 'tests/unit/**'),
    '**/__tests__/**',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],

  timeout: 60 * 1000,
  retries: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:8081',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
