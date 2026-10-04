import { test, expect } from '@playwright/test';

test.use({ isMobile: true, hasTouch: true, launchOptions: { args: [] } });

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
});

// Replay the independent touch/pointer streams, including the pointer handoff
// seen on iPad. Real Chromium gestures below also verify native scroll behavior.
async function touch(page, type, dx = 0, dy = 0, extraFinger = false) {
  return page.evaluate(
    ({ type, dx, dy, extraFinger }) => {
      if (type === 'touchstart' && !extraFinger) {
        const target = document.querySelector('#scene-heading');
        const bounds = target.getBoundingClientRect();
        window.swipeTest = {
          target,
          x: bounds.x + bounds.width * 0.7,
          y: bounds.y + bounds.height / 2,
        };
      }
      const { target, x, y } = window.swipeTest;
      const points = [{ identifier: 7, target, clientX: x + dx, clientY: y + dy }];
      if (extraFinger)
        points.push({ identifier: 8, target, clientX: x + dx + 40, clientY: y + dy });
      // Desktop WebKit cannot construct Touch objects, even with mobile emulation.
      // Supply the touch lists on a synthetic event to replay that event sequence.
      const event = Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
        touches: /end|cancel/.test(type) ? [] : points,
        targetTouches: /end|cancel/.test(type) ? [] : points,
        changedTouches: points,
      });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    },
    { type, dx, dy, extraFinger },
  );
}

for (const viewport of [
  { width: 1180, height: 820 },
  { width: 820, height: 1180 },
  { width: 600, height: 820 },
]) {
  test.describe(`iPad lesson gestures at ${viewport.width}px`, () => {
    test.use({ viewport });

    test('keeps holding the lesson through pointer cancellation and a curved finish', async ({
      page,
    }) => {
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('./?lang=en');
      await page.locator('#scene-heading').scrollIntoViewIfNeeded();
      const surface = page.locator('.section-page:not([hidden])');
      const offset = () =>
        surface.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).m41);
      await touch(page, 'touchstart');
      expect(await touch(page, 'touchmove', -60, 8)).toBe(true);
      await expect.poll(offset).toBeCloseTo(-60);
      await page.locator('#scene-heading').dispatchEvent('pointercancel', {
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
      });
      expect(await touch(page, 'touchmove', -140, 30)).toBe(true);
      await expect.poll(offset).toBeCloseTo(-140);
      const preview = page.locator('.cover-slide-preview');
      const title = await preview.locator('.scene-title h2').textContent();
      const previewBounds = await preview.boundingBox();
      const surfaceBounds = await surface.boundingBox();
      const width = await page.locator('#section-cover').evaluate((node) => node.clientWidth);
      expect(previewBounds.x - surfaceBounds.x).toBeCloseTo(width, 0);
      await touch(page, 'touchmove', -160, 80);
      await expect.poll(offset).toBeCloseTo(-160);
      await touch(page, 'touchend', -160, 80);
      await expect(page.locator('#lesson-number')).toHaveText('02');
      await expect(page.locator('#scene-heading')).toHaveText(title);
      await expect(page.locator('.cover-slide-layer')).toHaveCount(0);
      await expect(surface).toHaveCSS('transform', 'none');

      // A short drag returns smoothly, and an actual canceled touch never selects.
      await touch(page, 'touchstart');
      await touch(page, 'touchmove', 20);
      await expect.poll(offset).toBeCloseTo(20);
      await touch(page, 'touchend', 20);
      await expect(surface).toHaveCSS('transform', 'none');
      await expect(page.locator('#lesson-number')).toHaveText('02');
      await touch(page, 'touchstart');
      await touch(page, 'touchmove', 100);
      await expect.poll(offset).toBeCloseTo(100);
      await touch(page, 'touchcancel', 100);
      await expect(surface).toHaveCSS('transform', 'none');
      await expect(page.locator('#lesson-number')).toHaveText('02');

      // Vertical movement and a second finger remain available to the browser.
      await touch(page, 'touchstart');
      expect(await touch(page, 'touchmove', 5, -70)).toBe(false);
      await touch(page, 'touchend', 5, -70);
      await touch(page, 'touchstart');
      await touch(page, 'touchmove', -60);
      expect(await touch(page, 'touchstart', -60, 0, true)).toBe(false);
      expect(await touch(page, 'touchmove', -100, 0, true)).toBe(false);
      await touch(page, 'touchend', -100);
      await expect(surface).toHaveCSS('transform', 'none');
      await expect(page.locator('#lesson-number')).toHaveText('02');
      await page.locator('.cover-next').tap();
      await expect(page.locator('#lesson-number')).toHaveText('03');
      await expect(page.locator('.cover-slide-layer')).toHaveCount(0);
      await expect(page.locator('#lesson-number')).toHaveText('03');
      await page.locator('.cover-previous').tap();
      await expect(page.locator('#lesson-number')).toHaveText('02');
      expect(errors).toEqual([]);
    });

    test('native gestures browse repeatedly while vertical scrolling stays available', async ({
      page,
      context,
      browserName,
    }) => {
      test.skip(
        browserName !== 'chromium',
        'CDP is needed to send real multi-point touch gestures',
      );
      await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
      await page.goto('./?lang=en');
      const client = await context.newCDPSession(page);
      async function gesture(dx, dy) {
        await page.locator('#scene-heading').scrollIntoViewIfNeeded();
        const bounds = await page.locator('#scene-heading').boundingBox();
        const x = bounds.x + bounds.width / 2;
        const y = Math.max(140, bounds.y + Math.min(bounds.height / 2, 60));
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x, y, id: 1 }],
        });
        for (let step = 1; step <= 8; step++) {
          await client.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8, id: 1 }],
          });
        }
        await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      for (const [dx, lesson] of [
        [-110, '02'],
        [-110, '03'],
        [110, '02'],
      ]) {
        await gesture(dx, 24);
        await expect(page.locator('#lesson-number')).toHaveText(lesson);
        await expect(page.locator('.cover-slide-layer')).toHaveCount(0);
      }
      const scroller = page.locator(viewport.width > 900 ? '#lesson-cover' : '#section-cover');
      await page.locator('#scene-heading').scrollIntoViewIfNeeded();
      const before = await scroller.evaluate((node) => ({
        top: node.scrollTop,
        canScroll: node.scrollHeight > node.clientHeight,
      }));
      await gesture(5, -100);
      if (before.canScroll)
        await expect
          .poll(() => scroller.evaluate((node) => node.scrollTop))
          .toBeGreaterThan(before.top);
      else await expect(scroller).toHaveJSProperty('scrollTop', 0);
      await expect(page.locator('#lesson-number')).toHaveText('02');
    });
  });
}
