import { defineConfig } from '@playwright/test';

const basePath = process.env.SAIL_TEST_BASE_PATH || '/';
if (!/^\/[\w/-]*$/.test(basePath)) throw new Error('Invalid browser test base path');
const baseURL = `http://127.0.0.1:5198${basePath}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  expect: { timeout: 15000 },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 30000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-webgl'] },
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port 5198 --strictPort --base ${basePath}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
