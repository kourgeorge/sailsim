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
      createGain() {
        const gain = super.createGain();
        if (!this.outputAnalyser) {
          this.outputAnalyser = this.createAnalyser();
          gain.connect(this.outputAnalyser);
        }
        return gain;
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
        return Math.min(
          ...[horn.analyser, horn.context.outputAnalyser].map((analyser) => {
            const samples = new Float32Array(analyser.fftSize);
            analyser.getFloatTimeDomainData(samples);
            return Math.sqrt(
              samples.reduce((sum, value) => sum + value * value, 0) / samples.length,
            );
          }),
        );
      }),
    )
    .toBeGreaterThan(0.01);
}

test('helm horn and B stay audible when music is muted, suppress overlapping presses, and honor pause/exit', async ({
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
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
  await audible(page);
  expect(await sounding(page)).toBe(1);
  await expect(horn).toContainText('Horn');
  await expect(horn).toHaveAttribute('title', 'Sound one short blast');
  await expect(horn).toBeEnabled();
  await page.keyboard.press('b');
  await audible(page);
  expect(await hornCount(page)).toBe(4);
  await expect(horn).toBeEnabled();
  await horn.click();
  await audible(page);
  await page.locator('#session-exit').click();
  await expect.poll(() => sounding(page)).toBe(0);
  await expect(horn).toBeHidden();
  await page.keyboard.press('b');
  expect(await hornCount(page)).toBe(5);
  await page.locator('[data-mode=learn]').click();
  await expect(horn).toBeHidden();
  expect(errors).toEqual([]);
});

for (const settings of [
  { musicEnabled: false, music: 0.45, musicSource: 'sail' },
  { musicEnabled: true, music: 0, musicSource: 'rp-mellow' },
]) {
  test(`horn works when sailing starts with saved ${settings.musicSource} music muted`, async ({
    page,
  }) => {
    await page.addInitScript((saved) => {
      localStorage.setItem('sail-audio-v1', JSON.stringify(saved));
    }, settings);
    const backgroundRequests = [];
    page.on('request', (request) => {
      if (/\.mp3|stream\.radioparadise\.com/.test(request.url()))
        backgroundRequests.push(request.url());
    });
    await start(page);
    await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
    await page.keyboard.press('b');
    await audible(page);
    await expect(page.locator('#boat-horn')).toBeEnabled();
    await page.locator('#boat-horn').click();
    await audible(page);
    expect(await hornCount(page)).toBe(2);
    await expect(page.locator('#boat-horn')).toBeEnabled();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const analyser = window.sailingContext.outputAnalyser;
          const samples = new Float32Array(analyser.fftSize);
          analyser.getFloatTimeDomainData(samples);
          return Math.max(...samples.map(Math.abs));
        }),
      )
      .toBeLessThan(0.0001);
    expect(backgroundRequests).toEqual([]);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sail-audio-v1')))).toEqual(
      settings,
    );
  });
}

test('muted catamaran horn is reachable in the mobile helm with large RTL text', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('sail-text-size', '200');
    localStorage.setItem('sail-audio-v1', JSON.stringify({ musicEnabled: false, music: 0.45 }));
  });
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
  test(`pending horn audio respects ${interruption} while resuming`, async ({ page }) => {
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
    if (interruption === 'none' || interruption === 'mute') {
      await audible(page);
      expect(await hornCount(page)).toBe(1);
      await expect(page.locator('#boat-horn')).toBeEnabled();
    } else {
      await expect(page.locator('#boat-horn')).toHaveAttribute('data-sounding', 'false');
      expect(await hornCount(page)).toBe(0);
    }
  });
}
