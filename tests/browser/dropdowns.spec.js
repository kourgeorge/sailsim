import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
});

async function openMenu(page, select) {
  if (!(await page.evaluate(() => CSS.supports('appearance', 'base-select')))) return false;
  await select.click();
  await expect.poll(() => select.evaluate((node) => node.matches(':open'))).toBe(true);
  return true;
}

test('radio and weather menus share the theme and keep native keyboard and change events', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-sound-options').click();
  const radio = page.locator('#sound-source');
  await expect(radio).toHaveCSS('border-radius', '8px');
  if (await openMenu(page, radio)) {
    await page.screenshot({ path: testInfo.outputPath('radio-menu.png') });
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
  } else await radio.selectOption('swiss-classical');
  await expect(radio).toHaveValue('swiss-classical');
  await expect(page.locator('#sound-radio-provider')).toHaveText('Radio Swiss Classic ↗');
  await page.locator('#close-modal').click();
  await page.locator('#cover-conditions-button').click();
  const weather = page.locator('#weather-mode');
  await expect(weather).toHaveCSS('border-radius', '8px');
  if (await openMenu(page, weather)) {
    await page.keyboard.press('End');
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).toBeVisible();
    await expect(weather).toHaveValue('changing');
  }
  await weather.selectOption('fixed');
  await page.locator('#close-modal').click();
  await expect(page.locator('#cover-conditions')).toContainText('Fixed weather');
});

test('race setup and dynamically rendered training menus share the component with a light theme', async ({
  page,
}, testInfo) => {
  await page.goto('./');
  await page.locator('[data-mode=challenge]').click();
  await page.locator('[data-race-course=harbor-sprint]').click();
  for (const id of ['race-difficulty', 'race-weather'])
    await expect(page.locator(`#${id}`)).toHaveCSS('border-radius', '8px');
  await page.locator('#race-difficulty').selectOption('expert');
  await page.locator('#race-weather').selectOption('fixed');
  await page.locator('[data-mode=learn]').click();
  await page.locator('#cover-course').click();
  await page.locator('[data-library-lesson="45"]').click();
  await page.locator('#lesson-briefing').click();
  await page.locator('#reader-start-training').click();
  await page.locator('#practice-launch').click();
  const answer = page.locator('#training-field-response');
  await expect(answer).toHaveCSS('border-radius', '8px');
  await expect(answer).toHaveCSS('color-scheme', 'light');
  if (await openMenu(page, answer)) {
    await page.screenshot({ path: testInfo.outputPath('training-menu.png') });
    await page.keyboard.press('Escape');
  }
  const choice = await answer.locator('option').nth(1).getAttribute('value');
  await answer.selectOption(choice);
  await expect(answer).toHaveValue(choice);
  await expect(answer).toHaveAttribute('aria-invalid', 'false');
});

test.describe('mobile dropdowns', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('radio menus remain readable at 200% in English and Hebrew', async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
    for (const lang of ['en', 'he']) {
      await page.goto(`./?lang=${lang}`);
      await page.locator('[data-section=explore]').tap();
      await page.locator('#cover-sound-options').tap();
      const select = page.locator('#sound-source');
      await expect(select).toHaveCSS('border-radius', '8px');
      const field = await select.boundingBox();
      expect(field.x).toBeGreaterThanOrEqual(0);
      expect(field.x + field.width).toBeLessThanOrEqual(390);
      if (await openMenu(page, select)) {
        const option = select.locator('option[value=swiss-classical]');
        await option.scrollIntoViewIfNeeded();
        const bounds = await option.boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
        await page.screenshot({ path: testInfo.outputPath(`radio-menu-${lang}-200.png`) });
        await option.tap();
      } else await select.selectOption('swiss-classical');
      await expect(select).toHaveValue('swiss-classical');
      await expect(page.locator('#sound-radio-provider')).toBeVisible();
      expect(
        await page.locator('#modal').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      ).toBe(true);
    }
  });
});
