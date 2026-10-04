import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('small and large horn samples play through Web Audio and stop cleanly', async ({ page }) => {
  const source = await readFile(new URL('../../src/audio/horns.js', import.meta.url), 'utf8');
  await page.goto('about:blank');
  await page.evaluate(async (source) => {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    const { createHornPlayer } = await import(url);
    URL.revokeObjectURL(url);
    const context = new AudioContext(),
      analyser = context.createAnalyser();
    analyser.connect(context.destination);
    const player = createHornPlayer(context, analyser);
    window.hornTest = {
      context,
      player,
      signal() {
        const samples = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(samples);
        return Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
      },
    };
    const button = document.createElement('button');
    button.textContent = 'Play horn';
    button.onclick = async () => {
      await context.resume();
      player.play(
        { voice: button.dataset.voice || 'boat', signal: 'warning', gain: 1, pan: 0.4 },
        0.5,
      );
    };
    document.body.append(button);
  }, source);
  for (const voice of ['boat', 'ship']) {
    await page.locator('button').evaluate((button, voice) => {
      button.dataset.voice = voice;
    }, voice);
    await page.locator('button').click();
    await expect.poll(() => page.evaluate(() => window.hornTest.signal())).toBeGreaterThan(0.015);
    await page.evaluate(() => window.hornTest.player.setVolume(0));
    await expect.poll(() => page.evaluate(() => window.hornTest.signal())).toBeLessThan(0.0001);
    await page.evaluate(() => window.hornTest.player.setVolume(0.5));
    await expect.poll(() => page.evaluate(() => window.hornTest.signal())).toBeGreaterThan(0.015);
    await page.evaluate(() => window.hornTest.player.stop());
    await expect.poll(() => page.evaluate(() => window.hornTest.signal())).toBeLessThan(0.0001);
  }
  await page.evaluate(() => window.hornTest.context.close());
});
