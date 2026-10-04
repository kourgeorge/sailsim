import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.beforeEach(async ({ context, page }, testInfo) => {
  if (!testInfo.tags.includes('@webgl'))
    await context.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
      };
    });
  await page.goto('./');
});

async function explore(page) {
  await page.locator('[data-section="explore"]').tap();
  await page.locator('#cover-start-free').tap();
  await page.locator('#play').tap();
  await expect(page.locator('#scene-compass')).toBeVisible();
  await expect(page.locator('#scene-compass')).toHaveAttribute(
    'data-compass-position',
    /^(top|bottom)-(left|right)$/,
  );
}

async function touch(client, type, x, y) {
  await client.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }],
  });
}

async function swipe(client, from, to, end = 'touchEnd') {
  await touch(client, 'touchStart', from.x, from.y);
  for (let i = 1; i <= 8; i++) {
    await touch(
      client,
      'touchMove',
      from.x + ((to.x - from.x) * i) / 8,
      from.y + ((to.y - from.y) * i) / 8,
    );
  }
  await touch(client, end);
}

async function expectClearCompass(page) {
  await expect
    .poll(() =>
      page.locator('#scene-compass').evaluate((compass) => {
        const rect = compass.getBoundingClientRect();
        const overlap = [
          ...document.querySelectorAll(
            '.mobile-scene-toolbar, .mobile-indicators, .simulation-console, #race-hud',
          ),
        ].some((node) => {
          const other = node.getBoundingClientRect();
          return (
            other.width &&
            other.height &&
            rect.left < other.right &&
            rect.right > other.left &&
            rect.top < other.bottom &&
            rect.bottom > other.top
          );
        });
        return (
          !overlap &&
          rect.left >= 0 &&
          rect.top >= 0 &&
          rect.right <= innerWidth &&
          rect.bottom <= innerHeight
        );
      }),
    )
    .toBe(true);
}

test('touch drags dock the compass at four corners and save the chosen position', async ({
  page,
  context,
}) => {
  await explore(page);
  const compass = page.locator('#scene-compass');
  const client = await context.newCDPSession(page);
  for (const [position, x, y] of [
    ['top-left', 20, 30],
    ['bottom-left', 20, 820],
    ['bottom-right', 370, 820],
    ['top-right', 370, 30],
  ]) {
    await expect.poll(() => compass.evaluate((node) => node.getAnimations().length)).toBe(0);
    const box = await compass.boundingBox();
    await touch(client, 'touchStart', box.x + box.width / 2, box.y + box.height / 2);
    await touch(client, 'touchMove', x, y);
    await expect(page.locator('.compass-dock-target')).toHaveCount(4);
    await expect(compass).toHaveClass(/is-dragging/);
    await touch(client, 'touchEnd');
    await expect(compass).toHaveAttribute('data-compass-position', position);
    await expectClearCompass(page);
    await expect(page.locator('.compass-dock-target')).toHaveCount(0);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  await compass.tap();
  await expect(compass).toHaveAttribute('data-compass-position', 'bottom-right');
  await page.reload();
  await explore(page);
  await expect(compass).toHaveAttribute('data-compass-position', 'bottom-right');
  await expectClearCompass(page);
});

test('cancelled drags restore the dock, keyboard works, and desktop retains its layout', async ({
  page,
  context,
}) => {
  await explore(page);
  const compass = page.locator('#scene-compass');
  const client = await context.newCDPSession(page);
  const box = await compass.boundingBox();
  await swipe(client, { x: box.x + 60, y: box.y + 60 }, { x: 30, y: 800 }, 'touchCancel');
  await expect(compass).toHaveAttribute('data-compass-position', 'top-right');
  await expect(compass).not.toHaveClass(/is-dragging/);
  await compass.focus();
  await page.keyboard.press('Enter');
  await expect(compass).toHaveAttribute('data-compass-position', 'bottom-right');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.scene-tools > #scene-compass')).toBeVisible();
  await expect(compass).toHaveCSS('transform', 'none');
  await expect(compass).not.toHaveAttribute('role', 'button');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.simulator > #scene-compass')).toBeVisible();
  await expect(compass).toHaveAttribute('data-compass-position', 'bottom-right');
  await expectClearCompass(page);
});

test('mobile compass docks fit landscape, small phones, large text and RTL', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('sail-text-size', '200'));
  await page.goto('./?lang=he');
  await explore(page);
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    for (let i = 0; i < 4; i++) {
      await expectClearCompass(page);
      await page.locator('#scene-compass').tap();
    }
  }
  await page.locator('#mobile-tab-sails').tap();
  await expectClearCompass(page);
});

