import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
    window.audioMedia = [];
    const NativeAudio = window.Audio;
    window.Audio = function () {
      const media = new NativeAudio();
      window.audioMedia.push(media);
      return media;
    };
    const Audio = window.AudioContext;
    window.audioContexts = [];
    window.AudioContext = class extends Audio {
      constructor(...args) {
        super(...args);
        window.audioContexts.push(this);
        this.requestedOptions = args[0];
        this.synthesisNodes = 0;
      }
      createOscillator() {
        this.synthesisNodes++;
        return super.createOscillator();
      }
      createConvolver() {
        this.synthesisNodes++;
        return super.createConvolver();
      }
      createBufferSource() {
        const node = super.createBufferSource();
        (this.loops ||= []).push(node);
        const start = node.start;
        node.start = function (when = 0, offset = 0) {
          return start.call(
            this,
            when,
            window.startNearLoopEnd ? this.buffer.duration - 0.25 : offset,
          );
        };
        node.addEventListener('ended', () => (node.ended = true));
        return node;
      }
      createGain() {
        const gain = super.createGain();
        (this.gains ||= []).push(gain);
        return gain;
      }
    };
  });
});

test('free sailing plays audio, mutes music, and suspends when paused or hidden', async ({
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
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-volume-level', 'medium');
  await page.locator('#sound-settings').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-volume-level', 'mute');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
  await page.locator('#sound-settings').click();
  await expect(page.locator('#sound-settings')).toHaveText('High');
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[1].gain.value))
    .toBeCloseTo(1, 3);
  await page.locator('#sound-settings').click();
  await expect(page.locator('#sound-settings')).toHaveText('Medium');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await expect(page.locator('#modal')).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[1].gain.value))
    .toBeCloseTo(0.5, 3);
  await page.locator('#sound-options').click();
  await expect(page.locator('#sound-music')).toHaveValue('50');
  await expect(page.locator('#sailing-audio-settings input[type=checkbox]')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('sound-desktop.png') });
  await page.locator('#sound-music').fill('32');
  await expect(page.locator('#sound-sea')).toHaveCount(0);
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-volume-level', 'medium');
  await page.locator('#sound-music').fill('80');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-volume-level', 'high');
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[1].gain.value))
    .toBeCloseTo(0.8, 3);
  await page.getByRole('button', { name: 'Mute sound', exact: true }).click();
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
  await expect(page.locator('#sound-music')).toHaveValue('0');
  await expect(page.locator('#sound-music')).toBeEnabled();
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  await page.getByRole('button', { name: 'Unmute sound', exact: true }).click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await expect(page.locator('#sound-music')).toHaveValue('80');
  await expect(page.locator('#sound-sea-mute')).toHaveCount(0);
  await page.locator('#sound-music').fill('0');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-volume-level', 'mute');
  await expect.poll(() => page.evaluate(() => window.audioContexts[0].state)).toBe('suspended');
  await page.locator('#sound-music').fill('32');
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'false');
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
  await expect(page.locator('#cover-sound')).toHaveAttribute('data-volume-level', 'mute');
  await page.locator('#cover-sound').click();
  await expect(page.locator('#cover-sound')).toHaveAttribute('data-volume-level', 'high');
  await expect(page.locator('#modal')).not.toBeVisible();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#sailing-audio-settings h2')).toHaveText('הגדרות צליל');
  await page.locator('#sound-source').selectOption('waves');
  await expect(page.locator('#sound-radio-info')).toBeHidden();
  await page.locator('#sound-music-mute').click();
  await page.locator('#sound-music-mute').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('sound-mobile-he-200.png') });
  expect(
    await page.locator('#modal').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await page.reload();
  await page.locator('[data-section="explore"]').click();
  await expect(page.locator('#cover-sound')).toHaveAttribute('data-volume-level', 'mute');
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
  await expect(page.locator('#sound-source option')).toHaveCount(7);
  await expect(page.locator('#sound-source')).toHaveValue('waves');
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#sound-music-mute').click();
  await expect(page.locator('#sound-sea-mute')).toHaveCount(0);
  await page.locator('#close-modal').click();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'playing');
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('#sound-settings').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-volume-level', 'medium');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.view-controls #sound-settings')).toBeVisible();
  await expect(page.locator('.view-controls #sound-options')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-menu-toggle').click();
  await expect(page.locator('#sound-options')).toBeInViewport({ ratio: 1 });
  await page.locator('#session-exit').click();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#sound-music-mute')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#sound-sea-mute')).toHaveCount(0);
  await expect(page.locator('#sound-music')).toHaveValue('50');
  await expect(page.locator('#sailing-audio-settings input[type=checkbox]')).toHaveCount(0);
});

