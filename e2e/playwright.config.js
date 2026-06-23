const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const SERVER_DIR = path.join(__dirname, '..', 'server');
const CLIENT_DIR = path.join(__dirname, '..', 'client');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  // Retries absorb transient dev-server slowdowns during the long serial run
  // (the heavier pages can exceed the assertion timeout when the Vite dev
  // server is under sustained load). A real failure still fails on every retry.
  retries: 2,
  timeout: 45000,
  expect: { timeout: 15000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run start',
      cwd: SERVER_DIR,
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'npm run dev',
      cwd: CLIENT_DIR,
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
