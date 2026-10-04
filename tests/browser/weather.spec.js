import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  await context.addInitScript(() => {
    Math.random = () => 0.371;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await page.clock.install();
});

test('free sailing defaults to changing weather, pauses it, and lets the sailor hold conditions fixed', async ({
  page,
}) => {
  await page.goto('./');
  await page.locator('[data-mode="explore"]').click();
  await expect(page.locator('#cover-conditions')).toContainText('Changing weather');
  await page.locator('#cover-conditions-button').click();
  await expect(page.locator('#weather-mode')).toHaveValue('changing');
  await page.locator('#wind-speed').fill('18');
  await page.locator('#close-modal').click();
  await page.locator('#cover-start-free').click();
  await page.clock.runFor(20000);
  await expect(page.locator('#weather-wind')).not.toContainText('18 kn');
  await page.locator('#conditions').click();
  const speed = await page.locator('#wind-speed-value').textContent();
  const direction = await page.locator('#wind-direction-value').textContent();
  await page.clock.runFor(5000);
  await expect(page.locator('#wind-speed-value')).toHaveText(speed);
  await expect(page.locator('#wind-direction-value')).toHaveText(direction);
  await page.locator('#weather-mode').selectOption('fixed');
  await page.locator('#wind-speed').fill('18');
  await page.locator('#close-modal').click();
  await page.clock.runFor(15000);
  await expect(page.locator('#weather-wind')).toContainText('18 kn');
  await page.locator('#session-exit').click();
  await expect(page.locator('#cover-conditions')).toContainText('Fixed weather');
  await expect(page.locator('#cover-conditions')).toContainText('18 kn');
  await page.locator('#cover-conditions-button').click();
  await page.locator('#weather-mode').selectOption('changing');
  await page.locator('#close-modal').click();
  await page.locator('#cover-start-free').click();
  await page.clock.runFor(30000);
  await page.locator('#session-exit').click();
  await expect(page.locator('#cover-conditions')).toContainText('18 kn');
  await expect(page.locator('#cover-conditions')).toContainText('Changing weather');
});

test('race weather choice defaults to changing and survives restarting in fixed mode', async ({
  page,
}) => {
  await page.goto('./');
  await page.locator('[data-mode="challenge"]').click();
  await page.locator('[data-race-course="harbor-sprint"]').click();
  await expect(page.locator('#race-weather')).toHaveValue('changing');
  await page.locator('#race-weather').selectOption('fixed');
  await page.locator('#race-start').click();
  await page.clock.runFor(15000);
  await expect(page.locator('#weather-wind')).toHaveText('14 kn W');
  await page.locator('#race-menu').click();
  await page.locator('#race-restart').click();
  await expect(page.locator('#race-weather')).toHaveValue('fixed');
  await page.locator('#race-weather').selectOption('changing');
  await page.locator('#race-start').click();
  await page.clock.runFor(25000);
  await expect(page.locator('#weather-wind')).not.toHaveText('14 kn W');
});
