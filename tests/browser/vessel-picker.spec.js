import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
});

test('boat picker selects by keyboard, dismisses without changing the boat, and retains the choice', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await page.locator('[data-mode="explore"]').click();
  const picker = page.locator('#cover-vessel');
  await expect(picker).toHaveAttribute('role', 'combobox');
  await expect(picker).toHaveAttribute('data-vessel', 'monohull');
  await picker.focus();
  await page.keyboard.press('ArrowDown');
  await expect(picker).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('End');
  await expect(picker).toHaveAttribute('aria-activedescendant', 'vessel-option-catamaran');
  await page.screenshot({ path: testInfo.outputPath('yacht-picker-desktop-open.png') });
  await page.keyboard.press('Enter');
  await expect(picker).toHaveAttribute('data-vessel', 'catamaran');
  await expect(page.locator('#cover-vessel-specs')).toContainText('6.6');
  await picker.click();
  await page.keyboard.press('Home');
  await page.keyboard.press('Escape');
  await expect(picker).toHaveAttribute('data-vessel', 'catamaran');
  await expect(picker).toBeFocused();
  await picker.click();
  await page.locator('.section-detail-card').click({ position: { x: 10, y: 10 } });
  await expect(picker).toHaveAttribute('aria-expanded', 'false');
  await page.reload();
  await page.locator('[data-mode="explore"]').click();
  await expect(picker).toHaveAttribute('data-vessel', 'catamaran');
  await picker.click();
  await page.locator('#vessel-option-monohull').click();
  await expect(picker).toHaveAttribute('data-vessel', 'monohull');
  expect(errors).toEqual([]);
});

test.describe('touch boat picker', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('boat names and options fit at 200% text in both text directions', async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
    for (const lang of ['en', 'he']) {
      await page.goto(`./?lang=${lang}`);
      await page.locator('[data-section="explore"]').tap();
      const picker = page.locator('#cover-vessel');
      await picker.tap();
      const menu = page.locator('#cover-vessel-options');
      await expect(menu).toBeVisible();
      expect(await menu.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      expect(await picker.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`yacht-picker-mobile-${lang}-open.png`) });
      await page.locator('#vessel-option-catamaran').tap();
      await expect(picker).toHaveAttribute('data-vessel', 'catamaran');
      await expect(menu).toBeHidden();
      await expect(page.locator('#cover-vessel-specs')).toContainText('6.6');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  });
});
