import { test, expect } from '@playwright/test';
import { openMobileNav } from './helpers/navigation';

test.describe('Navigation menu vs ads', () => {
  test.use({ viewport: { width: 1400, height: 900 } });

  test('competition page hides injected high z-index ad while menu is open', async ({ page }) => {
    await page.goto('/competition/premier-league');
    await page.waitForLoadState('domcontentloaded');

    const blocker = page.locator('[data-testid="nav-ad-blocker"]');
    await expect(blocker).toHaveCount(0);

    await page.evaluate(() => {
      const div = document.createElement('div');
      div.setAttribute('data-testid', 'nav-ad-blocker');
      div.textContent = 'Fake ad';
      div.style.cssText =
        'position:fixed;left:80px;top:120px;width:160px;height:400px;z-index:2147483647;background:red;';
      document.body.appendChild(div);
    });

    await openMobileNav(page);

    await expect(page.locator('body')).toHaveClass(/ssh-nav-open/);
    await expect(blocker).toBeHidden();
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' })
    ).toBeVisible();
  });
});