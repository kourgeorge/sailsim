import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
  await page.clock.install();
});

async function mapPoints(page) {
  const canvas = page.locator('.sailing-track canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-track-points', /\d+/);
  return Number(await canvas.getAttribute('data-track-points'));
}

test('a sailing lesson debrief saves its actual route and restores it on mobile after reload', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('button[data-mode="learn"]').click();
  await page.locator('[data-library-lesson="13"]').click();
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await page.clock.runFor(4500);
  await page.locator('#session-exit').click();
  await expect(page.locator('.practice-debrief')).toBeVisible();
  expect(await mapPoints(page)).toBeGreaterThan(4);
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-14'].lastPracticeResult
        .track,
  );
  expect(saved.samples.at(-1).x).not.toBe(saved.samples[0].x);
  expect(saved.samples.at(-1).z).not.toBe(saved.samples[0].z);
  await page.screenshot({ path: testInfo.outputPath('lesson-desktop.png') });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?lang=he');
  await page.locator('#practice-debrief').click();
  expect(await mapPoints(page)).toBe(saved.samples.length);
  await expect(page.locator('.sailing-track figcaption strong')).toHaveText('מסלול ההפלגה שלך');
  const restored = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-14'].lastPracticeResult
        .track,
  );
  expect(restored).toEqual(saved);
  await page.locator('.sailing-track').scrollIntoViewIfNeeded();
  expect(
    await page.locator('#modal').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('lesson-mobile-he.png') });
  expect(errors).toEqual([]);
});

test('ending a fleet challenge shows the route and restarting clears the previous track', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('button[data-mode="challenge"]').click();
  await page.locator('[data-race-course="harbor-sprint"]').click();
  await page.locator('#race-start').click();
  await page.clock.runFor(9500);
  await page.locator('#session-exit').click();
  await expect(page.locator('.race-results')).toBeVisible();
  expect(await mapPoints(page)).toBeGreaterThan(4);
  await page.screenshot({ path: testInfo.outputPath('race-debrief.png') });
  await page.locator('#race-again').click();
  await page.locator('#session-exit').click();
  expect(await mapPoints(page)).toBe(1);
  await page.locator('#race-result-exit').click();
  await expect(page.locator('.simulator')).toHaveAttribute('data-mode', 'explore');
  expect(errors).toEqual([]);
});

test('the buoy-course debrief includes a route map and a fresh retry', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  await page.locator('button[data-mode="challenge"]').click();
  await page.locator('#race-engine-drills').click();
  await page.locator('#lab-buoys').click();
  await page.locator('#play').click();
  await page.clock.runFor(4500);
  await page.locator('#session-exit').click();
  await expect(page.locator('.challenge-debrief')).toBeVisible();
  expect(await mapPoints(page)).toBeGreaterThan(4);
  await page.screenshot({ path: testInfo.outputPath('buoy-debrief.png') });
  await page.locator('#challenge-again').click();
  await page.clock.runFor(300);
  await page.locator('#session-exit').click();
  expect(await mapPoints(page)).toBeLessThanOrEqual(2);
  await page.locator('#close-modal').click();
  await page.locator('button[data-mode="challenge"]').click();
  await page.locator('#race-engine-drills').click();
  await page.locator('#lab-buoys').click();
  await page.locator('#play').click();
  await page.clock.runFor(2500);
  await page.locator('#session-exit').click();
  expect(await mapPoints(page)).toBeGreaterThanOrEqual(3);
});
