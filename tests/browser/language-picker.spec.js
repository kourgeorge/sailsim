import { test, expect } from '@playwright/test';

// Language controls use the supported WebGL fallback, like the other UI suites.
// The rendering suite covers the GPU path separately.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
});

test('desktop language menu supports keyboard selection and recovers from a failed download', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  const button = page.locator('#language-picker');
  const menu = page.locator('#language-options');
  await expect(button).toContainText('English');
  await expect(page.locator('#language-select')).toBeHidden();
  await button.click();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('option')).toHaveCount(6);
  await expect(page.locator('#language-option-en')).toHaveAttribute('aria-selected', 'true');
  await expect(menu).toHaveCSS('background-color', 'rgb(18, 51, 63)');
  await page.screenshot({ path: '/tmp/sail-language-picker-desktop.png' });
  await button.press('Escape');
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
  await button.click();
  await page.locator('.sidebar-heading h1').first().click();
  await expect(menu).toBeHidden();

  // The normal loader rejects an incomplete pack; the styled control must
  // restore the current choice and become usable again.
  await page.route('**/locales/es.json', (route) => route.fulfill({ json: {} }));
  await button.press('ArrowDown');
  await button.press('e');
  await button.press('s');
  await expect(button).toHaveAttribute('aria-activedescendant', 'language-option-es');
  await button.press('Enter');
  await expect(page.locator('#toast')).toContainText('Language could not be loaded');
  await expect(button).toBeEnabled();
  await expect(button).toContainText('English');
  await expect(page.locator('#language-select')).toHaveValue('en');
  await button.press('End');
  await expect(button).toHaveAttribute('aria-activedescendant', 'language-option-fr');
  await button.press('Home');
  await expect(button).toHaveAttribute('aria-activedescendant', 'language-option-en');
  await button.press('End');
  await button.press('Enter');
  await expect(page).toHaveURL(/lang=fr/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(button).toContainText('Français');
  expect(await page.evaluate(() => localStorage.getItem('sail-language'))).toBe('fr');
  expect(errors).toEqual([]);
});

test('language menu fits large RTL text and restores the native mobile control', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  await page.goto('./?lang=he');
  const button = page.locator('#language-picker');
  await button.click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const bounds = await page.locator('#language-options').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(10);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(1090);
  expect(
    await page
      .locator('.language-option > bdi')
      .evaluateAll((names) => names.every((name) => name.scrollWidth <= name.clientWidth)),
  ).toBe(true);
  await page.screenshot({ path: '/tmp/sail-language-picker-rtl.png' });
  await page.locator('#language-option-ar').click();
  await expect(page).toHaveURL(/lang=ar/);
  await expect(button).toContainText('العربية');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-menu-toggle').click();
  await expect(button).toBeHidden();
  await expect(page.locator('#language-select')).toBeVisible();
  await expect(page.locator('#language-select')).toHaveValue('ar');
  await page.locator('#language-select').selectOption('en');
  await expect(page).toHaveURL(/lang=en/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  expect(errors).toEqual([]);
});
