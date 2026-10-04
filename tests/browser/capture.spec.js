import { test, expect } from '@playwright/test';

test('exports real scene pixels in desktop and mobile helm views and offers save/share recovery', async ({
  page,
}, testInfo) => {
  test.setTimeout(300000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 960, height: 720 });
  await page.addInitScript(() => {
    window.sharedImages = [];
    window.shareSupported = true;
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => window.shareSupported,
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async ({ files }) => {
        if (window.shareFailure) throw new DOMException('Test share result', window.shareFailure);
        window.sharedImages.push({ name: files[0].name, size: files[0].size, type: files[0].type });
      },
    });
  });
  await page.goto('./?lang=en');
  const scene = page.locator('#scene');
  const settle = () =>
    expect(scene).toHaveAttribute('data-render-pending', 'false', { timeout: 90000 });
  await expect(scene.locator(':scope > canvas')).toHaveCount(0);
  await expect(page.locator('#scene-capture')).toBeHidden();
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-start-free').click();
  await page.locator('#play').click();
  await settle();
  const time = await scene.getAttribute('data-visual-time');
  for (const view of ['chase', 'helm']) {
    if (view === 'helm') {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('#mobile-menu-toggle').click();
      await page.locator('[data-camera=helm]').click();
      await expect(page.locator('#mobile-menu')).toBeHidden();
      await expect(scene).toHaveAttribute('data-camera', 'helm');
      await settle();
      await page.evaluate(() => {
        window.shareSupported = false;
      });
    }
    const capture = page.locator('#scene-capture');
    await expect(capture).toBeInViewport({ ratio: 1 });
    await expect(capture).toBeEnabled();
    await capture.click();
    const preview = page.locator('#scene-capture-preview img');
    await expect(preview).toBeVisible();
    const pixels = await preview.evaluate(async (image) => {
      const blob = await (await fetch(image.src)).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      const colors = new Set();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 255) transparent++;
        if (i % 400 === 0) colors.add(`${data[i] >> 4}:${data[i + 1] >> 4}:${data[i + 2] >> 4}`);
      }
      bitmap.close();
      return {
        width: canvas.width,
        height: canvas.height,
        colors: colors.size,
        transparent,
        size: blob.size,
        type: blob.type,
      };
    });
    expect(pixels.type).toBe('image/png');
    expect(pixels.size).toBeGreaterThan(10000);
    expect(pixels.colors).toBeGreaterThan(30);
    expect(pixels.transparent).toBe(0);
    expect(Math.max(pixels.width, pixels.height)).toBeLessThanOrEqual(2048);
    expect(Math.min(pixels.width, pixels.height)).toBeGreaterThan(200);
    if (view === 'chase') {
      await page.locator('#capture-share').click();
      expect(await page.evaluate(() => window.sharedImages[0])).toMatchObject({
        type: 'image/png',
        size: pixels.size,
      });
      await page.evaluate(() => {
        window.shareFailure = 'AbortError';
      });
      await page.locator('#capture-share').click();
      await expect(page.locator('#capture-message')).toBeHidden();
      await page.evaluate(() => {
        window.shareFailure = 'NotAllowedError';
      });
      await page.locator('#capture-share').click();
      await expect(page.locator('#capture-message')).toHaveText(
        'Sharing is unavailable. Save the image instead.',
      );
    } else await expect(page.locator('#capture-share')).toBeHidden();
    const downloadEvent = page.waitForEvent('download');
    await page.locator('#capture-save').click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toMatch(/^sail-.*\.png$/);
    await download.saveAs(testInfo.outputPath(`scene-${view}.png`));
    await page.screenshot({ path: testInfo.outputPath(`capture-${view}.png`) });
    await page.locator('#close-modal').click();
    await settle();
    await expect(scene).toHaveAttribute('data-visual-time', time);
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-paused');
  }
  expect(errors).toEqual([]);
});

test('capture stays on the simulation toolbar in lessons and races, with an explicit graphics fallback', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    localStorage.setItem('sail-text-size', '200');
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?lang=he');
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="8"]').click();
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  const capture = page.locator('.mobile-scene-toolbar #scene-capture');
  await expect(capture).toBeInViewport({ ratio: 1 });
  await expect(capture).toBeDisabled();
  await expect(capture).toHaveAttribute('title', 'צילום הסצנה אינו זמין בדפדפן זה.');
  const buttonBox = await capture.boundingBox();
  const lessonBox = await page.locator('#mobile-lesson-toggle').boundingBox();
  expect(lessonBox.x).toBeGreaterThanOrEqual(buttonBox.x + buttonBox.width);
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('#session-exit').click();
  await expect(capture).toBeHidden();
  await page.locator('[data-section=challenge]').click();
  await page.locator('.cover-section-browser > summary').click();
  await page.locator('[data-race-course=harbor-sprint]').click();
  await page.locator('#race-start').click();
  await expect(capture).toBeInViewport({ ratio: 1 });
  await page.setViewportSize({ width: 1180, height: 820 });
  await expect(page.locator('#session-controls #scene-capture')).toBeInViewport({ ratio: 1 });
});
