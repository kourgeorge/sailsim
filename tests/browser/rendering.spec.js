import { test, expect } from '@playwright/test';

test('paused rendering stops after settling and wakes for camera, controls, resize and playback', async ({
  page,
}) => {
  test.setTimeout(300000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('./');
  const scene = page.locator('#scene');
  const frames = async () => Number(await scene.getAttribute('data-frames'));
  const settle = () =>
    expect(scene).toHaveAttribute('data-render-pending', 'false', { timeout: 90000 });
  await expect.poll(frames, { timeout: 90000 }).toBeGreaterThan(0);
  await settle();
  await expect(scene).toHaveAttribute('data-water-reflections', 'true');
  const initialFrames = await frames();
  await page.waitForTimeout(600);
  expect(await frames()).toBe(initialFrames);

  await page.locator('[data-mode="explore"]').click();
  await page.locator('#cover-start-free').click();
  await page.locator('#play').click();
  await page.locator('[data-camera="helm"]').click();
  await expect(scene).toHaveAttribute('data-camera', 'helm');
  await settle();
  const visualTime = await scene.getAttribute('data-visual-time');
  const beforeControls = await frames();
  await page.locator('#rudder').fill('12');
  await expect.poll(frames).toBeGreaterThan(beforeControls);
  await settle();
  expect(await scene.getAttribute('data-visual-time')).toBe(visualTime);

  const beforeWheel = await frames();
  await page.locator('#scene > canvas').hover({ position: { x: 400, y: 300 } });
  await page.mouse.wheel(0, 100);
  await expect.poll(frames).toBeGreaterThan(beforeWheel);
  await settle();
  const beforeResize = await frames();
  await page.setViewportSize({ width: 1100, height: 850 });
  await expect.poll(frames).toBeGreaterThan(beforeResize);
  await settle();
  const settledFrames = await frames();
  await page.waitForTimeout(600);
  expect(await frames()).toBe(settledFrames);

  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-running');
  await expect
    .poll(async () => Number(await scene.getAttribute('data-visual-time')))
    .toBeGreaterThan(Number(visualTime));
  await page.locator('#play').click();
  await settle();
  const pausedFrames = await frames();
  const pausedTime = await scene.getAttribute('data-visual-time');
  await page.waitForTimeout(600);
  expect(await frames()).toBe(pausedFrames);
  expect(await scene.getAttribute('data-visual-time')).toBe(pausedTime);
  expect(errors).toEqual([]);
});

test.describe('mobile water', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  });

  test('renders at higher resolution without a mirror shader and resumes playback', async ({
    page,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.addInitScript(() => {
      // Exercise the hardware mobile policy using the real software WebGL pipeline.
      // Renderer identification is optional and unavailable in some browsers.
      const prototype = WebGL2RenderingContext.prototype;
      const getExtension = prototype.getExtension;
      prototype.getExtension = function (name) {
        return name === 'WEBGL_debug_renderer_info' ? null : getExtension.call(this, name);
      };
      window.waterShaders = [];
      const shaderSource = prototype.shaderSource;
      prototype.shaderSource = function (shader, source) {
        if (source.includes('hullExclusionActive')) window.waterShaders.push(source);
        return shaderSource.call(this, shader, source);
      };
    });
    await page.goto('./');
    const scene = page.locator('#scene');
    await expect(scene).toHaveAttribute('data-render-pending', 'false', { timeout: 90000 });
    await expect(scene).toHaveAttribute('data-quality', 'balanced');
    await expect(scene).toHaveAttribute('data-pixel-ratio', '1.75');
    await expect(scene).toHaveAttribute('data-water-reflections', 'false');
    const resolution = await scene.locator(':scope > canvas').evaluate((canvas) => ({
      width: canvas.width,
      height: canvas.height,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    }));
    expect(resolution.width).toBe(Math.floor(resolution.cssWidth * 1.75));
    expect(resolution.height).toBe(Math.floor(resolution.cssHeight * 1.75));
    const shaders = await page.evaluate(() => window.waterShaders);
    expect(shaders.length).toBeGreaterThan(0);
    expect(shaders.every((source) => !source.includes('mirrorSampler'))).toBe(true);

    await page.locator('[data-section="explore"]').tap();
    const before = Number(await scene.getAttribute('data-visual-time'));
    await page.locator('#cover-start-free').tap();
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-running');
    await expect
      .poll(async () => Number(await scene.getAttribute('data-visual-time')))
      .toBeGreaterThan(before);
    await page.locator('#play').tap();
    await expect(scene).toHaveAttribute('data-render-pending', 'false', { timeout: 90000 });
    await expect(scene).toHaveAttribute('data-water-reflections', 'false');
    expect(errors).toEqual([]);
  });
});
