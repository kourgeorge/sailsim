import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
const errors = [];
await mkdir('artifacts/world-destinations', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5199/');
  await page.locator('[data-mode=explore]').click();
  await page.locator('[data-atlas-location=santorini]').click();
  await page.screenshot({ path: 'artifacts/world-destinations/cover-desktop.png' });
  console.log('Setup bounds', await page.locator('.sailing-setup').boundingBox());
  console.log(
    'Cover',
    await page.locator('#cover-location-name').textContent(),
    'pins',
    await page.locator('[data-atlas-location]').count(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/world-destinations/cover-mobile.png' });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.locator('#cover-start-free').click();
  await page.waitForFunction(() => document.querySelector('#scene canvas'));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'artifacts/world-destinations/santorini-sailing.png' });
  console.log('Scene', await page.locator('#scene').evaluate((n) => ({ ...n.dataset })));
  console.log('Errors', errors);
  if (errors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
