import { test, expect } from '@playwright/test';

test('catamaran lesson launches twin-engine controls and preserves a real pivot attempt', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('button[data-mode="learn"]').click();
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="51"]').click();
  await page.locator('#lesson-briefing').click();
  await expect(page.locator('.reader-heading h1')).toHaveText(
    'Handle a catamaran with twin engines',
  );
  await expect(page.locator('.teaching-figure')).toBeVisible();
  await expect(page.locator('[data-arrow-kind="port-ahead"]')).toHaveCount(1);
  await page.locator('#reader-close').click();
  await page.locator('#practice-start').click();
  await expect(page.locator('.practice-briefing-goals li')).toHaveCount(3);
  await page.locator('#practice-launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await expect(page.locator('#cockpit-portThrottle')).toBeVisible();
  await expect(page.locator('#cockpit-starboardThrottle')).toBeVisible();
  await page.locator('#cockpit-portThrottle').fill('0.4');
  await page.locator('#cockpit-starboardThrottle').fill('-0.6');
  await expect
    .poll(async () => Number(await page.locator('#heading').textContent()))
    .toBeGreaterThan(5);
  await page.locator('.simulator').focus();
  await page.keyboard.press('n');
  await expect(page.locator('#cockpit-portThrottle')).toHaveValue('0');
  await expect(page.locator('#cockpit-starboardThrottle')).toHaveValue('0');
  await page.locator('#play').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-tab-helm').click();
  await expect(page.locator('#cockpit-portThrottle')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#cockpit-starboardThrottle')).toBeInViewport({ ratio: 1 });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#practice-end').click();
  await expect(page.locator('.practice-debrief')).toBeVisible();
  // Progress saves under an async storage lock; wait for the debrief's record to land.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-52'].lastPracticeResult
            ?.status,
      ),
    )
    .toBe('failed');
  const record = await page.evaluate(
    () => JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-52'],
  );
  expect(record.attempts).toBe(1);
  expect(record.practice).toBe(false);
  expect(record.lastPracticeResult.status).toBe('failed');
  expect(errors).toEqual([]);
});
