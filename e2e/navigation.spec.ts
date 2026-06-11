import { test, expect } from '@playwright/test';
import { navigateViaMenu } from './helpers/navigation';

type MenuRoute = {
  label: string;
  path: string;
  heading: string | RegExp;
};

const menuRoutes: MenuRoute[] = [
  { label: 'Home', path: '/', heading: /Welcome to/ },
  { label: 'Highest Scoring Leagues', path: '/o25/', heading: 'Elite Scoring Teams' },
  { label: 'Lowest Scoring Leagues', path: '/u25/', heading: 'Lowest Scoring Leagues' },
  { label: 'BTTS Teams', path: '/bttsteams/', heading: 'BTTS Elite Teams' },
  { label: 'BTTS Games', path: '/bttsfixtures/', heading: 'BTTS Insights' },
  { label: 'Over 2.5 Goals Games', path: '/fixtureshigh/', heading: 'Goal Potential Insights' },
  { label: 'Highest Scoring Teams', path: '/teamshigh/', heading: /Highest Scoring Teams|Elite Scoring Teams/ },
];

test.describe('Mobile navigation', () => {
  for (const route of menuRoutes) {
    test(`navigates to ${route.label}`, async ({ page }) => {
      await page.goto('/');
      await navigateViaMenu(page, route.label);

      await expect(page).toHaveURL(new RegExp(`${route.path.replace(/\//g, '\\/')}?$`));
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible();
    });
  }
});
