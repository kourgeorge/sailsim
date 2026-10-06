import { chromium, expect as baseExpect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const expect = baseExpect.configure({ timeout: 60000 });
const url = process.env.SAIL_URL || 'http://127.0.0.1:5187';
await mkdir('artifacts/night-navigation', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
let page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(60000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
let scene = page.locator('#scene');
const time = () => scene.evaluate((node) => Number(node.dataset.visualTime));
try {
  await page.goto(`${url}/?lang=en`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'ready');
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="41"]').click();
  await expect(page.locator('#lesson-training-type')).toHaveText('Interactive seamanship');
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="52"]').click();
  await expect(page.locator('#scene-heading')).toHaveText('Navigate a night approach');
  await expect(page.locator('#lesson-training-type')).toHaveText('Live boat simulation');
  await page.locator('#practice-start').click();
  await expect(page.locator('#practice-briefing')).toContainText('Night');
  await page.locator('#practice-launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
  await expect(scene).toHaveAttribute('data-time-of-day', 'night');
  await page.locator('#chart-toggle').click();
  await page.screenshot({ path: 'artifacts/night-navigation/chart.png', fullPage: true });
  await page.locator('#close-modal').click();
  await expect(page.locator('#practice-goal-count-value')).toHaveText('1 / 4');
  if ((await page.locator('body').getAttribute('data-activity')) === 'training-paused')
    await page.locator('#play').click();
  await page.locator('#engine-throttle').fill('0.1');
  const start = await time();
  await page.waitForFunction(
    (start) => Number(document.querySelector('#scene').dataset.visualTime) > start + 8,
    start,
    { timeout: 120000 },
  );
  await expect(page.locator('[data-requirement="signed-speed"]')).toHaveAttribute(
    'data-met',
    'true',
  );
  const first = await scene.getAttribute('data-lit-beacons');
  await page.waitForFunction(
    (first) => document.querySelector('#scene').dataset.litBeacons !== first,
    first,
    { timeout: 60000 },
  );
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-paused');
  const paused = await time(),
    lights = await scene.getAttribute('data-lit-beacons');
  await page.waitForTimeout(400);
  assert.equal(await time(), paused);
  assert.equal(await scene.getAttribute('data-lit-beacons'), lights);
  await page.screenshot({ path: 'artifacts/night-navigation/helm.png', fullPage: true });
  await page.locator('[data-camera="chase"]').click();
  await expect(scene).toHaveAttribute('data-camera', 'chase');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'artifacts/night-navigation/chase.png', fullPage: true });
  await page.locator('#session-exit').click();
  await page.locator('button[data-mode="explore"]').click();
  await page.locator('#cover-start-free').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-running');
  await page.locator('#play').click();
  await expect(scene).toHaveAttribute('data-time-of-day', 'day');
  await page.close();
  page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  });
  page.setDefaultTimeout(60000);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  scene = page.locator('#scene');
  await page.addInitScript(() =>
    localStorage.setItem(
      'sail-training-v1',
      JSON.stringify({ version: 1, selected: 'sail-53', records: {} }),
    ),
  );
  await page.goto(`${url}/?lang=he`, { waitUntil: 'domcontentloaded' });
  await page.locator('#practice-start').click();
  await expect(page.locator('#practice-briefing')).toContainText('לילה');
  await page.locator('#practice-launch').click();
  await expect(scene).toHaveAttribute('data-time-of-day', 'night');
  await expect(scene).toHaveAttribute('data-water-reflections', 'false');
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2),
    false,
  );
  await page.screenshot({ path: 'artifacts/night-navigation/mobile-he.png', fullPage: true });
  assert.deepEqual(errors, []);
  await writeFile(
    'artifacts/night-navigation/results.json',
    JSON.stringify(
      {
        passed: true,
        originalTheoryUnchanged: true,
        nightPractice: true,
        chartCheckpoint: true,
        engineControls: true,
        flashesPause: true,
        daylightRestored: true,
        mobileHebrew: true,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    'Night navigation: separate lesson, chart, engine controls, flashing lights, pause, daylight restoration and mobile Hebrew passed.',
  );
} catch (error) {
  await page
    .screenshot({ path: 'artifacts/night-navigation/failure.png', fullPage: true })
    .catch(() => {});
  throw error;
} finally {
  await browser.close();
}
