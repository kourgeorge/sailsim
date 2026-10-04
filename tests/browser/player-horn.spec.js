import { test, expect } from '@playwright/test';

// Keep real Web Audio; only skip 3D rendering so lifecycle assertions are deterministic.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
    window.playerHorns = [];
    const NativeContext = window.AudioContext || window.webkitAudioContext;
    window.AudioContext = class extends NativeContext {
      constructor(...args) {
        super(...args);
        window.sailingContext = this;
      }
      createBufferSource() {
        const source = super.createBufferSource();
        const start = source.start;
        const connect = source.connect;
        source.connect = function (target, ...args) {
          if (target instanceof GainNode) this.hornGain = target;
          return connect.call(this, target, ...args);
        };
        source.start = function (...args) {
          if (this.buffer.duration < 2 && !this.loop) {
            window.playerHorns.push(this);
            this.analyser = this.context.createAnalyser();
            this.hornGain.connect(this.analyser);
            this.addEventListener('ended', () => {
              this.ended = true;
              this.analyser.disconnect();
            });
          }
          return start.apply(this, args);
        };
        return source;
      }
    };
  });
});

async function start(page) {
  await page.goto('./');
  await expect(page.locator('#boat-horn')).toBeHidden();
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-start-free').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await expect(page.locator('#boat-horn')).toBeEnabled();
}
const hornCount = (page) => page.evaluate(() => window.playerHorns.length);
const sounding = (page) =>
  page.evaluate(() => window.playerHorns.filter((horn) => !horn.ended).length);

async function audible(page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const horn = window.playerHorns.at(-1);
        if (!horn) return 0;
        const samples = new Float32Array(horn.analyser.fftSize);
        horn.analyser.getFloatTimeDomainData(samples);
        return Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
      }),
    )
    .toBeGreaterThan(0.01);
}

test('helm horn and B play one short blast, suppress overlapping presses, and honor pause/mute/exit', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await start(page);
  const horn = page.locator('#boat-horn');
  await expect(horn).toHaveAttribute('aria-keyshortcuts', 'B');
  await horn.click();
  await audible(page);
  await expect(horn).toHaveAttribute('data-sounding', 'true');
  await page.keyboard.press('b');
  expect(await hornCount(page)).toBe(1);
  expect(await page.evaluate(() => window.playerHorns[0].buffer.duration)).toBeCloseTo(1.37, 2);
  await expect(horn).toBeEnabled();
  await page.screenshot({ path: testInfo.outputPath('helm-horn-desktop.png') });
  await page.locator('.simulator').evaluate((node) => {
    node.tabIndex = -1;
    node.focus();
  });
  await page.keyboard.press('b');
  await audible(page);
  expect(await hornCount(page)).toBe(2);
  await page.locator('#play').click();
  await expect.poll(() => sounding(page)).toBe(0);
  await expect(horn).toBeDisabled();
  await page.locator('#play').click();
  await expect(horn).toBeEnabled();
  await horn.click();
  await audible(page);
  await page.locator('#sound-settings').click();
  await expect.poll(() => sounding(page)).toBe(0);
  await expect(horn).toBeDisabled();
  await expect(horn).toContainText('Horn · muted');
  await page.keyboard.press('b');
  expect(await hornCount(page)).toBe(3);
  await page.locator('#sound-settings').click();
  await expect(horn).toBeEnabled();
  await horn.click();
  await audible(page);
  await page.locator('#session-exit').click();
  await expect.poll(() => sounding(page)).toBe(0);
  await expect(horn).toBeHidden();
  await page.keyboard.press('b');
  expect(await hornCount(page)).toBe(4);
  await page.locator('[data-mode=learn]').click();
  await expect(horn).toBeHidden();
  expect(errors).toEqual([]);
});

test('catamaran horn is reachable in the mobile helm with large RTL text', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  await page.goto('./?lang=he');
  await page.locator('[data-section=explore]').click();
  await page.locator('#cover-vessel').click();
  await page.locator('#vessel-option-catamaran').click();
  await page.locator('#cover-start-free').click();
  await expect(page.locator('body')).toHaveAttribute('data-session', 'active');
  await page.locator('#mobile-tab-helm').click();
  const horn = page.locator('#boat-horn');
  await expect(horn).toBeInViewport({ ratio: 1 });
  await expect(horn).toContainText('צופר');
  const box = await horn.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await horn.click();
  await audible(page);
  await expect(horn).toBeEnabled();
  expect(
    await page
      .locator('.control-dock')
      .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('helm-horn-mobile-he.png') });
});

for (const interruption of ['none', 'pause', 'mute', 'exit']) {
  test(`a horn tap resumes suspended audio without a stale blast after ${interruption}`, async ({
    page,
  }) => {
    await start(page);
    await page.evaluate(async () => {
      const context = window.sailingContext;
      await context.suspend();
      const resume = context.resume.bind(context);
      context.resume = () =>
        new Promise((resolve) => {
          window.releaseAudio = async () => {
            await resume();
            resolve();
          };
        });
    });
    await page.locator('#boat-horn').click();
    expect(await hornCount(page)).toBe(0);
    if (interruption === 'pause') await page.locator('#play').click();
    if (interruption === 'mute') await page.locator('#sound-settings').click();
    if (interruption === 'exit') await page.locator('#session-exit').click();
    await page.evaluate(() => window.releaseAudio());
    if (interruption === 'none') {
      await audible(page);
      expect(await hornCount(page)).toBe(1);
      await expect(page.locator('#boat-horn')).toBeEnabled();
    } else {
      await expect(page.locator('#boat-horn')).toHaveAttribute('data-sounding', 'false');
      expect(await hornCount(page)).toBe(0);
    }
  });
}
