import { defineConfig, devices } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const accessibilityTestDir = defineBddConfig({
  features: 'tests/Accessibility_Test/feature/***.feature',
  steps: ['tests/Accessibility_Test/steps/***.steps.ts'],
  outputDir: '.features-gen/accessibility',
});

export default defineConfig({
  testDir: accessibilityTestDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60 * 1000,
  expect: {
    timeout: 60 * 1000,
  },
  reporter: [
    ['html', { outputFolder: 'reports/accessibility/playwright' }],
    [
      'allure-playwright',
      { resultsDir: 'reports/accessibility/allure-results' },
    ],
    ['list'],
    cucumberReporter('html', {
      outputFile: 'reports/accessibility/cucumber/index.html',
    }),
    cucumberReporter('json', {
      outputFile: 'reports/accessibility/cucumber/results.json',
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
      name: 'accessibility',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
