import { test, expect } from '@playwright/test';

// A finite audio fixture exercises native playback, CORS and the Web Audio
// mixer without depending on a broadcaster's network in CI.
const sampleRate = 8000;
const samples = sampleRate * 90;
const wave = Buffer.alloc(44 + samples);
wave.write('RIFF');
wave.writeUInt32LE(wave.length - 8, 4);
wave.write('WAVEfmt ', 8);
wave.writeUInt32LE(16, 16);
wave.writeUInt16LE(1, 20);
wave.writeUInt16LE(1, 22);
wave.writeUInt32LE(sampleRate, 24);
wave.writeUInt32LE(sampleRate, 28);
wave.writeUInt16LE(1, 32);
wave.writeUInt16LE(8, 34);
wave.write('data', 36);
wave.writeUInt32LE(samples, 40);
for (let i = 0; i < samples; i++)
  wave[44 + i] = 128 + Math.round(24 * Math.sin((i * 2 * Math.PI * 220) / sampleRate));
const response = {
  contentType: 'audio/wav',
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: wave,
};

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
    const NativeAudio = window.Audio;
    window.radioElements = [];
    window.Audio = function () {
      const media = new NativeAudio();
      window.radioElements.push(media);
      return media;
    };
    const NativeContext = window.AudioContext;
    window.audioContexts = [];
    window.AudioContext = class extends NativeContext {
      constructor(...args) {
        super(...args);
        window.audioContexts.push(this);
      }
      createGain() {
        const gain = super.createGain();
        (this.gains ||= []).push(gain);
        return gain;
      }
      createOscillator() {
        const voice = super.createOscillator();
        (this.voices ||= []).push(voice);
        voice.addEventListener('ended', () => (voice.ended = true));
        return voice;
      }
      createBufferSource() {
        const node = super.createBufferSource();
        (window.localLoops ||= []).push(node);
        node.addEventListener('ended', () => (node.ended = true));
        window.bufferSources = (window.bufferSources || 0) + 1;
        return node;
      }
      createMediaElementSource(media) {
        const source = super.createMediaElementSource(media);
        const connect = source.connect;
        source.connect = function (output) {
          window.radioGain = output;
          return connect.call(this, output);
        };
        return source;
      }
    };
  });
});

test('radio connects only while sailing, shares music controls, and releases the stream on pause', async ({
  page,
}, testInfo) => {
  const requests = [],
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://stream.radioparadise.com/**', async (route) => {
    requests.push(route.request().url());
    await route.fulfill(response);
  });
  await page.goto('./');
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#sound-source option')).toHaveCount(6);
  await page.locator('#sound-source').selectOption('rp-mellow');
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => window.radioElements.length)).toBe(0);
  await page.locator('#close-modal').click();
  await page.locator('#cover-start-free').click();
  await expect.poll(() => page.evaluate(() => window.radioElements[0]?.paused)).toBe(false);
  await expect.poll(() => page.evaluate(() => window.radioGain.gain.value)).toBeCloseTo(0.45);
  expect(requests).toEqual(['https://stream.radioparadise.com/mellow-192']);
  expect(await page.evaluate(() => window.radioElements[0].loop)).toBe(false);
  expect(await page.evaluate(() => window.audioContexts[0].voices?.length || 0)).toBe(0);
  expect(await page.evaluate(() => window.bufferSources || 0)).toBe(0);
  await page.locator('#sound-options').click();
  expect(requests).toHaveLength(1); // Opening settings must not restart live radio.
  await page.locator('#sound-music').fill('32');
  await page.locator('#sound-quiet').check();
  await expect.poll(() => page.evaluate(() => window.radioGain.gain.value)).toBeCloseTo(0.32);
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[0].gain.value))
    .toBeCloseTo(0.1875);
  await expect(page.locator('#sound-sea-mute')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('radio-desktop.png') });
  await page.locator('#sound-music-mute').click();
  expect(await page.evaluate(() => window.radioElements[0].getAttribute('src'))).toBeNull();
  await expect(page.locator('#sound-settings')).toHaveAttribute('data-audio-state', 'muted');
  await page.locator('#sound-music-mute').click();
  await expect.poll(() => page.evaluate(() => window.radioElements[0].paused)).toBe(false);
  await page.locator('#sound-source').selectOption('sail');
  expect(await page.evaluate(() => window.radioElements[0].getAttribute('src'))).toBeNull();
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[1].gain.value))
    .toBeCloseTo(0.32);
  expect(await page.evaluate(() => window.audioContexts[0].voices?.length || 0)).toBe(0);
  await page.locator('#sound-source').selectOption('waves');
  await expect(page.locator('#sound-radio-info')).toBeHidden();
  expect(await page.evaluate(() => window.radioElements[0].getAttribute('src'))).toBeNull();
  await expect.poll(() => page.evaluate(() => window.radioGain.gain.value)).toBeCloseTo(0.32);
  expect(await page.evaluate(() => window.localLoops.at(-1).loop)).toBe(true);
  for (const mix of ['rp-main', 'rp-rock', 'rp-global']) {
    await page.locator('#sound-source').selectOption(mix);
    await expect.poll(() => page.evaluate(() => window.radioElements[0].paused)).toBe(false);
    await expect.poll(() => page.evaluate(() => window.radioGain.gain.value)).toBeCloseTo(0.32);
    expect(await page.evaluate(() => window.radioElements[0].loop)).toBe(false);
    await expect
      .poll(() => page.evaluate(() => window.localLoops.every((node) => node.ended)))
      .toBe(true);
  }
  expect(await page.evaluate(() => window.radioElements.length)).toBe(1);
  await page.locator('#close-modal').click();
  await page.locator('#play').click();
  expect(await page.evaluate(() => window.radioElements[0].getAttribute('src'))).toBeNull();
  await page.locator('#play').click();
  await expect.poll(() => page.evaluate(() => window.radioElements[0].paused)).toBe(false);
  await page.locator('#session-exit').click();
  expect(await page.evaluate(() => window.radioElements[0].getAttribute('src'))).toBeNull();
  await page.reload();
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#sound-source')).toHaveValue('rp-global');
  expect(await page.evaluate(() => window.radioElements.length)).toBe(0);
  expect(errors).toEqual([]);
});

