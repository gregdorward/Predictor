/** @param {import('@playwright/test').Page} page */
async function openMobileNav(page) {
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).waitFor({ state: 'visible' });
}

/** @param {import('@playwright/test').Page} page */
async function navigateViaMenu(page, label) {
  await openMobileNav(page);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label }).click();
}

module.exports = { openMobileNav, navigateViaMenu };
