import { test, expect } from '@playwright/test';

const year = new Date().getFullYear();

test.describe('content derivation', () => {
  test('"years" stat tiles are derived from start years, not hand-typed', async ({ page }) => {
    await page.goto('/');
    await page.locator('.stats').scrollIntoViewIfNeeded(); // tiles count up from 0 once visible
    const tile = (label) => page.locator('.stat', { hasText: label }).locator('.n');
    await expect(tile('years writing code')).toHaveText(String(year - 2018));
    await expect(tile('years trading')).toHaveText(String(year - 2024));
  });

  test('prose that repeats those numbers agrees with the tiles and has no unresolved tokens', async ({ page }) => {
    await page.goto('/');
    const lede = await page.locator('.lede').textContent();
    expect(lede).not.toMatch(/[{}]/);
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
    expect(lede.toLowerCase()).toContain(`${words[year - 2018]} years of coding`);
    expect(lede.toLowerCase()).toContain(`${words[year - 2024]} years of equity trading`);
  });

  test('Tech stack.json shows the same derived coding figure', async ({ page }) => {
    await page.goto('/tech');
    const input = page.locator('input[aria-label="terminal input"]');
    await input.click();
    await input.fill('stack');
    await input.press('Enter');
    await expect(page.locator('body')).toContainText(new RegExp(`years_writing_code"?\\s*:\\s*${year - 2018}`));
  });
});

test('static feed entries never carry a decaying relative label', async () => {
  const feed = (await import('../src/data/feed.json', { with: { type: 'json' } })).default;
  for (const f of feed) {
    // "1w"/"3w"/"2mo" are only honest if computed from a timestamp (the live
    // GitHub items are); hand-typed ones go stale the day after they're written.
    expect(f.t, `static entry "${f.xHtml.slice(0, 40)}…"`).toMatch(/^\d{4}$/);
  }
});
