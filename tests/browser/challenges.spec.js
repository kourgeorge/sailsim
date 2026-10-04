import { test, expect } from '@playwright/test';
import { CHALLENGES } from '../../src/challenges/catalog.js';
import { challengesUI } from '../../src/i18n/challenges.js';

async function fallback(context) {
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
}

test('five challenges launch, pause, restart and end with a recorded path without disrupting races', async ({
  page,
  context,
}, testInfo) => {
  await fallback(context);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('[data-mode=challenge]').click();
  await expect(page.locator('[data-sailing-challenge]')).toHaveCount(5);
  await expect(page.locator('[data-race-course]')).toHaveCount(3);
  for (const definition of CHALLENGES) {
    await page.locator(`[data-sailing-challenge="${definition.id}"]`).click();
    await expect(page.locator('#cover-challenge-briefing h2')).toHaveText(definition.name);
    await expect(page.locator('.challenge-rule')).toHaveText(definition.instructions);
    if (definition.kind === 'treasure')
      await page.screenshot({ path: testInfo.outputPath('treasure-entry.png') });
    await page.locator('#challenge-start').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await expect(page.locator('#challenge-hud')).toHaveAttribute(
      'data-challenge-id',
      definition.id,
    );
    await expect(page.locator('#challenge-hud')).toHaveAttribute(
      'data-challenge-status',
      'running',
    );
    await expect(page.locator('#conditions')).toBeHidden();
    await expect(page.locator('#sound-settings')).toBeHidden();
    if (definition.engine) await expect(page.locator('.cockpit-group-engine')).toBeVisible();
    else {
      await expect(page.locator('.cockpit-group-engine')).toBeHidden();
      await page.keyboard.press('KeyW');
      await expect(page.locator('#engine-throttle')).toHaveValue('0');
    }
    await page.locator('#play').click();
    const clock = await page.locator('#challenge-clock').textContent();
    const target = await page.locator('#challenge-navigation').textContent();
    await page.waitForTimeout(350);
    await expect(page.locator('#challenge-clock')).toHaveText(clock);
    await expect(page.locator('#challenge-navigation')).toHaveText(target);
    if (definition.kind === 'treasure') {
      await expect(page.locator('#challenge-navigation')).toBeEmpty();
      await page.locator('#challenge-reveal').click();
      await expect(page.locator('#challenge-reveal')).toBeDisabled();
      await expect(page.locator('#challenge-navigation')).not.toBeEmpty();
    }
    await page.locator('#session-restart').click();
    await expect(page.locator('#challenge-clock')).toContainText('0:00 /');
    if (definition.kind === 'treasure')
      await expect(page.locator('#challenge-reveal')).toBeEnabled();
    await page.locator('#challenge-options').click();
    const pausedTime = await page.locator('#challenge-clock').textContent();
    await page.waitForTimeout(350);
    await expect(page.locator('#challenge-clock')).toHaveText(pausedTime);
    await page.locator('#challenge-end').click();
    await expect(page.locator('.challenge-results')).toBeVisible();
    await expect(page.locator('.challenge-result-score')).toHaveAttribute('data-medal', 'none');
    await expect(page.locator('#adventure-track canvas')).toHaveAttribute(
      'data-track-points',
      /[1-9]/,
    );
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    await page.locator('#adventure-library').click();
  }
  await page.locator('[data-race-course=harbor-sprint]').click();
  await page.locator('#race-start').click();
  await expect(page.locator('#challenge-hud')).toBeHidden();
  await expect(page.locator('#race-hud')).toBeVisible();
  await page.locator('#session-exit').click();
  await page.locator('#cover-review').click();
  await page.locator('#race-other').click();
  await expect(page.locator('[data-section-page=challenge]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('challenge records survive reload and the hub handles corrupt optional records', async ({
  page,
  context,
}) => {
  await fallback(context);
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.setItem(
      'sail-challenge-best-v1:rescue-run',
      JSON.stringify({ score: 93, elapsed: 72 }),
    );
    localStorage.setItem('sail-challenge-best-v1:treasure-chart', 'broken');
  });
  await page.reload();
  await page.locator('[data-mode=challenge]').click();
  await expect(page.locator('[data-sailing-challenge=rescue-run]')).toContainText('93/100 · 1:12');
  await expect(page.locator('[data-sailing-challenge=treasure-chart]')).toContainText(
    'Set your first record',
  );
});

