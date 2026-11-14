import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e-output/results',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:4173', ...devices['Pixel 7'] },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
