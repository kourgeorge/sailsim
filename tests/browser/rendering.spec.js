import { test, expect } from '@playwright/test';

test('paused rendering stops after settling and wakes for camera, controls, resize and playback', async ({
  page,
}) => {
  test.setTimeout(300000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  const scene = page.locator('#scene');
  const frames = async () => Number(await scene.getAttribute('data-frames'));
  const settle = () =>
    expect(scene).toHaveAttribute('data-render-pending', 'false', { timeout: 90000 });
  await expect.poll(frames, { timeout: 90000 }).toBeGreaterThan(0);
  await settle();
  const initialFrames = await frames();
  await page.waitForTimeout(600);
  expect(await frames()).toBe(initialFrames);

  await page.locator('[data-mode="explore"]').click();
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
