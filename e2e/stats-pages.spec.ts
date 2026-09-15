import { test, expect } from '@playwright/test';

type StatsPage = {
  path: string;
  heading: string;
  tableLabel: string;
  requireRows: boolean;
};

const statsPages: StatsPage[] = [
  { path: '/bttsfixtures/', heading: 'BTTS Insights', tableLabel: 'BTTS potential table', requireRows: false },
  { path: '/fixtureshigh/', heading: 'Goal Potential Insights', tableLabel: 'highest scoring games table', requireRows: true },
  { path: '/highest-scoring-leagues/', heading: 'Highest Scoring Leagues', tableLabel: 'Highest scoring leagues table', requireRows: true },
];

const retiredHubRedirects = [
  { from: '/o25/', to: /\/fixtureshigh\/$/ },
  { from: '/u25/', to: /\/highest-scoring-leagues\/$/ },
  { from: '/bttsteams/', to: /\/bttsfixtures\/$/ },
  { from: '/btts-no-teams/', to: /\/bttsfixtures\/$/ },
];

test.describe('Stats subpages', () => {
  for (const { path, heading, tableLabel, requireRows } of statsPages) {
    test(`${path} renders heading and data table`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page.getByRole('table', { name: tableLabel })).toBeVisible();
      await expect(page.locator('table thead th').first()).toBeVisible();

      const rows = page.locator('table tbody tr');
      if (requireRows) {
        await expect(rows.first()).toBeVisible({ timeout: 20_000 });
        expect(await rows.count()).toBeGreaterThan(0);
      }
    });

    test(`${path} has a link back to the homepage`, async ({ page }) => {
      await page.goto(path);
      const homeLink = page.getByRole('link', { name: /back to home|^home$/i });
      await expect(homeLink.first()).toBeVisible();
    });
  }

  for (const { from, to } of retiredHubRedirects) {
    test(`${from} permanently redirects to the remaining hub`, async ({ page }) => {
      const response = await page.goto(from);
      expect(response?.ok()).toBeTruthy();
      await expect(page).toHaveURL(to);
    });
  }
});
