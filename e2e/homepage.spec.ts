import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with correct title and welcome content', async ({ page }) => {
    await expect(page).toHaveTitle(/Soccer Stats Hub/);
    await expect(page.getByRole('heading', { name: /Deep Stats/i, level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Just show me the games' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Turn football data into smarter picks.', level: 2 })).toBeVisible();
  });

  test('shows site header and date navigation controls', async ({ page }) => {
    await expect(page.locator('header.DarkMode')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('<')).toBeVisible();
    await expect(page.getByTestId('>')).toBeVisible();
  });

  test('shows collapsible sections for options and help', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Options ☰' }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'How to use' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Customise tips' }).first()).toBeVisible();
  });

  test('loads fixtures from the API', async ({ page }) => {
    const fixtureContainer = page.locator('#FixtureContainer');

    await expect(fixtureContainer.locator('.LoadingSpinnerContainer')).toBeHidden({ timeout: 30_000 });

    const hasFixtures = (await page.locator('li[class*="individualFixture"]').count()) > 0;
    const hasEmptyState = await page
      .getByRole('heading', { name: 'No fixtures found for this date' })
      .isVisible()
      .catch(() => false);

    expect(hasFixtures || hasEmptyState).toBeTruthy();
  });

  test('toggles dark mode', async ({ page }) => {
    const themeToggle = page.locator('label.theme-switch');
    await expect(themeToggle).toBeVisible({ timeout: 10_000 });

    const initialIsDark = await page.evaluate(() => document.body.classList.contains('dark-mode'));
    await themeToggle.click();
    const toggledIsDark = await page.evaluate(() => document.body.classList.contains('dark-mode'));

    expect(toggledIsDark).toBe(!initialIsDark);
  });
});
