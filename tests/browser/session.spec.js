import { test, expect } from '@playwright/test';
import { sessionUI } from '../../src/i18n/session.js';

async function selectLesson(page, index) {
  await page.locator('button[data-mode=learn]').click();
  await page.locator(`[data-library-lesson="${index}"]`).click();
}

async function expectSession(page) {
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await expect(page.locator('#location-select')).toBeHidden();
  await expect(page.locator('.scene-title')).toBeHidden();
  await expect(page.locator('#session-exit')).toBeInViewport({ ratio: 1 });
  await expect(page.locator('#session-restart')).toBeInViewport({ ratio: 1 });
  expect(
    await page.locator('.simulator').evaluate((node) => {
      const box = node.getBoundingClientRect();
      return [box.x, box.y, box.width, box.height];
    }),
  ).toEqual([0, 0, page.viewportSize().width, page.viewportSize().height]);
}

test.describe('session lifecycle', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
      };
    });
  });

  test('lesson covers, briefings, restart, study, and exit have distinct layouts and preserve results', async ({
    page,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    await selectLesson(page, 8);
    await expect(page.locator('#lesson-cover .scene-title')).toBeVisible();
    await expect(page.locator('.simulation-console')).toBeHidden();
    await expect(page.locator('#course-library')).toHaveCount(0);
    await expect(page.locator('#lesson-briefing')).toBeVisible();
    await page.locator('#practice-start').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    await page.locator('#practice-launch').click();
    await expectSession(page);
    await expect(page.locator('.topbar')).toBeHidden();
    await expect(page.locator('.session-mission #practice-live-score')).toBeVisible();
    expect(
      await page.locator('.session-mission .lesson-card').evaluate((node) => {
        const box = node.getBoundingClientRect();
        return box.width >= 280 && box.y < 100 && node.scrollWidth <= node.clientWidth + 1;
      }),
    ).toBe(true);
    await page.locator('#play').click();
    await expectSession(page);
    await page.locator('#session-restart').click();
    await expectSession(page);
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-09'].attempts,
        ),
      )
      .toBe(2);
    await page.locator('#lesson-briefing').click();
    await expect(page.locator('#lesson-reader')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    await expect(page.locator('.topbar')).toBeVisible();
    await page.locator('#reader-close').click();
    await expectSession(page);
    await page.locator('#session-exit').click();
    await expect(page.locator('.practice-debrief')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    await page.locator('#close-modal').click();
    await expect(page.locator('.topbar')).toBeVisible();
    await expect(page.locator('.simulation-console')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('free sailing, engine drills, buoy courses, and races share exit and restart', async ({
    page,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    await page.locator('button[data-mode=explore]').click();
    await page.locator('#location-select').click();
    await page.locator('[data-location=shelter]').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    await page.locator('#conditions').click();
    await page.locator('#wind-speed').fill('18');
    await page.locator('#close-modal').click();
    await page.locator('#play').click();
    await expectSession(page);
    await page.locator('#rudder').fill('20');
    await page.locator('#play').click();
    await expectSession(page);
    await page.locator('#session-restart').click();
    await expect(page.locator('#rudder')).toHaveValue('0');
    await expect(page.locator('#weather-wind')).toContainText('18 kn');
    await expect(page.locator('#location-title')).toHaveText('Shelter Bay');
    await page.locator('#session-exit').click();
    await expect(page.locator('#location-select')).toBeVisible();
    await page.locator('button[data-mode=challenge]').click();
    await page.locator('#race-engine-drills').click();
    await page.locator('[data-drill]').first().click();
    await page.locator('#begin-drill').click();
    await expectSession(page);
    await page.locator('#session-restart').click();
    await expectSession(page);
    await page.locator('#session-exit').click();
    await expect(page.locator('.maneuver-review')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    await page.locator('#lab-library').click();
    await page.locator('#lab-buoys').click();
    await page.locator('#play').click();
    await expectSession(page);
    await expect(page.locator('#objective-text')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#mobile-lesson-toggle')).toContainText('buoy 1 of 3');
    await page.locator('#mobile-lesson-toggle').click();
    await expect(page.locator('#objective-text')).toBeVisible();
    await page.locator('#mobile-lessons .mobile-sheet-close').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#session-restart').click();
    await expect(page.locator('#objective-text')).toContainText('buoy 1 of 3');
    await page.locator('#session-exit').click();
    await page.locator('button[data-mode=challenge]').click();
    await page.locator('[data-race-course]').first().click();
    await page.locator('#race-start').click();
    await expectSession(page);
    await page.locator('#session-restart').click();
    await expect(page.locator('#race-clock')).toHaveText('0:00');
    await page.locator('#session-exit').click();
    await expect(page.locator('#race-hud')).toBeHidden();
    await expect(page.locator('.race-library')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
    expect(errors).toEqual([]);
  });

  test('mobile covers and session controls fit all six languages at 200% text', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
    for (const lang of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
      await page.goto(`./?lang=${lang}`);
      await expect(page.locator('.simulation-console')).toBeHidden();
      await expect(page.locator('#practice-start')).toBeVisible();
      await page.locator('#mobile-menu-toggle').click();
      await page.locator('button[data-mode=learn]').click();
      await page.locator('[data-library-lesson="8"]').click();
      await page.locator('#practice-start').click();
      await page.locator('#practice-launch').click();
      await expectSession(page);
      await expect(page.locator('#session-exit')).toHaveAccessibleName(
        sessionUI[lang]['Exit simulation'],
      );
      await expect(page.locator('#session-restart')).toHaveAccessibleName(
        sessionUI[lang]['Restart simulation'],
      );
      await page.locator('#play').click();
      await expectSession(page);
      await expect(page.locator('#mobile-menu-toggle')).toBeHidden();
      await expect(page.locator('#mobile-menu')).toBeHidden();
      for (const selector of [
        '#location-select',
        '#language-select',
        '#help',
        '#sound-settings',
        '#conditions',
      ])
        await expect(page.locator(selector)).toBeHidden();
      await expect(page.locator('#mobile-camera')).toBeHidden();
      const cameraButtons = page.locator('.mobile-session-tools [data-camera]');
      await expect(cameraButtons).toHaveCount(3);
      await expect(page.locator('.mobile-session-tools #systems-toggle')).toBeInViewport({
        ratio: 1,
      });
      for (const view of ['chase', 'helm', 'deck']) {
        const button = page.locator(`.mobile-session-tools [data-camera=${view}]`);
        await expect(button).toBeInViewport({ ratio: 1 });
        await expect(button).toHaveAccessibleName(/\S/);
        await button.click();
        await expect(page.locator('.simulator')).toHaveAttribute('data-view', view);
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        await expect(
          page.locator('.mobile-session-tools [data-camera][aria-pressed=true]'),
        ).toHaveCount(1);
      }
      await page.locator('#systems-toggle').click();
      await expect(page.locator('#systems-drawer')).toBeVisible();
      await page.locator('#systems-close').click();
      await expect(page.locator('#systems-toggle')).toBeFocused();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await expect(page.locator('.view-controls #systems-toggle')).toBeVisible();
      await expect(page.locator('#mobile-camera')).toBeHidden();
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('.mobile-session-tools [data-camera=deck]')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await page.locator('#session-exit').click();
      await page.locator('#close-modal').click();
      await expect(page.locator('#mobile-menu-toggle')).toBeVisible();
      await page.locator('#mobile-menu-toggle').click();
      await expect(page.locator('#language-select')).toBeVisible();
      await expect(page.locator('#mobile-menu #mobile-camera')).toHaveValue('deck');
      await page.locator('#mobile-menu .mobile-sheet-close').click();
      await expect(page.locator('.simulation-console')).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
});

test('the rendered scene fills the session and restores the lesson cover after finishing', async ({
  page,
}, testInfo) => {
  test.setTimeout(300000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(page.locator('#scene')).toHaveAttribute('data-render-pending', 'false', {
    timeout: 120000,
  });
  await selectLesson(page, 3);
  await page.screenshot({ path: 'artifacts/session/lesson-cover.png' });
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expectSession(page);
  await page.locator('#play').click();
  await expect(page.locator('#scene')).toHaveAttribute('data-render-pending', 'false', {
    timeout: 90000,
  });
  await page.screenshot({ path: 'artifacts/session/live-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expectSession(page);
  await page.screenshot({ path: 'artifacts/session/live-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.session-mission .lesson-card')).toBeVisible();
  await page.locator('[data-camera=deck]').click();
  await page.locator('#play').click();
  await expect(page.locator('#practice-live-score')).toContainText('50 / 100');
  await page.locator('#chart-toggle').click();
  await expectSession(page);
  await page.locator('#close-modal').click();
  await expect(page.locator('.practice-debrief')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
  await page.locator('#close-modal').click();
  await expect(page.locator('.simulation-console')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/session/lesson-mobile.png' });
  await testInfo.attach('session screenshots', {
    body: 'artifacts/session/',
    contentType: 'text/plain',
  });
  expect(errors).toEqual([]);
});
