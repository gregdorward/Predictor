import { test, expect } from '@playwright/test';
import { prepareFixtureContext } from './helpers/homepage';

type FixtureDetails = {
  homeTeamName: string;
  awayTeamName: string;
  homeId: string | number;
  awayId: string | number;
};

test.describe('Fixture detail page', () => {
  test.setTimeout(180_000);

  test('loads team comparison after selecting a fixture on the homepage', async ({ page }) => {
    await prepareFixtureContext(page);

    const fixtureDetails = await page.evaluate(() => localStorage.getItem('fixtureDetails'));
    expect(fixtureDetails).toBeTruthy();

    const { homeTeamName, awayTeamName, homeId, awayId } = JSON.parse(fixtureDetails!) as FixtureDetails;
    expect(homeId).toBeTruthy();
    expect(awayId).toBeTruthy();

    await page.goto('/fixture/');

    await expect(page.locator('.FixturePage')).toBeVisible();
    await expect(page.locator('.FixturePage-headingTeam--home')).toContainText(homeTeamName);
    await expect(page.locator('.FixturePage-headingTeam--away')).toContainText(awayTeamName);
    await expect(page.getByText('Soccer Stats Hub Prediction')).toBeVisible();
    await expect(page.locator('.FixturePage-chartCard.ComparisonBarChart')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Attacking' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Defensive' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Season Stats' })).toBeVisible();
  });

  test('shows recent results for both teams', async ({ page }) => {
    await prepareFixtureContext(page);
    await page.goto('/fixture/');

    await expect(page.getByText('Recent Results').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.FixturePage-results').first()).toBeVisible();
  });

  test('renders season stat rows after team data loads', async ({ page }) => {
    await prepareFixtureContext(page);
    await page.goto('/fixture/');

    const seasonStat = page.locator('.FixturePage-pairedSection').filter({ hasText: 'Season Stats' });
    await expect(seasonStat).toBeVisible({ timeout: 30_000 });
    await expect(seasonStat.locator('.FixturePage-stat').first()).toBeVisible({ timeout: 30_000 });
  });
});
