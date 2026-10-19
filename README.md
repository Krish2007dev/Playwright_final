# Playwright BDD Test Automation Framework

This project is a TypeScript test automation framework built with:

- [Playwright](https://playwright.dev/) for browser automation and test execution
- [`playwright-bdd`](https://github.com/vitalets/playwright-bdd) for writing tests in Gherkin
- [Cucumber HTML reporting](https://github.com/wswebcreation/multiple-cucumber-html-reporter)
- [Allure Playwright](https://github.com/allure-framework/allure-js)
- [axe-core](https://github.com/dequelabs/axe-core) for accessibility testing
- ESLint, Prettier, and Gherkin linting for code quality

The current examples validate the LambdaTest e-commerce demo site, including login flows and accessibility checks.

Each test segment has its own report directory:

```text
reports/
├── ui/
├── accessibility/
├── api/
└── vscode/        # reports created from VS Code Test Explorer
```

## Prerequisites

Install the following before using the framework:

- Node.js LTS
- npm
- Java 8 or newer (required only for generating or opening Allure reports)

Check your versions:

```bash
node --version
npm --version
java --version
```

## Installation

Clone the project, move into its directory, and install the dependencies:

```bash
git clone <repository-url>
cd Playwright_Bdd-main
npm ci
npx playwright install chromium firefox
```

The main configuration uses Chromium for UI tests and Firefox for accessibility tests. Installing both browsers prevents errors such as `Executable doesn't exist`.

On Linux or in a Linux CI runner, install the operating-system browser dependencies as well:

```bash
npx playwright install --with-deps chromium firefox
```

If `npm ci` reports that a package is missing, do not install packages one by one. Remove the incomplete dependency folder and repeat the locked installation:

```bash
rm -rf node_modules
npm ci
```

On Windows PowerShell, use this equivalent cleanup command:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

## Run the tests

The main test command runs UI, accessibility, and API tests sequentially. Each segment writes reports to its own directory:

```bash
npm test
```

The default configuration in [`playwright.config.ts`](./playwright.config.ts) runs:

- UI BDD scenarios on Desktop Chrome
- Accessibility BDD scenarios on Desktop Firefox
- Tests against `https://ecommerce-playground.lambdatest.io/`

API tests are intentionally separate from the UI and accessibility configuration. Run them with:

```bash
npm run test:api
```

This uses [`playwrightapi.config.ts`](./playwrightapi.config.ts), reads feature files from `tests/API_Test/feature/`, and writes generated files to `api-results/`.

To run API tests manually:

```bash
npx bddgen --config playwrightapi.config.ts
npx playwright test --config=playwrightapi.config.ts
```

The UI and accessibility suites are not included when using the API configuration.

## JSON and CSV test data

The framework includes a dependency-free data reader in [`utils/test-data.ts`](./utils/test-data.ts). It supports typed JSON files and CSV files with quoted values, commas inside values, escaped quotes, and Windows line endings.

Keep reusable data files in `test-data/` and load them from the project root:

```ts
import { readCsv, readJson } from '../utils/test-data';

type User = {
  email: string;
  password: string;
};

const usersFromJson = readJson<User[]>('test-data/users.json');
const usersFromCsv = readCsv('test-data/users.csv');

console.log(usersFromJson[0].email);
console.log(usersFromCsv[0].password);
```

CSV values are returned as strings. Convert values explicitly when a test needs a number or boolean:

```ts
const products = readCsv('test-data/products.csv').map((row) => ({
  name: row.name,
  price: Number(row.price),
  available: row.available.toLowerCase() === 'true',
}));
```

The loader fails with a clear error when a file cannot be read, JSON is invalid, CSV headers are empty or duplicated, a quoted CSV value is not closed, or a row has the wrong number of columns. No existing UI, accessibility, or API test needs to change to use this support.

Run only a specific generated test or project:

```bash
npx bddgen
npx playwright test --project=login-test
npx playwright test --project=accessibility-test
```

Run a feature file or filter scenarios by title:

```bash
npx bddgen
npx playwright test tests/UI_Test/feature/login.feature.spec.js
npx playwright test --grep "valid credentials"
```

Run Playwright with its interactive UI mode:

```bash
npx bddgen
npx playwright test --ui
```

### Run using an alternate Playwright configuration

The repository also contains [`playwrightapi.config.ts`](./playwrightapi.config.ts), which is a standard Playwright configuration for tests under `tests/`. Use it explicitly when needed:

```bash
npx playwright test --config=playwrightapi.config.ts
```

## Project structure

```text
.
├── tests/
│   ├── UI_Test/
│   │   ├── feature/       # UI Gherkin feature files
│   │   ├── fixture/       # Playwright BDD fixtures
│   │   ├── page/          # Page Object Model classes
│   │   └── steps/         # Step definitions
│   └── Accessibility_Test/
│       ├── feature/       # Accessibility Gherkin feature files
│       └── steps/         # axe-core step definitions
├── playwright.config.ts   # Main BDD configuration and browser projects
├── playwrightapi.config.ts # Alternate standard Playwright configuration
├── playwright.acces.config.ts # Accessibility-oriented alternate configuration
├── generateReport.ts      # Cucumber HTML report generator
├── lint-features.js       # Gherkin lint runner
└── .github/workflows/
    └── playwright.yml     # Pull request CI workflow
```

Generated output directories include:

- `reports/ui/` - UI Playwright, Cucumber, and Allure output
- `reports/accessibility/` - accessibility Playwright, Cucumber, and Allure output
- `reports/api/` - API Playwright, Cucumber, and Allure output
- `reports/vscode/` - reports created when running projects directly from the VS Code Test Explorer
- `.features-gen/` - generated Playwright test files from Gherkin features; these are not reports
- `test-results/` - screenshots, videos, and traces for failed tests

## How to add a UI BDD test

### 1. Create a feature file

Add a `.feature` file under `tests/UI_Test/feature/`:

```gherkin
Feature: Product search

  Scenario: Search for a product
    Given I open the product site
    When I search for "phone"
    Then I should see matching products
```

Use `Scenario Outline` and an `Examples` table when the same behavior must be tested with multiple data sets.

### 2. Add or update a page object

Page objects belong under `tests/UI_Test/page/`. Extend [`BasePage.ts`](./tests/UI_Test/page/BasePage.ts) and keep locators and browser actions in the page class:

```ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByPlaceholder('Search');
  }

  async searchFor(product: string) {
    await this.searchBox.fill(product);
    await this.searchBox.press('Enter');
  }
}
```

Export new page objects from [`tests/UI_Test/page/index.ts`](./tests/UI_Test/page/index.ts), then add the page object to the fixture type and fixture definition in [`fixtures.ts`](./tests/UI_Test/fixture/fixtures.ts).

### 3. Add step definitions

Add matching step definitions under `tests/UI_Test/steps/`. Use `createBdd(test)` and the framework fixture so steps can call page-object methods:

```ts
import { createBdd } from 'playwright-bdd';
import { test } from '../fixture/fixtures';

const { Given, When, Then } = createBdd(test);

When('I search for {string}', async ({ searchPage }, product) => {
  await searchPage.searchFor(product);
});
```

The feature pattern and step pattern in [`playwright.config.ts`](./playwright.config.ts) automatically include matching files.

## Accessibility testing

Accessibility steps use `AxeBuilder` from `@axe-core/playwright`. The existing scenarios scan page regions such as:

- `#main-header`
- `#main-navigation`
- `.footer`
- `#common-home`

To add an accessibility scenario, create it under `tests/Accessibility_Test/feature/` and reuse or extend the step definitions in [`axe.steps.ts`](./tests/Accessibility_Test/steps/axe.steps.ts). Accessibility scans currently use the `wcag2a`, `wcag2aa`, and `best-practice` rule tags.

## Reports

### Run one segment with isolated reports

Run one segment independently, or run `npm test` to execute all three sequentially. Every segment writes to its own report directory:

```cmd
npm run test:ui
npm run test:accessibility
npm run test:api
```

Each command writes only to its own directory:

| Segment       | Playwright report                   | Cucumber report                   | Allure results                          |
| ------------- | ----------------------------------- | --------------------------------- | --------------------------------------- |
| UI            | `reports/ui/playwright/`            | `reports/ui/cucumber/`            | `reports/ui/allure-results/`            |
| Accessibility | `reports/accessibility/playwright/` | `reports/accessibility/cucumber/` | `reports/accessibility/allure-results/` |
| API           | `reports/api/playwright/`           | `reports/api/cucumber/`           | `reports/api/allure-results/`           |

Every test command cleans the previous `reports/` and `.features-gen/` folders before execution, so each run starts with fresh reports. To clean them manually:

```cmd
npm run clean:reports
```

This command removes only generated report and BDD output. It does not remove feature files, test data, credentials, or source code.

Open a Cucumber report from Command Prompt:

```cmd
start "" "reports\ui\cucumber\index.html"
start "" "reports\accessibility\cucumber\index.html"
start "" "reports\api\cucumber\index.html"
```

Open a Playwright report:

```cmd
npx playwright show-report reports/ui/playwright
npx playwright show-report reports/accessibility/playwright
npx playwright show-report reports/api/playwright
```

Generate and open an Allure report for a segment:

```cmd
npx allure generate reports\ui\allure-results --clean -o reports\ui\allure-report
npx allure open reports\ui\allure-report
```

Replace `ui` with `accessibility` or `api` for the other segments.

Allure requires Java. The equivalent shortcut commands are:

```cmd
npm run allure:ui
npm run allure:accessibility
npm run allure:api
```

## Code quality commands

Run all lint checks:

```bash
npm run lint
```

Run TypeScript and JavaScript linting only:

```bash
npm run lint:ts
```

Run Gherkin linting only:

```bash
npm run lint:feature
```

Check formatting or automatically format the repository:

```bash
npm run format
npm run format:fix
```

The Husky pre-commit hook runs lint-staged checks for staged TypeScript, feature, JSON, and Markdown files.

## Configuration

The main configuration is in [`playwright.config.ts`](./playwright.config.ts):

- `baseURL` defines the application under test.
- `projects` selects browser and test-directory combinations.
- `reporter` configures Playwright, Allure, and Cucumber reporters.
- `screenshot`, `video`, and `trace` retain useful evidence when tests fail.
- CI runs use retries and a single worker.

For a different environment, update `baseURL` or replace it with an environment variable before running the suite. Do not commit passwords, API keys, or other secrets to feature files or configuration.

## Continuous integration

The workflow in [`.github/workflows/playwright.yml`](./.github/workflows/playwright.yml) runs for pull requests. It:

1. Installs Node dependencies and Playwright browsers.
2. Runs the BDD test suite.
3. Generates Allure and Cucumber reports.
4. Uploads the Allure report as a workflow artifact.
5. Deploys the Allure preview to Netlify.
6. Publishes the Cucumber report to GitHub Pages.

The Netlify deployment requires these repository secrets:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Troubleshooting

### Browsers are missing

Install the Playwright browsers again:

```bash
npx playwright install
```

### Feature changes are not being executed

Regenerate the BDD test files before running a focused Playwright command:

```bash
npx bddgen
```

### A test fails intermittently

Review the trace, video, and screenshot in `test-results/`. To inspect a trace:

```bash
npx playwright show-trace <path-to-trace.zip>
```

### The application URL is unavailable

The current examples use a public demo site. Confirm that the configured `baseURL` is reachable and that the test data is still valid before debugging the framework.

## Useful references

- [Playwright documentation](https://playwright.dev/docs/intro)
- [Playwright Test configuration](https://playwright.dev/docs/test-configuration)
- [playwright-bdd documentation](https://github.com/vitalets/playwright-bdd)
- [Cucumber Gherkin reference](https://cucumber.io/docs/gherkin/reference)
- [axe-core Playwright integration](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
