import { Page } from '@playwright/test';

export async function openMobileNav(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).waitFor({ state: 'visible' });
}

export async function navigateViaMenu(page: Page, label: string): Promise<void> {
  await openMobileNav(page);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label }).click();
}
