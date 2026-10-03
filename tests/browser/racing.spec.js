import { test, expect } from '@playwright/test';

async function expectClearRaceReadings(page) {
  for (const selector of ['#race-hud', '.mobile-indicators', '#scene-compass']) {
    await expect(page.locator(selector)).toBeVisible();
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const panel = document.querySelector('#race-hud');
        const standings = panel.getBoundingClientRect();
        const intersects = (selector) => {
          const other = document.querySelector(selector).getBoundingClientRect();
          return (
            standings.left < other.right &&
            standings.right > other.left &&
            standings.top < other.bottom &&
            standings.bottom > other.top
          );
        };
        return {
          instruments: intersects('.mobile-indicators'),
          compass: intersects('#scene-compass'),
          controls: intersects('.simulation-console'),
          fits:
            standings.left >= 0 &&
            standings.right <= innerWidth &&
            panel.scrollWidth <= panel.clientWidth + 1,
        };
      }),
    )
    .toEqual({ instruments: false, compass: false, controls: false, fits: true });
}

test('races start from Challenges and pause, restart, and leave without leaking into other modes', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('[data-mode="challenge"]').click();
  await expect(page.locator('[data-race-course]')).toHaveCount(3);
  await page.locator('[data-race-course="windward-duel"]').click();
  await page.locator('#race-difficulty').selectOption('expert');
  await page.locator('#race-start').click();
  await expect(page.locator('.simulator')).toHaveAttribute('data-mode', 'race');
  await expect(page.locator('#race-standings li')).toHaveCount(4);
  await expect(page.locator('#race-hud')).toHaveAttribute('data-race-status', 'countdown');
  await expect(page.locator('.scene-title:visible')).toHaveCount(0);
  await expect(page.locator('.lesson-card')).toBeHidden();
  await expect(page.locator('.cockpit-group-engine')).toBeHidden();
  await expect(page.locator('#conditions')).toBeHidden();
  for (const key of ['helm', 'sheets', 'headsail', 'rig', 'anchor'])
    await expect(page.locator(`.cockpit-group-${key}`)).toBeVisible();
  await expect(page.locator('#sound-settings')).toBeHidden();
  await page.locator('#play').click();
  const countdown = await page.locator('#race-countdown').textContent();
  await page.waitForTimeout(400);
  await expect(page.locator('#race-countdown')).toHaveText(countdown);
  await page.locator('#play').click();
  await expect(page.locator('#race-hud')).toHaveAttribute('data-race-status', 'racing');
  await expect(page.locator('#race-countdown')).toBeHidden();
  await page.locator('#race-menu').click();
  const clock = await page.locator('#race-clock').textContent();
  await page.waitForTimeout(1100);
  await expect(page.locator('#race-clock')).toHaveText(clock);
  await page.locator('#race-restart').click();
  await expect(page.locator('#race-difficulty')).toHaveValue('expert');
  await page.locator('#race-start').click();
  await expect(page.locator('#race-clock')).toHaveText('0:00');
  await expect(page.locator('#race-hud')).toHaveAttribute('data-race-status', 'countdown');
  await page.locator('#race-menu').click();
  await page.locator('#race-exit').click();
  await expect(page.locator('#race-hud')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-section', 'challenge');
  await expect(page.locator('#section-cover')).toBeVisible();
  await expect(page.locator('#race-difficulty')).toHaveValue('expert');
  await page.locator('[data-mode="challenge"]').click();
  await page.locator('#race-engine-drills').click();
  await expect(page.locator('[data-drill]')).toHaveCount(3);
  await page.locator('#lab-buoys').click();
  await expect(page.locator('.simulator')).toHaveAttribute('data-mode', 'challenge');
  await expect(page.locator('#race-hud')).toBeHidden();
  expect(errors).toEqual([]);
});

test('mobile race briefing and controls fit large Hebrew text', async ({
  page,
  context,
}, testInfo) => {
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?lang=he');
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('.text-size-control summary').click();
  await page.locator('#sail-text-size-range').fill('200');
  await page.locator('.text-size-control summary').click();
  await page.locator('[data-mode="challenge"]').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await page.locator('#cover-browser-title').click();
  await page.locator('[data-race-course="channel-chase"]').click();
  await expect(page.locator('#cover-challenge-briefing')).toBeVisible();
  await page.locator('#race-start').scrollIntoViewIfNeeded();
  expect(
    await page
      .locator('#section-cover')
      .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await page.locator('#race-start').click();
  await expect(page.locator('#race-hud')).toBeVisible();
  await page.locator('#play').click();
  for (const viewport of [
    { width: 744, height: 941 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expectClearRaceReadings(page);
    await expect(page.locator('#chart-toggle')).toBeHidden();
  }
  await page.locator('#play').click();
  await page.locator('#mobile-menu-toggle').click();
  await expect(page.locator('#mobile-menu #chart-toggle')).toBeInViewport({ ratio: 1 });
  await page.locator('#mobile-menu #chart-toggle').click();
  await expect(page.locator('#large-chart')).toHaveAttribute('data-vessel-visible', 'true');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await page.locator('#close-modal').click();
  await expect(page.locator('#mobile-menu-toggle')).toBeFocused();
  await page.locator('#mobile-tab-sails').click();
  await expect(page.locator('#cockpit-jib-sheet')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('race-mobile-he.png') });
});

test('race bots and rings render in the real 3D scene and appear on the chart', async ({
  page,
}, testInfo) => {
  test.setTimeout(300000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(page.locator('#scene')).toHaveAttribute('data-render-pending', 'false', {
    timeout: 120000,
  });
  await page.locator('[data-mode="challenge"]').click();
  await page.locator('[data-race-course="harbor-sprint"]').click();
  await page.locator('#race-start').click();
  await page.locator('#play').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-race-boats', '3', { timeout: 120000 });
  await expect(page.locator('#scene')).toHaveAttribute('data-render-pending', 'false', {
    timeout: 120000,
  });
  await page.screenshot({ path: testInfo.outputPath('race-fleet.png') });
  await page.setViewportSize({ width: 744, height: 941 });
  await expectClearRaceReadings(page);
  await expect(page.locator('#scene')).toHaveAttribute('data-render-pending', 'false', {
    timeout: 120000,
  });
  await page.screenshot({ path: 'artifacts/mobile/race-instruments.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#chart-toggle').click();
  await expect(page.locator('#large-chart')).toHaveAttribute('data-vessel-visible', 'true');
  await page.screenshot({ path: testInfo.outputPath('race-chart.png') });
  await page.locator('#close-modal').click();
  await page.locator('#session-exit').click();
  await page.locator('button[data-mode="explore"]').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-race-boats', '0', { timeout: 120000 });
  expect(errors).toEqual([]);
});