test('all locales fit 200% mobile text, with an accessible live objective and simulation menu', async ({
  page,
  context,
}) => {
  await fallback(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await context.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  for (const language of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
    await page.goto(`./?lang=${language}`);
    await expect(page.locator('html')).toHaveAttribute('data-text-size', '200');
    await page.locator('[data-section=challenge]').click();
    await expect(page.locator('[data-sailing-challenge]')).toHaveCount(5);
    await expect(page.locator('[data-sailing-challenge=anchor-bullseye] strong')).toHaveText(
      challengesUI[language]['Anchor Bullseye'],
    );
    await expect(page.locator('#section-cover')).toBeVisible();
    expect(
      await page.locator('#section-cover').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await page.locator('#cover-browser-title').click();
    await page.locator('[data-sailing-challenge=anchor-bullseye]').click();
    await page.locator('#challenge-start').click();
    await expect(page.locator('#challenge-hud')).toBeVisible();
    await expect(page.locator('#challenge-live-goal')).toContainText(
      challengesUI[language]['Continuous hold'],
    );
    await expect
      .poll(() =>
        page.locator('#challenge-hud').evaluate((el) => {
          const box = el.getBoundingClientRect();
          const controls = document.querySelector('.simulation-console').getBoundingClientRect();
          const compass = document.querySelector('#scene-compass').getBoundingClientRect();
          return {
            withinViewport: box.left >= 0 && box.right <= innerWidth + 1,
            aboveControls: box.bottom < controls.top,
            clearOfCompass: !(
              box.left < compass.right &&
              box.right > compass.left &&
              box.top < compass.bottom &&
              box.bottom > compass.top
            ),
            noOverflow: el.scrollWidth <= el.clientWidth + 1,
          };
        }),
      )
      .toEqual({
        withinViewport: true,
        aboveControls: true,
        clearOfCompass: true,
        noOverflow: true,
      });
    await page.locator('#challenge-live-details summary').click();
    await expect(page.locator('#challenge-requirements')).toBeVisible();
    expect(
      await page.locator('#challenge-hud').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    if (language === 'he') await page.screenshot({ path: 'artifacts/challenges/mobile-he.png' });
    await page.locator('#mobile-menu-toggle').click();
    await page.locator('#session-exit').click();
    await page.locator('#cover-review').click();
    await expect(page.locator('.challenge-results')).toBeVisible();
  }
});

test('rescue marker and challenge cues render, pause and clear from the actual 3D scene', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('[data-mode=challenge]').click();
  await page.screenshot({ path: 'artifacts/challenges/catalog.png' });
  await page.locator('[data-sailing-challenge=rescue-run]').click();
  await page.locator('#challenge-start').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await expect(page.locator('#scene')).toHaveAttribute('data-rescue-marker', 'true');
  await expect(page.locator('#scene')).toHaveAttribute('data-training-cues', 'true');
  await page.locator('#play').click();
  await page.screenshot({ path: 'artifacts/challenges/rescue-desktop.png' });
  const time = await page.locator('#scene').getAttribute('data-visual-time');
  await page.waitForTimeout(350);
  await expect(page.locator('#scene')).toHaveAttribute('data-visual-time', time);
  await page.locator('#chart-toggle').click();
  await expect(page.locator('#large-chart')).toHaveAttribute('data-vessel-visible', 'true');
  await page.screenshot({ path: 'artifacts/challenges/rescue-chart.png' });
  await page.locator('#close-modal').click();
  await page.locator('#session-exit').click();
  await page.locator('#cover-review').click();
  await page.locator('#adventure-library').click();
  await expect(page.locator('[data-section-page=challenge]')).toBeVisible();
  await page.locator('[data-mode=explore]').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-rescue-marker', 'false');
  await expect(page.locator('#challenge-hud')).toBeHidden();
  expect(errors).toEqual([]);
});
