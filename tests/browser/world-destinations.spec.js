import { test, expect } from '@playwright/test';
import { WORLD_DESTINATIONS } from '../../src/locations.js';

test(
  'desktop map, boat choice and launch fit together without scrolling',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('./?lang=en');
    await page.locator('[data-mode=explore]').click();
    for (const size of [
      { width: 1280, height: 720 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(size);
      for (const id of ['virgin-islands', 'santorini', 'geiranger']) {
        await page.locator(`[data-atlas-location="${id}"]`).click();
        await expect(page.locator('.world-atlas')).toBeInViewport({ ratio: 1 });
        await expect(page.locator('#cover-vessel')).toBeInViewport({ ratio: 1 });
        await expect(page.locator('#cover-start-free')).toBeInViewport({ ratio: 1 });
        const map = await page.locator('.world-atlas').boundingBox();
        const setup = await page.locator('.sailing-setup').boundingBox();
        const start = await page.locator('#cover-start-free').boundingBox();
        const pager = await page.locator('.cover-pager').boundingBox();
        expect(setup.x).toBeGreaterThanOrEqual(map.x + map.width);
        expect(start.y + start.height).toBeLessThan(pager.y);
        expect(await page.locator('#section-cover').evaluate((node) => node.scrollTop)).toBe(0);
      }
    }
    await page.locator('#cover-vessel').click();
    await page.locator('#vessel-option-catamaran').click();
    await expect(page.locator('#cover-vessel')).toHaveAttribute('data-vessel', 'catamaran');
  },
);

for (const width of [1440, 390])
  test(
    `world map and live sailing work without WebGL at ${width}px`,
    { tag: width === 390 ? '@smoke' : [] },
    async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        window.webglAttempts = 0;
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          if (/webgl/.test(type)) {
            window.webglAttempts++;
            return null;
          }
          return original.call(this, type, ...args);
        };
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('./');
      await page.locator(width > 900 ? '[data-mode=explore]' : '[data-section=explore]').click();
      await expect(page.locator('[data-atlas-location]')).toHaveCount(10);
      for (const destination of WORLD_DESTINATIONS) {
        const pin = page.locator(`[data-atlas-location="${destination.id}"]`);
        await pin.click();
        await expect(pin).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('#cover-location-name')).toHaveText(destination.title);
        await expect(page.locator('#cover-location-description')).toBeVisible();
        await expect(
          page.locator(`#section-cover [data-atlas-location][aria-pressed=true]`),
        ).toHaveCount(1);
      }
      expect(await page.evaluate(() => window.webglAttempts)).toBe(0);
      expect(
        await page.locator('#section-cover').evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
      ).toBe(true);
      await page.locator('[data-atlas-location=virgin-islands]').click();
      await page.locator('#cover-start-free').click();
      await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
      await expect(page.locator('#scene')).toHaveAttribute('data-renderer', 'chart');
      await expect(page.locator('#scene canvas')).toBeVisible();
      await expect(page.locator('#scene')).toHaveAttribute('data-location', 'virgin-islands');
      expect(
        await page.locator('#scene canvas').evaluate((c) => {
          const pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
          const colors = new Set();
          for (let i = 0; i < pixels.length; i += 400)
            colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
          return colors.size;
        }),
      ).toBeGreaterThan(5);
      if (width <= 900) await page.locator('#mobile-menu-toggle').click();
      await page.locator('#session-exit').click();
      await page.locator('[data-atlas-location=geiranger]').click();
      await page.locator('#cover-start-free').click();
      await expect(page.locator('#scene')).toHaveAttribute('data-location', 'geiranger');
      await expect(page.locator('#scene')).toHaveAttribute('data-renderer', 'chart');
      expect(errors).toEqual([]);
    },
  );

test('world geography stays north-up with RTL and enlarged text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  await page.goto('./?lang=he');
  await page.locator('[data-section=explore]').click();
  await page.locator('[data-atlas-location=bora-bora]').click();
  await expect(page.locator('.atlas-map')).toHaveAttribute('dir', 'ltr');
  expect(
    await page.locator('#section-cover').evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
  ).toBe(true);
  await expect(page.locator('[data-atlas-location=bora-bora]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
