import { expect, Page } from '@playwright/test';

export async function waitForFixtures(page: Page): Promise<void> {
  const fixtureContainer = page.locator('#FixtureContainer');
  await expect(fixtureContainer.locator('.LoadingSpinnerContainer')).toBeHidden({ timeout: 30_000 });
  await expect(page.locator('li[class*="individualFixture"]').first()).toBeVisible({ timeout: 30_000 });
}

export async function expandSection(page: Page, label: string): Promise<void> {
  const trigger = page.locator('.Collapsible__trigger').filter({ hasText: label }).first();
  await trigger.scrollIntoViewIfNeeded();

  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click();
  }

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
}

export async function selectRadioOption(page: Page, label: string, sectionLabel?: string): Promise<void> {
  const scope = sectionLabel
    ? page.locator('.Collapsible').filter({ has: page.locator('.Collapsible__trigger').filter({ hasText: sectionLabel }) })
    : page;
  await scope.locator('label').filter({ hasText: label }).first().click();
}

export async function runPredictions(page: Page): Promise<void> {
  const predictionsButton = page.getByRole('button', { name: 'Get Predictions & Stats' });
  await expect(predictionsButton).toBeVisible({ timeout: 30_000 });
  await predictionsButton.click();

  await expect(page.getByText('Calculating all predictions')).toBeVisible({ timeout: 10_000 });
  await expect(predictionsButton).toBeEnabled({ timeout: 120_000 });
  await expect(page.getByText('Calculating all predictions')).toBeHidden({ timeout: 10_000 });
}

export async function openFirstFixtureStats(page: Page): Promise<void> {
  const firstFixture = page.locator('li[class*="individualFixture"]').first();
  await firstFixture.scrollIntoViewIfNeeded();
  await firstFixture.click();
  await expect(page.getByText('Last competition games (most recent first)')).toBeVisible({ timeout: 30_000 });
}

export async function getFixtureDateLabel(page: Page): Promise<string> {
  return page.locator('.FixtureButtons button').nth(1).innerText();
}

export async function prepareFixtureContext(page: Page): Promise<void> {
  await page.goto('/');
  await waitForFixtures(page);
  await runPredictions(page);
  await openFirstFixtureStats(page);
}