test('a failed station can be retried and the radio controls fit large mobile RTL text', async ({
  page,
}, testInfo) => {
  let attempts = 0;
  await page.route('https://stream.radioparadise.com/**', (route) =>
    route.fulfill(
      ++attempts <= 2
        ? { status: 503, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Unavailable' }
        : response,
    ),
  );
  await page.goto('./');
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-sound-options').click();
  await page.locator('#sound-source').selectOption('rp-mellow');
  await page.locator('#close-modal').click();
  await page.locator('#cover-start-free').click();
  await expect
    .poll(() => page.evaluate(() => window.radioElements[0]?.getAttribute('src')))
    .toBeNull();
  await page.locator('#sound-options').click();
  await expect(page.locator('#sound-status')).toHaveText(
    'Radio is unavailable. Retry or choose another mix.',
  );
  await page.locator('#sound-retry').click();
  await expect.poll(() => page.evaluate(() => window.radioElements[0].paused)).toBe(false);
  await expect(page.locator('#sound-retry')).toBeHidden();
  await page.locator('#sound-source').selectOption('rp-rock');
  await expect.poll(() => page.evaluate(() => window.radioElements[0].paused)).toBe(false);
  await page.locator('#close-modal').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(await page.evaluate(() => window.radioElements[0].getAttribute('src'))).toBeNull();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('sail-text-size', '200'));
  await page.goto('./?lang=he');
  await page.locator('[data-section=explore]').click();
  await page.locator('#cover-sound-options').click();
  await expect(page.locator('#sound-source')).toHaveValue('rp-rock');
  await page.screenshot({ path: testInfo.outputPath('radio-mobile-he-200.png') });
  expect(
    await page.locator('#modal').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
});

test('a failed local wave file can be retried without falling back to another source', async ({
  page,
}) => {
  let unavailable = true;
  await page.route('**/assets/waves*.mp3', (route) =>
    route.fulfill(unavailable ? { status: 503, body: 'Unavailable' } : response),
  );
  await page.goto('./');
  await page.locator('[data-mode=explore]').click();
  await page.locator('#cover-sound-options').click();
  await page.locator('#sound-source').selectOption('waves');
  await page.locator('#close-modal').click();
  await page.locator('#cover-start-free').click();
  await page.locator('#sound-options').click();
  await expect(page.locator('#sound-status')).toHaveText(
    'Sound is unavailable. Retry or choose another source.',
  );
  await expect(page.locator('#sound-source')).toHaveValue('waves');
  await expect(page.locator('#sound-radio-info')).toBeHidden();
  await expect(page.locator('#sound-retry')).toHaveText('Retry sound');
  unavailable = false;
  await page.locator('#sound-retry').click();
  await expect
    .poll(() => page.evaluate(() => window.audioContexts[0].gains[1].gain.value))
    .toBeCloseTo(0.45);
  expect(await page.evaluate(() => window.radioElements.length)).toBe(0);
  expect(await page.evaluate(() => window.localLoops.length)).toBe(1);
});
