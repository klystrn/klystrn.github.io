import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/tech', '/finance', '/life', '/life/photography', '/life/cards', '/life/watch'];

for (const route of ROUTES) {
  test(`${route || '/'} loads with no console or page errors`, async ({ page }) => {
    // /finance fetches live GitHub activity; mock it so this generic smoke
    // test doesn't depend on a third party being reachable and rate-limit-
    // free (the live-fetch/fallback behavior itself has its own dedicated
    // tests in interactions.spec.js).
    if (route === '/finance') {
      await page.route('https://api.github.com/users/klystrn/events/public**', (r) =>
        r.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      );
    }

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto(route, { waitUntil: 'networkidle' });
    expect(response.status(), `${route} should respond 200`).toBe(200);
    await page.waitForTimeout(300);

    expect(consoleErrors, `console errors on ${route}`).toEqual([]);
    expect(pageErrors, `uncaught page errors on ${route}`).toEqual([]);
  });
}

test('an unknown route renders the 404 page, not a silent redirect', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.locator('.nf-code')).toContainText('404');
});
