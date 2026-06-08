// @ts-check
const { expect } = require('@playwright/test');

/** @param {import('@playwright/test').Page} page */
async function waitForFixtures(page) {
  const fixtureContainer = page.locator('#FixtureContainer');
  await expect(fixtureContainer.locator('.LoadingSpinnerContainer')).toBeHidden({ timeout: 30_000 });
  await expect(page.locator('li[class*="individualFixture"]').first()).toBeVisible({ timeout: 30_000 });
}

/** @param {import('@playwright/test').Page} page */
async function expandSection(page, label) {
  const trigger = page.locator('.Collapsible__trigger').filter({ hasText: label }).first();
  await trigger.scrollIntoViewIfNeeded();

  if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
    await trigger.click();
  }

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
}

/** @param {import('@playwright/test').Page} page */
async function selectRadioOption(page, label, sectionLabel) {
  const scope = sectionLabel
    ? page.locator('.Collapsible').filter({ has: page.locator('.Collapsible__trigger').filter({ hasText: sectionLabel }) })
    : page;
  await scope.locator('label').filter({ hasText: label }).first().click();
}

/** @param {import('@playwright/test').Page} page */
async function runPredictions(page) {
  const predictionsButton = page.getByRole('button', { name: 'Get Predictions & Stats' });
  await expect(predictionsButton).toBeVisible({ timeout: 30_000 });
  await predictionsButton.click();

  await expect(page.getByText('Calculating all predictions')).toBeVisible({ timeout: 10_000 });
  await expect(predictionsButton).toBeEnabled({ timeout: 120_000 });
  await expect(page.getByText('Calculating all predictions')).toBeHidden({ timeout: 10_000 });
}

/** @param {import('@playwright/test').Page} page */
async function openFirstFixtureStats(page) {
  const firstFixture = page.locator('li[class*="individualFixture"]').first();
  await firstFixture.scrollIntoViewIfNeeded();
  await firstFixture.click();
  await expect(page.getByText('Last competition games (most recent first)')).toBeVisible({ timeout: 30_000 });
}

/** @param {import('@playwright/test').Page} page */
async function getFixtureDateLabel(page) {
  return page.locator('.FixtureButtons button').nth(1).innerText();
}

/** @param {import('@playwright/test').Page} page */
async function prepareFixtureContext(page) {
  await page.goto('/');
  await waitForFixtures(page);
  await runPredictions(page);
  await openFirstFixtureStats(page);
}

module.exports = {
  waitForFixtures,
  expandSection,
  selectRadioOption,
  runPredictions,
  openFirstFixtureStats,
  getFixtureDateLabel,
  prepareFixtureContext,
};
