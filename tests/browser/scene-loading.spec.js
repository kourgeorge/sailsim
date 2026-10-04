import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
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
});

test('browsing leaves graphics unloaded; entry shows loading without advancing the race clock', async ({
  page,
}) => {
  let release;
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  const requested = [];
  page.on('request', (request) => {
    if (/\/assets\/(scene|three)-.*\.js/.test(request.url())) requested.push(request.url());
  });
  await page.route('**/assets/scene-*.js', async (route) => {
    await waiting;
    await route.continue();
  });
  await page.goto('./');
  await page.locator('[data-mode=explore]').click();
  await page.locator('[data-cover-location=fjord]').click();
  await page.locator('#cover-vessel').click();
  await page.locator('#vessel-option-catamaran').click();
  await page.locator('[data-mode=challenge]').click();
  await page.locator('[data-race-course=harbor-sprint]').click();
  expect(requested).toEqual([]);
  expect(await page.evaluate(() => window.webglAttempts)).toBe(0);
  await page.locator('#race-start').click();
  await expect(page.locator('#scene-loading')).toBeVisible();
  await expect(page.locator('#scene-loading-title')).toHaveText('Loading simulation…');
  await page.waitForTimeout(350);
  await expect(page.locator('#race-clock')).toHaveText('0:00');
  await expect(page.locator('#scene')).toHaveAttribute('data-visual-time', '0.00000');
  expect(await page.evaluate(() => window.webglAttempts)).toBe(0);
  release();
  await expect(page.locator('#scene-loading')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  expect(await page.evaluate(() => window.webglAttempts)).toBeGreaterThan(0);
});

test('canceling an in-flight load returns to browsing and the next entry uses the latest boat', async ({
  page,
}) => {
  let release;
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/assets/scene-*.js', async (route) => {
    await waiting;
    await route.continue();
  });
  await page.goto('./');
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-start-free').click();
  await expect(page.locator('#scene-loading')).toBeVisible();
  await page.locator('#scene-loading-cancel').click();
  await expect(page.locator('#scene-loading')).toBeHidden();
  await expect(page.locator('#cover-start-free')).toBeVisible();
  await page.locator('#cover-vessel').click();
  await page.locator('#vessel-option-catamaran').click();
  release();
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.webglAttempts)).toBe(0);
  await page.locator('#cover-start-free').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await expect(page.locator('#scene')).toHaveAttribute('data-vessel', 'catamaran');
});

test('a failed graphics download gives a recoverable error in the mobile loading screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  await page.route('**/assets/scene-*.js', (route) => route.abort());
  await page.goto('./?lang=he');
  await page.locator('[data-section=explore]').click();
  await page.locator('#cover-start-free').click();
  await expect(page.locator('#scene-loading')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#scene-loading-reload')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#scene-loading-cancel')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#scene-loading-title')).toHaveText('לא ניתן לטעון את הסימולציה');
  await page.keyboard.press('Escape');
  await expect(page.locator('#cover-start-free')).toBeVisible();
  await expect(page.locator('#scene-loading')).toBeHidden();
});
