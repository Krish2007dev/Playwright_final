import { defineConfig } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const apiTestDir = defineBddConfig({
  features: 'tests/API_Test/feature/***.feature',
  steps: [
    'tests/API_Test/steps/***.steps.ts',
    'tests/API_Test/fixture/fixtures.ts',
  ],
  outputDir: '.features-gen/api',
});

export default defineConfig({
  testDir: apiTestDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  reporter: [
    ['html', { outputFolder: 'reports/api/playwright' }],
    ['allure-playwright', { resultsDir: 'reports/api/allure-results' }],
    ['list'],
    cucumberReporter('html', {
      outputFile: 'reports/api/cucumber/index.html',
    }),
    cucumberReporter('json', {
      outputFile: 'reports/api/cucumber/results.json',
    }),
  ],
  use: {
    baseURL: 'https://api.practicesoftwaretesting.com/',
    trace: 'retain-on-failure',
  },
});
