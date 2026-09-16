import { test, expect } from '@playwright/test';

type StatsTable = {
  label: string;
  requireRows: boolean;
};

type StatsPage = {
  path: string;
  heading: string;
  tables: StatsTable[];
};

const statsPages: StatsPage[] = [
  {
    path: '/bttsfixtures/',
    heading: 'BTTS Insights',
    tables: [
      { label: 'BTTS teams table', requireRows: true },
      { label: 'Low BTTS teams table', requireRows: true },
      { label: 'BTTS potential table', requireRows: false },
    ],
  },
  {
    path: '/fixtureshigh/',
    heading: 'Goal Potential Insights',
    tables: [
      { label: 'highest scoring teams table', requireRows: true },
      { label: 'highest scoring games table', requireRows: true },
    ],
  },
  {
    path: '/highest-scoring-leagues/',
    heading: 'Highest Scoring Leagues',
    tables: [
      { label: 'Highest scoring leagues table', requireRows: true },
      { label: 'Lowest scoring leagues table', requireRows: true },
    ],
  },
];

const retiredHubRedirects = [
  { from: '/o25/', to: /\/fixtureshigh\/$/ },
  { from: '/u25/', to: /\/highest-scoring-leagues\/$/ },
  { from: '/bttsteams/', to: /\/bttsfixtures\/$/ },
  { from: '/btts-no-teams/', to: /\/bttsfixtures\/$/ },
];

test.describe('Stats subpages', () => {
  for (const { path, heading, tables } of statsPages) {
    test(`${path} renders heading and amalgamated data tables`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole('heading', { name: heading })).toBeVisible();

      for (const { label, requireRows } of tables) {
        const table = page.getByRole('table', { name: label });
        await expect(table).toBeVisible();
        await expect(table.locator('thead th').first()).toBeVisible();

        if (requireRows) {
          const rows = table.locator('tbody tr');
          await expect(rows.first()).toBeVisible({ timeout: 20_000 });
          expect(await rows.count()).toBeGreaterThan(0);
        }
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
