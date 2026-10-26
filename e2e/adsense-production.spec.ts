import { test, expect, Page } from '@playwright/test';

// Run against `npm run build && npm start`, never against the dev server.
test.skip(!process.env.PW_ADSENSE_PRODUCTION, 'Requires the production ad components');

const mockedAdSense = `
  window.__adRequests = [];
  const queued = window.adsbygoogle || [];
  window.adsbygoogle = { push() {
    const ad = document.querySelector('ins.adsbygoogle:not([data-adsbygoogle-status])');
    if (!ad) throw new Error('AdSense: duplicate request');
    const width = ad.getBoundingClientRect().width;
    if (width <= 0) throw new Error('AdSense: zero-width request');
    ad.setAttribute('data-adsbygoogle-status', 'done');
    window.__adRequests.push({ slot: ad.getAttribute('data-ad-slot'), width });
    return window.__adRequests.length;
  }};
  queued.forEach(() => window.adsbygoogle.push({}));
`;

async function mockThirdParties(page: Page, scriptReady: Promise<void> = Promise.resolve()) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      return route.continue();
    }
    if (url.hostname === 'pagead2.googlesyndication.com') {
      await scriptReady;
      return route.fulfill({ contentType: 'application/javascript', body: mockedAdSense });
    }
    // Block analytics, auth network calls, and other external scripts.
    return route.abort();
  });
  return errors;
}

async function expectRequested(page: Page, selector: string) {
  await expect(page.locator(selector).locator('ins.adsbygoogle')).toHaveAttribute(
    'data-adsbygoogle-status', 'done'
  );
}

test('mobile articles lazy-load every placement without hiding or fading ads', async ({ page }) => {
  const errors = await mockThirdParties(page);
  await page.goto('/articles/how-we-predict-a-game/');
  const ads = page.locator('.AdSenseUnit');
  await expect(ads).toHaveCount(4);
  for (let i = 0; i < 4; i += 1) {
    await ads.nth(i).scrollIntoViewIfNeeded();
    await expect(ads.nth(i).locator('ins')).toHaveAttribute('data-adsbygoogle-status', 'done');
    expect(await ads.nth(i).evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      opacity: getComputedStyle(el.parentElement!).opacity,
      hidden: Boolean(el.closest('[aria-hidden="true"]')),
    }))).toMatchObject({ height: 280, opacity: '1', hidden: false });
  }
  expect(await page.evaluate(() => (window as any).__adRequests.length)).toBe(4);
  expect(errors.filter((error) => /AdSense|hydration|Minified React/.test(error))).toEqual([]);
});

test('desktop rail stays unrequested on mobile and survives subsequent resizing', async ({ page }) => {
  const errors = await mockThirdParties(page);
  await page.goto('/competitions/');
  await expectRequested(page, '[data-placement="competitions-above-fold"]');
  const rail = page.locator('[data-placement="sidebar-rail"]');
  await expect(rail.locator('ins')).toHaveCount(0);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expectRequested(page, '[data-placement="sidebar-rail"]');
  await rail.locator('ins').evaluate((el) => el.setAttribute('data-test-preserved', 'yes'));
  await page.setViewportSize({ width: 393, height: 851 });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(rail.locator('ins')).toHaveAttribute('data-test-preserved', 'yes');
  expect(await page.evaluate(() => (window as any).__adRequests.filter(
    (request: any) => request.slot === '1153310858'
  ).length)).toBe(1);
  expect(errors.filter((error) => /AdSense|hydration|Minified React/.test(error))).toEqual([]);
});

test('queues all units before the script arrives and preserves them on anchor navigation', async ({ page }) => {
  let releaseScript!: () => void;
  const scriptReady = new Promise<void>((resolve) => { releaseScript = resolve; });
  const errors = await mockThirdParties(page, scriptReady);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/competitions/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(2);
  await expect.poll(() => page.evaluate(() => (window as any).adsbygoogle?.length)).toBe(2);
  releaseScript();
  await expectRequested(page, '[data-placement="competitions-above-fold"]');
  await expectRequested(page, '[data-placement="sidebar-rail"]');

  const ad = page.locator('[data-placement="competitions-above-fold"] ins');
  await ad.evaluate((el) => el.setAttribute('data-test-preserved', 'yes'));
  await page.evaluate(async () => {
    await (window as any).next.router.push('/competitions/#featured');
  });
  await expect(ad).toHaveAttribute('data-test-preserved', 'yes');
  expect(await page.evaluate(() => (window as any).__adRequests.length)).toBe(2);
  expect(errors.filter((error) => /AdSense|hydration|Minified React/.test(error))).toEqual([]);
});
