import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // Browsing uses the published background images and works without WebGL.
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
});
async function swipe(client, from, to, end = 'touchEnd') {
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...from, id: 1 }],
  });
  for (let step = 1; step <= 8; step++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        {
          x: from.x + ((to.x - from.x) * step) / 8,
          y: from.y + ((to.y - from.y) * step) / 8,
          id: 1,
        },
      ],
    });
  }
  await client.send('Input.dispatchTouchEvent', { type: end, touchPoints: [] });
}
async function swipeCard(page, client, direction, end) {
  const title = page.locator('.section-page:not([hidden]) .scene-title h2');
  await title.scrollIntoViewIfNeeded();
  const bounds = await title.boundingBox();
  const width = page.viewportSize().width;
  const y = Math.min(page.viewportSize().height - 140, bounds.y + bounds.height / 2);
  const left = { x: 50, y },
    right = { x: width - 50, y };
  await swipe(
    client,
    direction === 'left' ? right : left,
    direction === 'left' ? left : right,
    end,
  );
}
async function count(page, position, total) {
  await expect(page.locator('.cover-page-number')).toHaveText(
    `${String(position).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
  );
  await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
}

test.describe('touch browsing', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('swipes browse lessons, all locations and all challenge families without starting them', async ({
    page,
    context,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./?lang=en');
    const client = await context.newCDPSession(page);
    await count(page, 1, 51);
    await expect(page.locator('.cover-previous')).toBeDisabled();
    await swipeCard(page, client, 'left');
    await count(page, 2, 51);
    await expect(page.locator('#lesson-number')).toHaveText('02');
    await swipeCard(page, client, 'right');
    await count(page, 1, 51);
    await swipeCard(page, client, 'left');
    await count(page, 2, 51);
    await page.reload();
    await count(page, 2, 51);
    await page.screenshot({ path: '/tmp/sail-browse-lesson-mobile.png', animations: 'disabled' });

    await page.locator('button[data-section=explore]').tap();
    const locations = ['haven', 'shelter', 'strait', 'fjord'];
    for (let i = 0; i < locations.length; i++) {
      if (i) await swipeCard(page, client, 'left');
      await count(page, i + 1, locations.length);
      await expect(page.locator('body')).toHaveAttribute('data-location-background', locations[i]);
    }
    await expect(page.locator('.cover-next')).toBeDisabled();
    await swipeCard(page, client, 'left');
    await count(page, 4, 4);
    await swipeCard(page, client, 'right', 'touchCancel');
    await count(page, 4, 4);
    await swipeCard(page, client, 'right');
    await count(page, 3, 4);

    await page.locator('button[data-section=challenge]').tap();
    await count(page, 1, 12);
    const items = page.locator(
      '#cover-challenges [data-sailing-challenge], #cover-challenges [data-race-course], #cover-challenges [data-cover-drill], #cover-challenges [data-cover-buoys]',
    );
    for (let i = 1; i < 12; i++) {
      await swipeCard(page, client, 'left');
      await count(page, i + 1, 12);
      await expect(items.nth(i)).toHaveAttribute('aria-current', 'true');
    }
    await expect(page.locator('#cover-start-buoys')).toBeVisible();
    await page.screenshot({
      path: '/tmp/sail-browse-challenge-mobile.png',
      animations: 'disabled',
    });
    await page.locator('#cover-start-buoys').tap();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await expect(page.locator('.cover-pager')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('vertical scrolling and controls keep their gestures, while RTL swipes follow reading order', async ({
    page,
    context,
  }) => {
    await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
    await page.goto('./?lang=he');
    const client = await context.newCDPSession(page);
    const cover = page.locator('#section-cover');
    await count(page, 1, 51);
    await swipe(client, { x: 120, y: 600 }, { x: 126, y: 280 });
    await expect.poll(() => cover.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    await count(page, 1, 51);
    await swipeCard(page, client, 'right');
    await count(page, 2, 51);
    await swipeCard(page, client, 'left');
    await count(page, 1, 51);
    await page.locator('button[data-section=explore]').tap();
    const picker = page.locator('#cover-vessel');
    await picker.scrollIntoViewIfNeeded();
    const bounds = await picker.boundingBox();
    await swipe(
      client,
      { x: bounds.x + bounds.width - 25, y: bounds.y + 20 },
      { x: bounds.x + 25, y: bounds.y + 20 },
    );
    await count(page, 1, 4);
    await page.locator('.cover-next').tap();
    await count(page, 2, 4);
    await cover.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    const lastButton = await page.locator('#cover-sound-options').boundingBox();
    const pager = await page.locator('.cover-pager').boundingBox();
    expect(lastButton.y + lastButton.height).toBeLessThan(pager.y);
    await page.screenshot({ path: '/tmp/sail-browse-large-rtl.png', animations: 'disabled' });
  });
});

test('desktop buttons and arrow keys share the selected lesson, location and challenge', async ({
  page,
}) => {
  await page.goto('./?lang=en');
  await page.locator('.cover-next').click();
  await count(page, 2, 51);
  await expect(page.locator('[data-course-lesson="1"]')).toHaveAttribute('aria-current', 'step');
  await page.locator('#section-cover').focus();
  await page.keyboard.press('ArrowRight');
  await count(page, 3, 51);
  await page.keyboard.press('ArrowLeft');
  await count(page, 2, 51);
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="50"]').click();
  await count(page, 51, 51);
  await expect(page.locator('.cover-next')).toBeDisabled();
  await page.locator('[data-mode=explore]').click();
  await page.locator('[data-cover-location=shelter]').click();
  await count(page, 2, 4);
  await page.locator('#cover-vessel').focus();
  await page.keyboard.press('ArrowRight');
  await count(page, 2, 4);
  await page.locator('.cover-next').click();
  await count(page, 3, 4);
  await page.screenshot({ path: '/tmp/sail-browse-desktop.png', animations: 'disabled' });
  await page.locator('[data-mode=challenge]').click();
  await page.locator('[data-cover-drill=engine-stop]').click();
  await count(page, 9, 12);
  await page.locator('.cover-previous').click();
  await count(page, 8, 12);
  await expect(page.locator('#cover-challenge-briefing .race-briefing')).toBeVisible();
});

test('pager fits all translations and supports reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  for (const lang of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(`./?lang=${lang}`);
    for (const section of ['learn', 'explore', 'challenge']) {
      await page.locator(`button[data-section=${section}]`).click();
      const nav = page.locator('.cover-pager');
      expect(await nav.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      const bounds = await nav.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(10);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(310);
      await page.locator('.cover-next').click();
      expect(
        await page
          .locator('.section-page:not([hidden])')
          .evaluate((node) => node.getAnimations().length),
      ).toBe(0);
    }
  }
});
