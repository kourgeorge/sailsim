import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const select = async (page, index) => {
  await page.locator('#course-library').click();
  await page.locator(`[data-library-lesson="${index}"]`).click();
};

test.describe('marina lesson flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
  });
  test('entry, docking and exit launch actual engine practice with saved attempts', async ({
    page,
  }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('./');
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'ready');
    await expect(page.locator('#progress-label')).toHaveText('0 / 51');
    for (const [index, steps] of [
      [42, 3],
      [43, 2],
      [44, 4],
    ]) {
      await select(page, index);
      await page.locator('#practice-start').click();
      await expect(page.locator('.practice-briefing-goals li')).toHaveCount(steps);
      await expect(page.locator('.practice-conditions')).toContainText('3 knots');
      await page.locator('#practice-launch').click();
      await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
      await expect(page.locator('#engine-throttle')).toBeVisible();
      await page.locator('#engine-throttle').fill(index === 44 ? '-0.3' : '0.3');
      await expect
        .poll(async () => Math.abs(Number(await page.locator('#speed').textContent())))
        .toBeGreaterThan(0.1);
      await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
      await page.locator('#practice-toggle').click();
      await expect(page.locator('[data-requirement="waypoint-distance"]')).toBeVisible();
      await expect(page.locator('[data-requirement="signed-speed"]')).toBeVisible();
      await page.locator('#practice-end').click();
      await expect(page.locator('.practice-debrief')).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            (id) =>
              JSON.parse(localStorage.getItem('sail-training-v1')).records[id]?.lastPracticeResult
                ?.status,
            `sail-${index + 1}`,
          ),
        )
        .toBe('failed');
      const record = await page.evaluate(
        (id) => JSON.parse(localStorage.getItem('sail-training-v1')).records[id],
        `sail-${index + 1}`,
      );
      expect(record.attempts).toBe(1);
      expect(record.practice).toBe(false);
      expect(record.lastPracticeResult.status).toBe('failed');
      await page.locator('#close-modal').click();
    }
    expect(errors).toEqual([]);
  });
  test('new lesson briefings and diagrams load in all six languages and on mobile', async ({
    page,
  }) => {
    for (const code of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`./?lang=${code}`);
      const pack = JSON.parse(
        readFileSync(new URL(`../../public/locales/${code}.json`, import.meta.url), 'utf8'),
      );
      await expect(page.locator('html')).toHaveAttribute('lang', code);
      await select(page, 43);
      await page.locator('#lesson-briefing').click();
      await expect(page.locator('.reader-heading h1')).toHaveText(pack.lessons['sail-44'].title);
      await expect(page.locator('.teaching-figure')).toBeVisible();
      await page.locator('#reader-close').click();
      await page.locator('#practice-start').click();
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('#practice-briefing-title')).toHaveText(
        pack.lessons['sail-44'].title,
      );
      await expect(page.locator('#practice-launch')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2),
      ).toBe(true);
    }
  });
});

test('marina targets render on the water and chart and clear on leaving lessons', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./');
  await expect(page.locator('#scene')).toHaveAttribute('data-frames', /\d+/, { timeout: 90000 });
  await select(page, 43);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await page.locator('#practice-toggle').click();
  await page.locator('[data-camera="chase"]').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-training-cues', 'true');
  await page.screenshot({ path: testInfo.outputPath('marina-berth.png') });
  await page.locator('#chart-toggle').click();
  await expect(page.locator('#modal canvas')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('marina-chart.png') });
  await page.locator('#close-modal').click();
  await page.locator('[data-mode="explore"]').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-training-cues', 'false');
  expect(errors).toEqual([]);
});
