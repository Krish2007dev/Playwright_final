import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const uiTestDir = defineBddConfig({
  features: 'tests/UI_Test/feature/***.feature',
  steps: [
    'tests/UI_Test/steps/***.steps.ts',
    'tests/UI_Test/fixture/fixtures.ts',
  ],
  outputDir: '.features-gen/ui',
});

export default defineConfig({
  testDir: uiTestDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  reporter: [
    ['html', { outputFolder: 'reports/ui/playwright' }],
    ['allure-playwright', { resultsDir: 'reports/ui/allure-results' }],
    ['list'],
    cucumberReporter('html', {
      outputFile: 'reports/ui/cucumber/index.html',
    }),
    cucumberReporter('json', {
      outputFile: 'reports/ui/cucumber/results.json',
    }),
  ],
  use: {
    baseURL: 'https://ecommerce-playground.lambdatest.io/',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    timezoneId: 'UTC',
  },
  projects: [
    {
      name: 'ui',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
