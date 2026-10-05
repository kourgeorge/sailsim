import { test, expect } from '@playwright/test';
import { challengesUI } from '../../src/i18n/challenges.js';

async function fallback(context) {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
}

test('the worked example, zoom, questions and direct exercise link work in all six languages', async ({
  page,
  context,
}, testInfo) => {
  await fallback(context);
  await context.addInitScript(() => {
    localStorage.setItem(
      'sail-training-v1',
      JSON.stringify({ version: 1, selected: 'sail-17', records: {} }),
    );
    sessionStorage.setItem('sail-reader-sail-17', '5');
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const lang of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
    await page.goto(`./?lang=${lang}`);
    await page.locator('button[data-mode=learn]').click();
    await page.locator('#lesson-briefing').click();
    await expect(page.locator('#lesson-reader [data-figure=faster-than-wind]')).toBeVisible();
    await expect(page.locator('.reader-concept')).toContainText('30');
    await page.locator('#reader-enlarge').click();
    await expect(page.locator('#modal [data-figure=faster-than-wind]')).toBeVisible();
    await page.locator('#close-modal').click();
    await page.screenshot({ path: testInfo.outputPath(`worked-example-${lang}.png`) });
    await page.locator('[data-reader-section=question]').click();
    // Both original questions and the two additions must still be answerable.
    for (const answer of [1, 0, 1, 2]) {
      await page.locator('.knowledge-question input').nth(answer).check();
      await page.locator('#knowledge-form button[type=submit]').click();
      await expect(page.locator('.answer-explanation.correct')).toBeVisible();
      await page.locator('#reader-next').click();
    }
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-17'].knowledge,
        ),
      )
      .toBe(true);
    await page.locator('#reader-wind-exercise').click();
    await expect(page.locator('#cover-challenge-briefing h2')).toHaveText(
      challengesUI[lang]['Apparent Wind Lab'],
    );
    await expect(page.locator('[data-sailing-challenge=apparent-wind-lab]')).toHaveAttribute(
      'aria-current',
      'true',
    );
  }
  expect(errors).toEqual([]);
});

test('the live wind exercise records three real sailing observations through normal controls', async ({
  page,
  context,
}, testInfo) => {
  await fallback(context);
  await page.clock.install();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('[data-mode=challenge]').click();
  await page.locator('[data-sailing-challenge=apparent-wind-lab]').click();
  await page.locator('#challenge-start').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  const record = page.locator('#challenge-record-wind');
  await page.clock.runFor(5000);
  await expect(page.locator('#challenge-hud')).toHaveAttribute('data-stage', '0');
  await expect(record).toBeEnabled();
  await record.click();
  await expect(record).toBeDisabled();
  await page.locator('#cockpit-main-hoist').fill('100');
  await page.locator('#cockpit-jib-hoist').fill('100');
  let previous = 90;
  for (const stage of [1, 2]) {
    for (let second = 0; second < 300; second++) {
      const heading = Number(await page.locator('#heading').textContent());
      const yaw = ((heading - previous + 540) % 360) - 180;
      const error = (((stage === 1 ? 90 : 155) - heading + 540) % 360) - 180;
      await page
        .locator('#rudder')
        .fill(String(Math.round(Math.max(-25, Math.min(25, error * 1.5 - yaw * 4)))));
      const suggested = Number((await page.locator('#ideal-trim').textContent()).match(/\d+/)[0]);
      await page.locator('#trim').fill(String(suggested));
      await page.locator('#cockpit-jib-sheet').fill(String(suggested));
      previous = heading;
      await page.clock.runFor(1000);
      if (await record.isEnabled()) break;
    }
    await expect(record).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath(`wind-stage-${stage}.png`) });
    await record.click();
  }
  await expect(page.locator('.challenge-results')).toBeVisible();
  await expect(page.locator('.wind-observations tbody tr')).toHaveCount(3);
  await expect(page.locator('.challenge-result-score')).not.toHaveAttribute('data-medal', 'none');
  await page.screenshot({ path: testInfo.outputPath('wind-comparison.png') });
  expect(errors).toEqual([]);
});

test('the wind exercise has readable translated controls on mobile at 200% text', async ({
  page,
  context,
}, testInfo) => {
  await fallback(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await context.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  for (const lang of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
    await page.goto(`./?lang=${lang}`);
    await page.locator('[data-section=challenge]').click();
    await page.locator('#cover-browser-title').click();
    await page.locator('[data-sailing-challenge=apparent-wind-lab]').click();
    await page.locator('#challenge-start').click();
    await expect(page.locator('#challenge-hud')).toBeVisible();
    await expect(page.locator('#challenge-record-wind')).toHaveText(
      challengesUI[lang]['Record wind reading'],
    );
    await page.locator('#challenge-record-wind').scrollIntoViewIfNeeded();
    expect(
      await page.locator('#challenge-hud').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`wind-mobile-${lang}.png`) });
  }
});

test('the wind exercise launches the actual 3D yacht with live wind instruments', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  await page.locator('button[data-mode=challenge]').click();
  await page.locator('[data-sailing-challenge=apparent-wind-lab]').click();
  await page.locator('#challenge-start').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active', { timeout: 90000 });
  await expect(page.locator('#scene')).toHaveAttribute('data-frames', /[1-9]/);
  await expect(page.locator('#challenge-record-wind')).toBeEnabled();
  await page.locator('#challenge-record-wind').click();
  await page.locator('#cockpit-main-hoist').fill('100');
  await page.locator('#cockpit-jib-hoist').fill('100');
  await page.locator('#trim').fill('50');
  await page.locator('#cockpit-jib-sheet').fill('50');
  // Software rendering advances less simulation time per wall-clock second.
  // The separate control-driven test completes all three recorded observations;
  // here verify that the real 3D scene and instruments respond to sailing.
  await expect
    .poll(() => page.locator('#speed').textContent().then(Number), { timeout: 90000 })
    .toBeGreaterThan(2);
  await expect
    .poll(() =>
      page.locator('[data-dashboard-value=apparent-speed]').textContent().then(parseFloat),
    )
    .toBeGreaterThan(10);
  await expect
    .poll(async () => {
      const angle = await page.locator('[data-dashboard-value=apparent-angle]').textContent();
      return Number(angle.match(/\d+/)[0]);
    })
    .toBeLessThan(80);
  await page.locator('#play').click();
  await page.screenshot({ path: testInfo.outputPath('wind-live-3d.png') });
});
