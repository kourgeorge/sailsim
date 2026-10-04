import { test, expect } from '@playwright/test';

test.use({ locale: 'es-MX' });

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
});

test('browser language initializes a first visit while manual choices and links take priority', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('#language-picker')).toContainText('Español');
  expect(await page.evaluate(() => localStorage.getItem('sail-language'))).toBeNull();

  await page.locator('#language-picker').click();
  await page.locator('#language-option-en').click();
  await expect(page).toHaveURL(/lang=en/);
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#language-picker')).toContainText('English');

  await page.goto('./?lang=he');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#language-picker')).toContainText('עברית');
});
