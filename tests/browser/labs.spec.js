import { test, expect } from '@playwright/test';

// WebGL is not needed to read lessons; skipping it keeps these tests fast.
async function openLesson(page, index, { lang, readerPage = 0, lessonId } = {}) {
  await page.addInitScript(
    ({ lessonId, readerPage }) => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
      if (lessonId) sessionStorage.setItem(`sail-reader-${lessonId}`, String(readerPage));
    },
    { lessonId, readerPage },
  );
  await page.goto(lang ? `./?lang=${lang}` : './');
  await page.locator('button[data-mode="learn"]').click();
  await page.locator('#cover-course').click();
  await page.locator(`[data-library-lesson="${index}"]`).click();
  await page.locator('#lesson-briefing').click();
}

test('sail force lab responds to the keyboard, ticks tasks and stops on page change @smoke', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openLesson(page, 11, { lessonId: 'sail-12' });
  const lab = page.locator('.reader-figure .lab[data-lab="sail-force"]');
  await expect(lab).toBeVisible();
  await expect(lab).toHaveAttribute('data-lab-status', 'luffing');
  await expect(lab.locator('[data-task="luff"]')).toHaveAttribute('data-done', 'false');
  const sheet = lab.locator('[data-control="sheet"] input');
  await sheet.focus();
  await page.keyboard.press('Home');
  await expect(lab).toHaveAttribute('data-lab-status', 'stalled');
  await expect(lab.locator('[data-lab-readout]')).toContainText('Stalling');
  await expect(lab.locator('[data-task="stall"]')).toHaveAttribute('data-done', 'true');
  await page.keyboard.press('End');
  await expect(lab).toHaveAttribute('data-lab-status', 'luffing');
  await expect(lab.locator('[data-task="luff"]')).toHaveAttribute('data-done', 'true');
  for (let i = 0; i < 18; i++) await page.keyboard.press('ArrowLeft');
  await expect(lab.locator('[data-control="sheet"] output')).toHaveText('72°');
  await expect(lab).toHaveAttribute('data-lab-status', 'working');
  await expect(lab.locator('[data-task="best90"]')).toHaveAttribute('data-done', 'true');
  // Ticks are study progress only, kept for this lesson in sessionStorage.
  const ticks = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem('sail-lab-sail-12-sail-force')),
  );
  expect(ticks).toEqual({ stall: true, luff: true, best90: true });
  expect(await page.evaluate(() => localStorage.getItem('sail-training-v1') || '')).not.toContain(
    'sail-force',
  );
  // Enlarge opens a second copy in the dialog.
  await page.locator('#reader-enlarge').click();
  await expect(page.locator('#modal .lab[data-lab="sail-force"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#reader-next').click();
  await expect(page.locator('#lesson-reader .lab')).toHaveCount(0);
  await expect(page.locator('.reader-figure .teaching-figure')).toBeVisible();
  expect(errors).toEqual([]);
});

test('compass lab works right-to-left without mirroring the dial', async ({ page }) => {
  await openLesson(page, 3, { lang: 'he', lessonId: 'sail-04', readerPage: 4 });
  const lab = page.locator('.reader-figure .lab[data-lab="compass-wind"]');
  await expect(lab).toBeVisible();
  await expect(lab).toHaveAttribute('dir', 'rtl');
  await expect(lab).toHaveAttribute('lang', 'he');
  await expect(lab.locator('[data-lab-readout]')).toContainText('רוח צד');
  await expect(lab.locator('[data-control="heading"] input')).toHaveAttribute('dir', 'ltr');
  await lab.locator('[data-control="heading"] input').focus();
  for (let i = 0; i < 18; i++) await page.keyboard.press('ArrowRight');
  await expect(lab.locator('[data-control="heading"] output')).toHaveText('135°');
  await expect(lab).toHaveAttribute('data-lab-status', 'running');
  await lab.locator('[data-control="heading"] [data-nudge="5"]').click();
  await expect(lab.locator('[data-control="heading"] output')).toHaveText('140°');
});

test('labs fit a phone screen with controls under the drawing', async ({ page }) => {
  await openLesson(page, 11, { lessonId: 'sail-12' });
  await page.setViewportSize({ width: 390, height: 844 });
  const lab = page.locator('.reader-figure .lab');
  await expect(lab).toBeVisible();
  const stage = await lab.locator('.lab-stage svg').boundingBox();
  const controls = await lab.locator('.lab-controls').boundingBox();
  expect(stage.height).toBeLessThanOrEqual(844 * 0.45);
  expect(controls.y).toBeGreaterThan(stage.y + stage.height - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('time-based labs play, step and stop their loop when the page changes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLesson(page, 13, { lessonId: 'sail-14', readerPage: 1 });
  const lab = page.locator('.reader-figure .lab[data-lab="tack-gybe"]');
  await expect(lab).toBeVisible();
  // Reduced motion: nothing moves until the learner asks.
  await expect(lab).toHaveAttribute('data-playing', 'false');
  const time = lab.locator('.lab-scrub output');
  const before = await time.textContent();
  await lab.locator('[data-player="step"]').click();
  await expect(time).not.toHaveText(before);
  await lab.locator('[data-player="play"]').click();
  await expect(lab).toHaveAttribute('data-playing', 'true');
  const handle = await lab.elementHandle();
  await page.locator('#reader-next').click();
  await expect(page.locator('#lesson-reader .lab')).toHaveCount(0);
  // The removed lab was destroyed: its loop is stopped, not left running.
  expect(await handle.evaluate((el) => [el.isConnected, el.dataset.playing])).toEqual([
    false,
    'false',
  ]);
  expect(errors).toEqual([]);
});
