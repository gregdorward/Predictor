import { test, expect } from '@playwright/test';
import {
  waitForFixtures,
  expandSection,
  selectRadioOption,
  runPredictions,
  openFirstFixtureStats,
  getFixtureDateLabel,
} from './helpers/homepage';

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
    await expect.poll(async () => getFixtureDateLabel(page)).not.toBe(initialDate);

    await page.getByTestId('<').click();
    await expect.poll(async () => getFixtureDateLabel(page)).toBe(initialDate);
  });

  test('opens fixture date calendar and selects an in-range day', async ({ page }) => {
    const initialDate = await getFixtureDateLabel(page);
    const calendarButton = page.getByTestId('fixture-date-calendar');

    await calendarButton.click();
    const dialog = page.getByRole('dialog', { name: 'Choose fixture date' });
    await expect(dialog).toBeVisible();

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // react-calendar uses formatLongDate (day + month + year) as the tile abbr aria-label.
    const tomorrowAria = tomorrow.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    await dialog.getByRole('button', { name: tomorrowAria }).click();

    await expect(dialog).toBeHidden();
    await expect.poll(async () => getFixtureDateLabel(page)).not.toBe(initialDate);
  });

  test('disables out-of-range days in the fixture date calendar', async ({ page }) => {
    await page.getByTestId('fixture-date-calendar').click();
    const dialog = page.getByRole('dialog', { name: 'Choose fixture date' });
    await expect(dialog).toBeVisible();

    // Jump navigation until we can see a day beyond the +4 forward cap when possible.
    const nextMonth = dialog.locator('button.react-calendar__navigation__next-button');
    if (await nextMonth.isEnabled()) {
      await nextMonth.click();
      const disabledTiles = dialog.locator('button.react-calendar__tile:disabled');
      await expect(disabledTiles.first()).toBeVisible();
    } else {
      // Near month end with maxDate in the current month: still expect some disabled tiles.
      const disabledTiles = dialog.locator('button.react-calendar__tile:disabled');
      await expect(disabledTiles.first()).toBeVisible();
    }

    await page.getByRole('button', { name: 'Close calendar' }).click();
    await expect(dialog).toBeHidden();
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
