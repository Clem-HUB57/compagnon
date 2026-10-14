import { defineConfig, devices } from '@playwright/test';

// Tests de bout en bout : npm run build, puis npx playwright test
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: { command: 'npx vite preview --port 4173 --strictPort', port: 4173, reuseExistingServer: true },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} } },
    { name: 'ordinateur', use: { viewport: { width: 1280, height: 800 }, launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} } }
  ]
});
