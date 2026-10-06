import { test, expect } from '@playwright/test';
import { LOCATIONS } from '../../src/locations.js';

for (const width of [1440, 390]) {
  test(`destination maps are ready before opening the ${width}px picker and reused across desktop and mobile`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
    const maps = [],
      graphics = [];
    page.on('request', (request) => {
      if (request.url().includes('/destination-previews/')) maps.push(request.url());
      if (/\/assets\/(scene|three)-.*\.js/.test(request.url())) graphics.push(request.url());
    });
    await page.goto('./');
    await expect(page.locator('body')).toHaveAttribute('data-section', 'learn');
    const ready = (selector) =>
      page
        .locator(selector)
        .evaluateAll(
          (images) => images.filter((image) => image.complete && image.naturalWidth > 0).length,
        );
    await expect.poll(() => ready('.destination-choice img')).toBe(LOCATIONS.length);
    expect(maps).toHaveLength(LOCATIONS.length);
    expect(new Set(maps).size).toBe(LOCATIONS.length);
    expect(graphics).toEqual([]);
    await page.locator(width <= 900 ? '[data-section=explore]' : '[data-mode=explore]').click();
    if (width <= 900) await page.locator('#cover-browser-title').click();
    expect(await ready('.destination-choice img')).toBe(LOCATIONS.length);
    await page.locator('[data-cover-location=fjord]').click();
    // The same cards move from the desktop sidebar into the mobile dropdown.
    // Neither opening again nor switching layouts should wait for another fetch.
    if (width <= 900) await page.locator('#cover-browser-title').click();
    expect(await ready('.destination-choice img')).toBe(LOCATIONS.length);
    await page.setViewportSize({ width: width <= 900 ? 1440 : 390, height: 1000 });
    if (width > 900) await page.locator('#cover-browser-title').click();
    await expect(page.locator('[data-cover-location=fjord]')).toBeVisible();
    expect(await ready('.destination-choice img')).toBe(LOCATIONS.length);
    expect(maps).toHaveLength(LOCATIONS.length);
    expect(graphics).toEqual([]);
  });
}