test('rendered music and wave assets have continuous loops without deep gaps or clipping', async ({
  page,
}) => {
  await page.goto('./');
  const assets = {};
  for (const name of ['sail-relaxing', 'waves'])
    assets[name] = (
      await readFile(new URL(`../../src/audio/assets/${name}.mp3`, import.meta.url))
    ).toString('base64');
  const signals = await page.evaluate(async (assets) => {
    const results = {};
    const context = new OfflineAudioContext(2, 1, 44100);
    for (const [name, base64] of Object.entries(assets)) {
      const buffer = await context.decodeAudioData(
        Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer,
      );
      let peak = 0,
        jump = 0,
        seam = 0;
      const rms = [];
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        seam = Math.max(seam, Math.abs(data[0] - data[data.length - 1]));
        for (let start = 0; start + 44100 <= data.length; start += 44100) {
          let sum = 0;
          for (let i = start; i < start + 44100; i++) {
            sum += data[i] ** 2;
            peak = Math.max(peak, Math.abs(data[i]));
            if (i) jump = Math.max(jump, Math.abs(data[i] - data[i - 1]));
          }
          rms.push(Math.sqrt(sum / 44100));
        }
      }
      rms.sort((a, b) => a - b);
      results[name] = {
        peak,
        jump,
        seam,
        duration: buffer.duration,
        floor: rms[0],
        median: rms[Math.floor(rms.length / 2)],
      };
    }
    return results;
  }, assets);
  for (const [name, signal] of Object.entries(signals)) {
    expect(signal.duration).toBeCloseTo(name === 'waves' ? 48 : 80, 1);
    expect(signal.peak, `${name}: audible`).toBeGreaterThan(0.05);
    expect(signal.peak, `${name}: no clipping`).toBeLessThan(0.95);
    expect(signal.jump, `${name}: smooth samples`).toBeLessThan(0.25);
    expect(signal.seam, `${name}: continuous wrap`).toBeLessThan(signal.jump * 1.5 + 0.005);
    expect(
      signal.floor / signal.median,
      `${name}: no near-silent chord or loop gaps`,
    ).toBeGreaterThan(0.35);
  }
});

test('local playback loops while the UI is busy without running a synthesizer', async ({
  page,
}) => {
  await page.goto('./');
  await page.evaluate(() => {
    window.startNearLoopEnd = true;
  });
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-start-free').click();
  await page.locator('#sound-options').click();
  for (const source of ['sail', 'waves']) {
    await page.locator('#sound-source').selectOption(source);
    await expect(page.locator('#sound-status')).toHaveText('Background sound is playing.');
    const playback = await page.evaluate(async () => {
      const context = window.audioContexts[0];
      const node = context.loops.at(-1);
      const analyser = context.createAnalyser();
      node.connect(analyser);
      const before = context.currentTime;
      const start = performance.now();
      while (performance.now() - start < 750) {
        /* Simulate a long UI/render task. */
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      const rms = Math.sqrt(samples.reduce((sum, value) => sum + value ** 2, 0) / samples.length);
      node.disconnect(analyser);
      analyser.disconnect();
      return {
        ended: Boolean(node.ended),
        loop: node.loop,
        rms,
        elapsed: context.currentTime - before,
        synthesisNodes: context.synthesisNodes,
        options: context.requestedOptions,
        mediaCount: window.audioMedia.length,
        activeLoops: context.loops.filter((loop) => !loop.ended).length,
      };
    });
    expect(playback.loop).toBe(true);
    expect(playback.ended).toBe(false);
    expect(playback.elapsed).toBeGreaterThan(0.5);
    expect(playback.rms).toBeGreaterThan(0.001);
    expect(playback.synthesisNodes).toBe(0);
    expect(playback.mediaCount).toBe(0);
    expect(playback.activeLoops).toBe(1);
    expect(playback.options.latencyHint).toBe('playback');
  }
});
