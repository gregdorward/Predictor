import { test, expect } from '@playwright/test';

type StatsPage = {
  path: string;
  heading: string;
  tableLabel: string;
  requireRows: boolean;
};

const statsPages: StatsPage[] = [
  { path: '/o25/', heading: 'Elite Scoring Teams', tableLabel: 'highest scoring teams table', requireRows: true },
  { path: '/u25/', heading: 'Lowest Scoring Leagues', tableLabel: 'Lowest scoring leagues table', requireRows: true },
  { path: '/bttsteams/', heading: 'BTTS Elite Teams', tableLabel: 'BTTS teams table', requireRows: true },
  { path: '/bttsfixtures/', heading: 'BTTS Insights', tableLabel: 'BTTS potential table', requireRows: false },
  { path: '/fixtureshigh/', heading: 'Goal Potential Insights', tableLabel: 'highest scoring games table', requireRows: true },
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
});
