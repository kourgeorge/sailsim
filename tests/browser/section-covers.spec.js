import { test, expect } from '@playwright/test';

async function fallback(context) {
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
}
async function home(page, section) {
  await expect(page.locator('body')).toHaveAttribute('data-session', 'outside');
  await expect(page.locator('body')).toHaveAttribute('data-section', section);
  await expect(page.locator(`[data-section-page=${section}]`)).toBeVisible();
  await expect(page.locator('#section-cover')).toBeVisible();
  await expect(page.locator('.simulation-console')).toBeHidden();
  await expect(page.locator('#challenge-hud')).toBeHidden();
  await expect(page.locator('#race-hud')).toBeHidden();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
}
async function navigate(page, section) {
  await page
    .locator(
      page.viewportSize().width <= 900
        ? `button[data-section=${section}]`
        : `button[data-mode=${section}]`,
    )
    .click();
  await home(page, section);
}
async function exit(page) {
  if (page.viewportSize().width <= 900) await page.locator('#mobile-menu-toggle').click();
  await page.locator('#session-exit').click();
}

test('desktop covers separate lesson and free-sailing setup from the cockpit', async ({
  page,
  context,
}) => {
  await fallback(context);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await home(page, 'learn');
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="8"]').click();
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expect(page.locator('#section-cover')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await page.locator('#play').click();
  await expect(page.locator('#section-cover')).toBeHidden();
  await exit(page);
  await home(page, 'learn');
  await expect(page.locator('#practice-debrief')).toBeVisible();
  await page.locator('#practice-debrief').click();
  await expect(page.locator('.practice-debrief')).toBeVisible();
  await page.locator('#close-modal').click();
  await page.screenshot({ path: 'artifacts/section-covers/learn-desktop.png' });
  await navigate(page, 'explore');
  await page.locator('[data-cover-location=shelter]').click();
  await page.locator('#cover-conditions-button').click();
  await page.locator('#wind-speed').fill('17');
  await page.locator('#close-modal').click();
  await expect(page.locator('#cover-conditions')).toContainText('17 kn');
  await page.screenshot({ path: 'artifacts/section-covers/free-desktop.png' });
  await page.locator('#section-cover').focus();
  await page.keyboard.press('Space');
  await home(page, 'explore');
  await page.locator('#cover-start-free').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await expect(page.locator('#location-title')).toHaveText('Shelter Bay');
  await page.locator('#session-restart').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await exit(page);
  await home(page, 'explore');
  await expect(page.locator('#cover-conditions')).toContainText('17 kn');
  await navigate(page, 'challenge');
  await expect(page.locator('[data-sailing-challenge]')).toHaveCount(5);
  await expect(page.locator('[data-race-course]')).toHaveCount(3);
  await page.screenshot({ path: 'artifacts/section-covers/challenges-desktop.png' });
  expect(errors).toEqual([]);
});

for (const size of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`exit returns all challenge types to the challenge cover at ${size.width}px`, async ({
    page,
    context,
  }) => {
    await fallback(context);
    await page.setViewportSize(size);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('./');
    await navigate(page, 'challenge');
    await page.locator('[data-sailing-challenge=rescue-run]').click();
    await page.locator('#challenge-start').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'challenge');
    await page.locator('#cover-review').click();
    await expect(page.locator('.challenge-results')).toBeVisible();
    await page.locator('#close-modal').click();
    await page.locator('[data-race-course=harbor-sprint]').click();
    await page.locator('#race-start').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'challenge');
    await page.locator('#cover-review').click();
    await expect(page.locator('.race-results')).toBeVisible();
    await page.locator('#close-modal').click();
    await page.locator('#race-engine-drills').click();
    await page.locator('[data-drill]').first().click();
    await page.locator('#begin-drill').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'challenge');
    await page.locator('#cover-review').click();
    await expect(page.locator('.maneuver-review')).toBeVisible();
    await page.locator('#close-modal').click();
    await page.locator('#race-engine-drills').click();
    await page.locator('#lab-buoys').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'challenge');
    await page.locator('#cover-review').click();
    await expect(page.locator('.challenge-debrief')).toBeVisible();
    await page.locator('#close-modal').click();
    await navigate(page, 'explore');
    await page.locator('#cover-start-free').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'explore');
    await navigate(page, 'learn');
    expect(errors).toEqual([]);
  });
}

test('mobile covers and exit support six languages and 200% text', async ({ browser }) => {
  for (const lang of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await fallback(context);
    await context.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`./?lang=${lang}`);
    for (const section of ['learn', 'explore', 'challenge']) {
      await navigate(page, section);
      expect(
        await page
          .locator('#section-cover')
          .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
        `${lang}/${section} overflow`,
      ).toBe(true);
      await page.screenshot({ path: `artifacts/section-covers/${section}-mobile-${lang}.png` });
    }
    await page.locator('[data-sailing-challenge=rescue-run]').click();
    await page.locator('#challenge-start').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'challenge');
    await navigate(page, 'learn');
    await page.locator('#cover-course').click();
    await page.locator('[data-library-lesson="8"]').click();
    await page.locator('#practice-start').click();
    await page.locator('#practice-launch').click();
    await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
    await exit(page);
    await home(page, 'learn');
    expect(errors).toEqual([]);
    await context.close();
  }
});
