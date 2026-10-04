import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url =
  process.argv.find((argument) => /^https?:/.test(argument)) ||
  process.env.SAIL_URL ||
  'http://127.0.0.1:5214';
await mkdir('artifacts/catamaran', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
async function compactEngines(page) {
  const inputs = page.locator('.twin-engines input');
  await expect(inputs).toHaveCount(2);
  const [port, starboard] = await Promise.all([
    inputs.nth(0).boundingBox(),
    inputs.nth(1).boundingBox(),
  ]);
  assert.ok(port && starboard, 'Both engine sliders are visible');
  assert.ok(Math.abs(port.y - starboard.y) < 1, 'Engine sliders share one row');
  assert.ok(Math.abs(port.x - starboard.x) >= port.width, 'Engine sliders do not overlap');
  assert.equal(
    await page
      .locator('.twin-engines')
      .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    true,
    'Twin controls fit their panel',
  );
  await expect(page.locator('.twin-engines small')).toHaveCount(0);
}
async function monohullOnly(page) {
  await expect(page.locator('#scene')).toHaveAttribute('data-vessel', 'monohull');
  await expect(page.locator('#cover-vessel')).toBeHidden();
  await expect(page.locator('.twin-engines')).toBeHidden();
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  if (!process.argv.includes('--app-only')) {
    await page.route('**/__catamaran', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><style>body{margin:0;background:#163743}#scene{width:1440px;height:1000px}</style><div id="scene"></div>',
      }),
    );
    await page.goto(`${url}/__catamaran`);
    await page.evaluate(async () => {
      const { createScene } = await import('/src/scene.js'),
        { initialState, refreshDerived } = await import('/src/physics.js');
      const scene = createScene(document.querySelector('#scene'), { vesselId: 'catamaran' });
      const state = initialState('haven', 'catamaran');
      Object.assign(state, { speed: 5, heading: 35, mainSheet: 25, jibSheet: 25 });
      refreshDerived(state);
      window.catamaran = { scene, state };
    });
    for (const view of ['chase', 'aerial', 'deck', 'helm']) {
      await page.evaluate(async (view) => {
        const { scene, state } = window.catamaran;
        scene.setView(view);
        for (let i = 0; i < 180; i++) {
          scene.render(state, 10);
          if (document.querySelector('#scene').dataset.renderPending === 'false') break;
          await new Promise(requestAnimationFrame);
        }
      }, view);
      await page.screenshot({ path: `artifacts/catamaran/${view}.png`, timeout: 120000 });
      assert.equal(await page.locator('#scene').getAttribute('data-vessel'), 'catamaran');
    }
    await page.evaluate(() => window.catamaran.scene.dispose());
  }
  await page.goto(url);
  await page.locator('[data-mode="explore"]').click();
  await page.locator('#cover-vessel').click();
  await page.locator('#vessel-option-catamaran').click();
  await expect(page.locator('#cover-vessel-specs')).toContainText('6.6');
  await page.locator('#cover-start-free').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-vessel', 'catamaran');
  await page.locator('#play').click();
  await page.evaluate(() => {
    for (const [id, value] of [
      ['cockpit-portThrottle', '.6'],
      ['cockpit-starboardThrottle', '-.8'],
    ]) {
      const input = document.getElementById(id);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await expect(page.locator('#cockpit-portThrottle')).toHaveValue('0.6');
  await expect(page.locator('#cockpit-starboardThrottle')).toHaveValue('-0.8');
  await page.evaluate(() => document.querySelector('#engine-neutral').click());
  await expect(page.locator('#cockpit-portThrottle')).toHaveValue('0');
  await expect(page.locator('#cockpit-starboardThrottle')).toHaveValue('0');
  await compactEngines(page);
  await page.screenshot({ path: 'artifacts/catamaran/desktop.png' });
  await page.locator('#session-restart').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-vessel', 'catamaran');
  await page.locator('#play').click();
  // Mobile selection retains the ship and keeps both controls inside the drawer.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('#session-exit').click();
  await expect(page.locator('#cover-vessel')).toHaveAttribute('data-vessel', 'catamaran');
  await page.screenshot({ path: 'artifacts/catamaran/mobile-choice.png' });
  await page.locator('#cover-start-free').click();
  await page.locator('#play').click();
  await page.screenshot({ path: 'artifacts/catamaran/mobile.png' });
  await page.locator('#mobile-tab-helm').click();
  await expect(page.locator('#cockpit-portThrottle')).toBeVisible();
  await expect(page.locator('#cockpit-starboardThrottle')).toBeVisible();
  await page.locator('#cockpit-portThrottle').fill('0.5');
  await page.locator('#cockpit-starboardThrottle').fill('-0.5');
  await expect(page.locator('#engine-throttle-value')).toHaveText('Independent engines');
  await compactEngines(page);
  await page.screenshot({ path: 'artifacts/catamaran/mobile-engines.png' });
  await page.locator('#engine-neutral').click();
  await expect(page.locator('#cockpit-portThrottle')).toHaveValue('0');
  await expect(page.locator('#cockpit-starboardThrottle')).toHaveValue('0');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  // A fresh page retains the free-sailing preference while lessons use the original yacht.
  await page.reload();
  await monohullOnly(page);
  await page.locator('[data-section="explore"]').click();
  await expect(page.locator('#cover-vessel')).toHaveAttribute('data-vessel', 'catamaran');
  await page.locator('#cover-vessel').click();
  await page.locator('#vessel-option-monohull').click();
  await page.locator('#cover-start-free').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-vessel', 'monohull');
  await page.goto(`${url}/?lang=he`);
  await page.locator('[data-section="explore"]').click();
  await page.locator('#cover-vessel').click();
  await page.locator('#vessel-option-catamaran').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.locator('#cover-start-free').click();
  await page.locator('#play').click();
  await page.locator('#mobile-tab-helm').click();
  await expect(page.locator('#cockpit-portThrottle')).toHaveAttribute('aria-label', 'מנוע שמאל');
  await compactEngines(page);
  await page.screenshot({ path: 'artifacts/catamaran/mobile-hebrew-engines.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.evaluate(() => localStorage.setItem('sail-text-size', '200'));
  await page.reload();
  await page.locator('button[data-section="explore"]').click();
  await page.locator('#cover-start-free').click();
  await page.locator('#play').click();
  await page.locator('#mobile-tab-helm').click();
  await compactEngines(page);
  await page.screenshot({ path: 'artifacts/catamaran/mobile-hebrew-large-engines.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  // Enter every authored activity after a catamaran voyage. The free-sailing
  // preference survives, but none of these sessions can inherit its vessel.
  await page.evaluate(() => localStorage.removeItem('sail-text-size'));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${url}/?lang=en`);
  const navigate = async (section) => {
    if ((await page.locator('body').getAttribute('data-session')) === 'active')
      await page.locator('#session-exit').click();
    await page.locator(`[data-mode="${section}"]`).click();
  };
  const startCatamaran = async () => {
    await navigate('explore');
    await expect(page.locator('#cover-vessel')).toHaveAttribute('data-vessel', 'catamaran');
    await page.locator('#cover-start-free').click();
    await expect(page.locator('#scene')).toHaveAttribute('data-vessel', 'catamaran');
  };
  await startCatamaran();
  await navigate('learn');
  await monohullOnly(page);
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="8"]').click();
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await monohullOnly(page);
  for (const [choice, start] of [
    ['[data-sailing-challenge="rescue-run"]', '#challenge-start'],
    ['[data-race-course="harbor-sprint"]', '#race-start'],
    ['[data-cover-drill="engine-stop"]', '#begin-drill'],
    ['[data-cover-buoys]', '#cover-start-buoys'],
  ]) {
    await startCatamaran();
    await navigate('challenge');
    await monohullOnly(page);
    await page.locator(choice).click();
    await page.locator(start).click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await monohullOnly(page);
  }
  // Chromium can block Vite's development-only HMR socket on loopback. Keep
  // application/renderer failures fatal while reporting that known tooling noise.
  const applicationErrors = errors.filter(
    (message) =>
      !message.includes('[vite] failed to connect to websocket') &&
      !(
        /WebSocket connection/.test(message) &&
        message.includes('ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS')
      ),
  );
  if (errors.length > applicationErrors.length)
    console.log(
      'Vite HMR socket blocked by browser loopback policy; HTTP application and rendering checks completed.',
    );
  assert.deepEqual(applicationErrors, [], 'No rendering or application errors');
  console.log(
    `Catamaran browser checks passed: ${process.argv.includes('--app-only') ? 'production app' : 'four camera views'}, selection, compact independent engines, neutral, restart, mobile, Hebrew, 200% text, preference and free-sailing-only availability.`,
  );
} finally {
  await browser.close();
}
