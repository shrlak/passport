import { defineConfig } from '@playwright/test';

// Runs against a production build: the Express server serves client/dist on
// :4173 with a fresh SQLite DB per run (see the e2e:server root script).
// localhost is a secure context, so geolocation works without HTTPS.
export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    permissions: ['geolocation'],
    // default test position: Eiffel Tower
    geolocation: { latitude: 48.8584, longitude: 2.2945 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run e2e:server',
    cwd: '..',
    port: 4173,
    timeout: 240_000,
    reuseExistingServer: false,
  },
});
