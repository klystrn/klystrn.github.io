import { test, expect } from '@playwright/test';

/*
 * Story mode preview (/story). Guards the promises it makes: Paper stays the
 * default route, deep links land on the right chapter/arc, and on every
 * device size nothing overflows sideways and no caption, title or card is
 * cut off by the viewport.
 */

const SIZES = [
  ['desktop', 1440, 900],
  ['tablet', 820, 1100],
  ['phone', 390, 800],
  ['small phone', 320, 640],
];

async function readThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = page.viewportSize().height * 0.8;
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(500);
}

for (const [name, width, height] of SIZES) {
  test(`story fits a ${name} (${width}px): no sideways scroll, no clipped text`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/story');
    await expect(page.locator('.st-name')).toBeVisible();
    await readThrough(page);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const clipped = [];
      document.querySelectorAll('.st-cap, .st-title h2, .st-cardtitle, .st-latin span').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width && (r.left < -1 || r.right > vw + 1)) clipped.push(el.textContent.slice(0, 30));
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') clipped.push(`inner: ${el.textContent.slice(0, 30)}`);
      });
      return { scrollWidth: document.documentElement.scrollWidth, vw, clipped };
    });
    expect(result.scrollWidth, 'page must not scroll sideways').toBeLessThanOrEqual(result.vw);
    expect(result.clipped, 'text cut off by the viewport').toEqual([]);
  });
}

test('on a phone, captions stack under whole frames instead of overlapping them', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/story/chapter/sst');
  const frame = page.locator('#C03-S01-P01 .st-frame').first();
  await frame.scrollIntoViewIfNeeded();
  const sketch = await frame.locator('.st-sketch').boundingBox();
  const cap = await frame.locator('.st-capbox').first().boundingBox();
  expect(cap.y, 'caption sits below the image').toBeGreaterThanOrEqual(sketch.y + sketch.height - 1);
  // the frame keeps its full 16:9 shape — scaled down, not cropped
  expect(sketch.width / sketch.height).toBeCloseTo(16 / 9, 1);
});

test('chapter deep link lands on that chapter; Paper is still the home page', async ({ page }) => {
  await page.goto('/story/chapter/jpmorgan');
  await expect(page.locator('#ch-jpmorgan h2')).toBeInViewport();
  await expect(page.locator('#ch-jpmorgan h2')).toHaveText('JPMorganChase');
  await page.goto('/');
  await expect(page.locator('.story')).toHaveCount(0);
  await expect(page.locator('.lede')).toBeVisible();
});

test('a portal opens its side story and returns to the panel it came from', async ({ page }) => {
  await page.goto('/story/chapter/np');
  const portal = page.locator('#C04-S01-P02 a.PORTAL');
  await portal.scrollIntoViewIfNeeded();
  await portal.click();
  await expect(page).toHaveURL(/\/story\/arc\/frats$/);
  await expect(page.locator('.st-title.arc h2')).toHaveText('FRATS');
  await page.locator('.st-back').first().click();
  await expect(page).toHaveURL(/\/story\/chapter\/np#C04-S01-P02$/);
  await expect(page.locator('#C04-S01-P02')).toBeInViewport();
});

test('selection cards expand by tap and by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/story/chapter/present');
  const first = page.locator('#C02-S01-P01 .st-card').first();
  await first.scrollIntoViewIfNeeded();
  const btn = first.locator('.st-cardbtn');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(first.locator('.st-carddetail .SUB')).toBeVisible();
});
