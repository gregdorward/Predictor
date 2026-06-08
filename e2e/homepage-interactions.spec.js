// @ts-check
const { test, expect } = require('@playwright/test');
const {
  waitForFixtures,
  expandSection,
  selectRadioOption,
  runPredictions,
  openFirstFixtureStats,
  getFixtureDateLabel,
} = require('./helpers/homepage');

test.describe('Homepage interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForFixtures(page);
  });

  test('switches odds format in Options', async ({ page }) => {
    await expandSection(page, 'Options ☰');

    await selectRadioOption(page, 'Decimal odds', 'Options ☰');
    await expect(page.getByTestId('Decimal odds')).toBeChecked();

    await selectRadioOption(page, 'Fractional odds', 'Options ☰');
    await expect(page.getByTestId('Fractional odds')).toBeChecked();
  });

  test('switches prediction algorithm in Options', async ({ page }) => {
    await expandSection(page, 'Options ☰');

    await selectRadioOption(page, 'AI Tips', 'Options ☰');
    await expect(page.getByTestId('AI Tips')).toBeChecked();

    await selectRadioOption(page, 'SSH Tips', 'Options ☰');
    await expect(page.getByTestId('SSH Tips')).toBeChecked();
  });

  test('navigates fixtures by date', async ({ page }) => {
    const initialDate = await getFixtureDateLabel(page);

    await page.getByTestId('>').click();
    await expect
      .poll(async () => getFixtureDateLabel(page))
      .not.toBe(initialDate);

    await page.getByTestId('<').click();
    await expect.poll(async () => getFixtureDateLabel(page)).toBe(initialDate);
  });
});

test.describe('Homepage predictions flow', () => {
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForFixtures(page);
  });

  test('generates predictions and expands inline fixture stats', async ({ page }) => {
    await runPredictions(page);

    const firstFixture = page.locator('li[class*="individualFixture"]').first();
    await expect(firstFixture).toHaveAttribute('data-cy', /.+/);

    await openFirstFixtureStats(page);

    await expect(page.locator(`[data-cy$="leaguePosition"]`).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(`[data-cy$="teamScored"]`).first()).toBeVisible();
  });

  test('shows multis panel after generating predictions', async ({ page }) => {
    await runPredictions(page);
    await expect(page.getByRole('button', { name: 'Multis' }).first()).toBeVisible();
  });
});