test('a diagonal slider drag keeps changing the sail control without scrolling its panel', async ({
  page,
  context,
}) => {
  await explore(page);
  await page.locator('#mobile-tab-sails').tap();
  const client = await context.newCDPSession(page);
  for (const selector of ['#trim', '#cockpit-jib-sheet']) {
    const slider = page.locator(selector);
    await slider.fill('10');
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();
    const scroll = await page.locator('.control-dock').evaluate((node) => node.scrollTop);
    const start = { x: box.x + 10 + ((box.width - 20) * 10) / 90, y: box.y + box.height / 2 };
    await touch(client, 'touchStart', start.x, start.y);
    // Begin vertically: a scrollable drawer must not cancel the slider gesture.
    await touch(client, 'touchMove', start.x + 2, start.y - 50);
    await touch(client, 'touchMove', box.x + box.width - 12, start.y - 65);
    await touch(client, 'touchEnd');
    expect(Number(await slider.inputValue())).toBeGreaterThan(70);
    expect(await page.locator('.control-dock').evaluate((node) => node.scrollTop)).toBe(scroll);
  }
  const drawer = page.locator('.control-dock');
  const bounds = await drawer.boundingBox();
  const beforeScroll = await drawer.evaluate((node) => node.scrollTop);
  await swipe(
    client,
    { x: bounds.x + 5, y: bounds.y + bounds.height - 35 },
    { x: bounds.x + 5, y: bounds.y + 35 },
  );
  await expect.poll(() => drawer.evaluate((node) => node.scrollTop)).toBeGreaterThan(beforeScroll);
  await expect(page.locator('#mobile-controls-drawer')).toHaveClass(/is-open/);
});

test('tapping outside mobile controls closes the pane while inside controls and tabs remain usable', async ({
  page,
}) => {
  await explore(page);
  const drawer = page.locator('#mobile-controls-drawer');
  await page.locator('#mobile-tab-sails').tap();
  await page.locator('.cockpit-group-sheets .control-title label').tap();
  await expect(drawer).toBeVisible();
  await page.locator('#mobile-tab-helm').tap();
  await expect(page.locator('#rudder')).toBeVisible();
  await page.locator('#center-helm').tap();
  await expect(drawer).toBeVisible();
  await page.touchscreen.tap(160, 290);
  await expect(drawer).toBeHidden();
  await expect(page.locator('#mobile-tab-helm')).toHaveAttribute('aria-selected', 'false');
  await page.locator('#mobile-tab-helm').tap();
  await expect(drawer).toBeVisible();
  await page.locator('#mobile-tab-helm').tap();
  await expect(drawer).toBeHidden();
  await page.locator('#mobile-tab-sails').tap();
  await page.locator('#play').tap();
  await expect(drawer).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-running');
});

test(
  'open mobile controls take priority over camera gestures in the 3D scene',
  { tag: '@webgl' },
  async ({ page, context }, testInfo) => {
    test.setTimeout(180000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await explore(page);
    const scene = page.locator('#scene');
    const settle = () =>
      expect(scene).toHaveAttribute('data-render-pending', 'false', { timeout: 90000 });
    const frames = async () => Number(await scene.getAttribute('data-frames'));
    const client = await context.newCDPSession(page);
    await settle();
    await page.locator('#mobile-tab-sails').tap();
    await settle();
    const beforePan = await frames();
    await swipe(client, { x: 100, y: 300 }, { x: 210, y: 320 });
    expect(await frames()).toBe(beforePan);
    // Some touch browsers synthesize a click after this gesture as well.
    if (!(await page.locator('#mobile-controls-drawer').isVisible()))
      await page.locator('#mobile-tab-sails').tap();
    const slider = page.locator('#trim');
    await slider.fill('10');
    await settle();
    const box = await slider.boundingBox();
    await swipe(
      client,
      { x: box.x + 10 + ((box.width - 20) * 10) / 90, y: box.y + box.height / 2 },
      { x: box.x + box.width - 12, y: box.y - 40 },
    );
    expect(Number(await slider.inputValue())).toBeGreaterThan(70);
    await page.touchscreen.tap(160, 290);
    await expect(page.locator('#mobile-controls-drawer')).toBeHidden();
    await settle();
    const beforeCompass = await frames();
    const compass = await page.locator('#scene-compass').boundingBox();
    await swipe(client, { x: compass.x + 60, y: compass.y + 60 }, { x: 30, y: 750 });
    await expect(page.locator('#scene-compass')).toHaveAttribute(
      'data-compass-position',
      'bottom-left',
    );
    expect(await frames()).toBe(beforeCompass);
    await expectClearCompass(page);
    await page.screenshot({ path: testInfo.outputPath('mobile-compass-bottom-left.png') });
    const beforeCamera = await frames();
    await swipe(client, { x: 100, y: 300 }, { x: 210, y: 340 });
    await expect.poll(frames).toBeGreaterThan(beforeCamera);
    await settle();
    expect(errors).toEqual([]);
  },
);
