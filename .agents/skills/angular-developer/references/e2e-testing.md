# End-to-End (E2E) Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. E2E tests simulate real user interactions across browsers (Chromium, Firefox, WebKit).

## Running E2E Tests

```shell
npx playwright test
```

To run with the interactive UI mode:

```shell
npx playwright test --ui
```

To run headed (visible browser):

```shell
npx playwright test --headed
```

To run a specific test file:

```shell
npx playwright test e2e/home.spec.ts
```

## Test Structure

- **Configuration**: `playwright.config.ts` at the project root.
- **Specs**: `e2e/` folder, one file per feature or page.
- **Page Objects**: `e2e/pages/` — encapsulate selectors and actions per page.

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('home page shows featured festivals', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('festival-card')).toHaveCount(6);
});
```

## Best Practices

- **Use `data-testid` attributes** for selecting elements — they are resilient to CSS and structural changes. This project uses `data-testid` (not `data-cy`) as the convention.
- **Use Page Objects** to encapsulate per-page selectors and keep specs readable.
- **Prefer `getByRole`, `getByLabel`, `getByTestId`** over CSS selectors.
- **Avoid arbitrary `page.waitForTimeout()`** — use `waitForSelector`, `waitForResponse`, or Playwright's auto-waiting instead.
- **Test at the boundary**: E2E tests cover user-visible flows, not implementation details. Unit tests (Vitest) cover the logic.

## Project Convention

E2E tests live in `e2e/` at the project root, separate from unit tests in `src/`. The pre-commit gate (`npm run lint && npm test -- --run`) runs only unit tests; E2E tests are run in CI or manually before release.
