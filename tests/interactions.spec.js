import { test, expect } from '@playwright/test';

// 25x ArrowUp always aims at the same spot on a fresh card, but exactly
// which ring that lands in depends on the arena's rendered height (62vh) —
// i.e. the viewport. Read the live preview instead of hardcoding a ring, so
// the test verifies the thing that actually matters (preview == outcome)
// without being coupled to a specific viewport size.
async function aimStraightUp(page) {
  await page.locator('.cg-card.live').focus();
  for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowUp');
  const preview = await page.locator('.cg-aim-preview').textContent();
  return parseInt(preview.replace('+', ''), 10);
}

test.describe('card game', () => {
  test('keyboard aim + throw scores via the same path as pointer drag', async ({ page }) => {
    await page.goto('/life/cards');
    const previewPts = await aimStraightUp(page);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    await expect(page.locator('.cg-score-n')).toHaveText(String(previewPts));
  });

  test('best score persists across a reload', async ({ page }) => {
    await page.goto('/life/cards');
    let perThrow = null;
    for (let round = 0; round < 10; round++) {
      const pts = await aimStraightUp(page);
      perThrow ??= pts;
      await page.keyboard.press('Enter');
      await page.waitForTimeout(650);
    }
    const total = String(perThrow * 10);
    await expect(page.locator('.cg-over-eyebrow')).toHaveText('NEW BEST');
    await expect(page.locator('.cg-over-score')).toHaveText(total);
    await page.reload();
    await expect(page.locator('.cg-best-n')).toHaveText(total);
  });
});

// The watch page is behind the Life WIP gate until its content lands;
// ?preview renders the real page, which is what these exercise.
test.describe('watch mode', () => {
  test('hovering the story freezes the auto-advance progress bar', async ({ page }) => {
    await page.goto('/life/watch?preview');
    await page.hover('.ws-story');
    // The freeze is CSS animation-play-state, which is instant and doesn't
    // race — asserting it directly avoids a timing-sensitive width-over-a-
    // wall-clock-wait check (flaky under parallel test-worker load).
    await expect(page.locator('.ws-progress-fill')).toHaveCSS('animation-play-state', 'paused');
  });

  test('arrow keys navigate entries', async ({ page }) => {
    await page.goto('/life/watch?preview');
    await expect(page.locator('.ws-year-big')).toHaveText('1968');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    await expect(page.locator('.ws-year-big')).toHaveText('1974');
  });
});

test.describe('skills constellation', () => {
  test('keyboard focus + arrow keys move the highlight cursor', async ({ page }) => {
    await page.goto('/');
    await page.locator('#skills').scrollIntoViewIfNeeded();
    // Scroll-jack the pinned zoom range until settled.
    for (let i = 0; i < 40; i++) {
      const op = await page.locator('.cn-node.leaf').first().evaluate((el) => parseFloat(getComputedStyle(el).opacity));
      if (op > 0.95) break;
      await page.mouse.wheel(0, 250);
      await page.waitForTimeout(60);
    }
    await page.locator('#constel').focus();
    const before = await page.locator('.sk-caption').textContent();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const after = await page.locator('.sk-caption').textContent();
    expect(after).not.toBe(before);
  });
});

test.describe('nav tooltips', () => {
  test('hovering a mode button reveals its explanation', async ({ page }) => {
    await page.goto('/');
    await page.locator('.mode-btn:has-text("Tech")').hover();
    const tip = page.locator('.mode-btn:has-text("Tech") .nav-tip');
    await expect(tip).toHaveCSS('opacity', '1');
  });

  test('"Professional" has no tooltip of its own', async ({ page }) => {
    await page.goto('/');
    const count = await page.locator('.tab-btn', { hasText: 'Professional' }).locator('.nav-tip').count();
    expect(count).toBe(0);
  });
});

test.describe('deep links', () => {
  test('Finance restores the selected stock from ?sym=', async ({ page }) => {
    await page.goto('/finance?sym=TCS');
    await expect(page.locator('.det-sym')).toHaveText('$TCS');
  });

  test('Paper opens a project modal from ?project=', async ({ page }) => {
    await page.goto('/?project=ATW');
    await expect(page.locator('.pj-modal.open h3')).toHaveText('Automated Trading Workflow');
  });

  test('Paper opens an experience modal from ?xp=', async ({ page }) => {
    await page.goto('/?xp=jpmc');
    await expect(page.locator('.pj-modal.open h3')).toContainText('J.P. Morgan');
  });
});

test.describe('finance news feed', () => {
  test('renders live GitHub items when the API succeeds', async ({ page }) => {
    await page.route('https://api.github.com/users/klystrn/events/public**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            type: 'PushEvent',
            created_at: new Date().toISOString(),
            repo: { name: 'klystrn/automated-trading-workflow' },
            payload: { commits: [{}] },
          },
        ]),
      })
    );
    await page.goto('/finance');
    // The fetch is deferred until the News panel nears the viewport.
    await page.locator('#fin-news').scrollIntoViewIfNeeded();
    await expect(page.locator('.feed-item').first()).toContainText('pushed 1 commit');
  });

  test('falls back to the static feed when the API fails', async ({ page }) => {
    await page.route('https://api.github.com/users/klystrn/events/public**', (route) =>
      route.fulfill({ status: 403, body: '{}' })
    );
    await page.goto('/finance');
    await page.locator('#fin-news').scrollIntoViewIfNeeded();
    const fallback = (await import('../src/data/feed.json', { with: { type: 'json' } })).default;
    await expect(page.locator('.feed-item')).toHaveCount(fallback.length);
  });
});

test.describe('paper', () => {
  test('the detail modal steps through siblings with ‹ ›', async ({ page }) => {
    await page.goto('/?xp=jpmc');
    await expect(page.locator('.pj-modal.open h3')).toContainText('J.P. Morgan');
    await page.locator('.pj-step button', { hasText: 'next' }).click();
    await expect(page.locator('.pj-modal.open h3')).toContainText('Alibaba');
    await expect(page).toHaveURL(/xp=ali/);
  });
});

test.describe('tech', () => {
  test('?file= opens that file', async ({ page }) => {
    await page.goto('/tech?file=stack');
    await expect(page.locator('.etab.on')).toContainText('stack.json');
  });

  test('terminal cat and grep read file contents', async ({ page }) => {
    await page.goto('/tech');
    const input = page.locator('input[aria-label="terminal input"]');
    await input.fill('cat contact');
    await input.press('Enter');
    await expect(page.locator('.term-body')).toContainText('email:');
    await input.fill('grep AWS');
    await input.press('Enter');
    await expect(page.locator('.term-body')).toContainText('jpmc-athena.md:');
  });

  test('tab completes a command', async ({ page }) => {
    await page.goto('/tech');
    const input = page.locator('input[aria-label="terminal input"]');
    await input.fill('who');
    await input.press('Tab');
    await expect(input).toHaveValue('whoami ');
  });
});

test.describe('finance', () => {
  test('watchlist search filters across both tabs', async ({ page }) => {
    await page.route('https://api.github.com/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/finance');
    await page.locator('.wl-search').fill('swift');
    await expect(page.locator('.wl-row')).toHaveCount(1);
    await expect(page.locator('.wl-row .wl-sym')).toHaveText('$SRTS');
  });
});

test.describe('life', () => {
  test('work-in-progress pages show the WIP card unless ?preview', async ({ page }) => {
    await page.goto('/life/photography');
    await expect(page.locator('.life-wip')).toBeVisible();
    await page.goto('/life/photography?preview');
    await expect(page.locator('.ig-grid')).toBeVisible();
  });
});
