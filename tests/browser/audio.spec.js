import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
    const Audio = window.AudioContext;
    window.audioContexts = [];
    window.AudioContext = class extends Audio {
      constructor(...args) {
        super(...args);
        window.audioContexts.push(this);
      }
      createGain() {
        const gain = super.createGain();
        (this.gains ||= []).push(gain);
        return gain;
      }
    };
  });
});

test('free sailing plays audio, mutes layers independently, and suspends when paused or hidden', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'ready');
  await expect(page.locator('#sound-settings')).toBeHidden();
  expect(await page.evaluate(() => window.audioContexts.length)).toBe(0);
  await page.locator('[data-mode="explore"]').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'paused');
  await page.locator('#cover-start-free').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await page.locator('#sound-settings').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await expect(page.locator('#modal')).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[0].gain.value))
    .toBeCloseTo(0.1875, 3);
  await page.locator('#sound-options').click();
  await expect(page.locator('#sound-quiet')).toBeChecked();
  await page.screenshot({ path: testInfo.outputPath('sound-desktop.png') });
  await page.locator('#sound-music').fill('32');
  await page.locator('#sound-sea').fill('61');
  await page.locator('#sound-quiet').uncheck();
  await expect(page.locator('#sound-settings')).toHaveAttribute('aria-pressed', 'false');
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[0].gain.value))
    .toBeCloseTo(0.75, 3);
  await page.getByRole('button', { name: 'Mute music', exact: true }).click();
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-sea-mute')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await page.getByRole('button', { name: 'Mute sea sounds', exact: true }).click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  await page.getByRole('button', { name: 'Unmute music', exact: true }).click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await expect(page.locator('#sound-music')).toHaveValue('32');
  await expect(page.locator('#sound-sea')).toHaveValue('61');
  await expect(page.locator('#sound-sea-mute')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#sound-enabled').uncheck();
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  await page.locator('#sound-enabled').check();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await page.locator('#close-modal').click();
  await page.locator('#play').click();
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  await page.locator('#play').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'paused');
  await page.locator('#play').click();
  await page.locator('#session-exit').click();
  await page.locator('[data-mode="learn"]').click();
  await expect(page.locator('#sound-settings')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  expect(await page.evaluate(() => window.audioContexts.length)).toBe(1);
  expect(errors).toEqual([]);
});

test('mobile sound controls remain available while sailing and preserve preferences with large RTL text', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?lang=he');
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('.text-size-control summary').click();
  await page.locator('#sail-text-size-range').fill('200');
  await page.locator('.text-size-control summary').click();
  await page.locator('#mobile-menu .mobile-sheet-close').click();
  await page.locator('[data-section="explore"]').click();
  await page.locator('#cover-sound').click();
  await expect(page.locator('#cover-sound')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#modal')).not.toBeVisible();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#sailing-audio-settings h2')).toHaveText('ים ומוזיקה');
  await page.locator('#sound-music-mute').click();
  await page.locator('#sound-sea-mute').click();
  await page.locator('#sound-sea-mute').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('sound-mobile-he-200.png') });
  expect(
    await page.locator('#modal').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await page.reload();
  await page.locator('[data-section="explore"]').click();
  await expect(page.locator('#cover-sound')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#cover-start-free').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
  expect(await page.evaluate(() => window.audioContexts.length)).toBe(0);
  await page.locator('#mobile-menu-toggle').click();
  for (const id of ['sound-settings', 'sound-options']) {
    const button = page.locator(`#${id}`);
    await expect(button).toBeInViewport({ ratio: 1 });
    const box = await button.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: testInfo.outputPath('sound-menu-mobile-he-200.png') });
  await page.locator('#sound-options').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#sailing-audio-settings')).toBeVisible();
  await expect(page.locator('#sound-source option')).toHaveCount(5);
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#sound-music-mute').click();
  await expect(page.locator('#sound-sea-mute')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#close-modal').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('#sound-settings').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#sound-settings')).toHaveAttribute('aria-pressed', 'false');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.view-controls #sound-settings')).toBeVisible();
  await expect(page.locator('.view-controls #sound-options')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-menu-toggle').click();
  await expect(page.locator('#sound-options')).toBeInViewport({ ratio: 1 });
  await page.locator('#session-exit').click();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-sea-mute')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-quiet')).not.toBeChecked();
});

test('the actual sound graph renders separate audible music and sea with smooth transitions', async ({
  page,
}) => {
  await page.goto('./');
  const source = await readFile(new URL('../../src/audio/soundscape.js', import.meta.url), 'utf8');
  const rendered = await page.evaluate(async (source) => {
    const { createSoundscape } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
    const results = {};
    for (const layer of ['music', 'sea']) {
      const context = new OfflineAudioContext(2, 50 * 22050, 22050);
      const graph = createSoundscape(context);
      graph[layer].gain.value = layer === 'music' ? 0.45 : 0.55;
      graph.output.gain.setValueAtTime(0, 0);
      graph.output.gain.linearRampToValueAtTime(0.75, 1.5);
      graph.output.gain.setValueAtTime(0.75, 47);
      graph.output.gain.linearRampToValueAtTime(0, 48);
      graph.schedule(50);
      const buffer = await context.startRendering();
      const data = buffer.getChannelData(0);
      let peak = 0,
        jump = 0;
      const rms = [];
      for (let second = 0; second < 50; second++) {
        let sum = 0;
        for (let i = second * 22050; i < (second + 1) * 22050; i++) {
          sum += data[i] ** 2;
          peak = Math.max(peak, Math.abs(data[i]));
          if (i) jump = Math.max(jump, Math.abs(data[i] - data[i - 1]));
        }
        rms.push(Math.sqrt(sum / 22050));
      }
      results[layer] = { peak, jump, rms };
    }
    return results;
  }, source);
  for (const [layer, signal] of Object.entries(rendered)) {
    expect(signal.peak, `${layer} is audible`).toBeGreaterThan(0.01);
    expect(signal.peak, `${layer} leaves mixing headroom`).toBeLessThan(0.45);
    expect(signal.jump, `${layer} has no large sample discontinuities`).toBeLessThan(0.15);
    for (const rms of signal.rms.slice(4, 46))
      expect(rms, `${layer} has no silent loop/chord gaps`).toBeGreaterThan(0.002);
    expect(signal.rms[49], `${layer} fades to silence`).toBe(0);
  }
});
