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

test.describe('watch mode', () => {
  test('hovering the story freezes the auto-advance progress bar', async ({ page }) => {
    await page.goto('/life/watch');
    await page.hover('.ws-story');
    // The freeze is CSS animation-play-state, which is instant and doesn't
    // race — asserting it directly avoids a timing-sensitive width-over-a-
    // wall-clock-wait check (flaky under parallel test-worker load).
    await expect(page.locator('.ws-progress-fill')).toHaveCSS('animation-play-state', 'paused');
  });

  test('arrow keys navigate entries', async ({ page }) => {
    await page.goto('/life/watch');
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
    await expect(page.locator('.feed-item').first()).toContainText('pushed 1 commit');
  });

  test('falls back to the static feed when the API fails', async ({ page }) => {
    await page.route('https://api.github.com/users/klystrn/events/public**', (route) =>
      route.fulfill({ status: 403, body: '{}' })
    );
    await page.goto('/finance');
    await expect(page.locator('.feed-item')).toHaveCount(5);
  });
});
