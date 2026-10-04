// Regenerate the original, self-contained audio assets. Requires Playwright's
// Chromium and ffmpeg; neither is needed to build or run the deployed app.
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const source = await readFile(new URL('../src/audio/soundscape.js', import.meta.url), 'utf8');
const output = new URL('../src/audio/assets/', import.meta.url);
await mkdir(output, { recursive: true });
const scratch = await mkdtemp(join(tmpdir(), 'sail-audio-'));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const [name, seconds] of [
    ['sail-relaxing', 80],
    ['waves', 48],
  ]) {
    const pcm = await page.evaluate(
      async ({ source, name, seconds }) => {
        const { createSoundscape, createWaves } = await import(
          `data:text/javascript,${encodeURIComponent(source)}`
        );
        const rate = 44100;
        const context = new OfflineAudioContext(2, seconds * 2 * rate, rate);
        if (name === 'waves') createWaves(context);
        else {
          const score = createSoundscape(context);
          score.music.gain.value = 1;
          score.output.gain.value = 1;
          score.schedule(seconds * 2);
        }
        const buffer = await context.startRendering();
        // The second complete cycle includes the preceding chord/filter tails.
        const offset = seconds * rate;
        const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
        let peak = 0;
        for (const data of channels)
          for (let i = offset; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        const scale = Math.min(1, 0.85 / peak);
        const bytes = new Uint8Array(offset * 4);
        const view = new DataView(bytes.buffer);
        for (let i = 0; i < offset; i++)
          for (let ch = 0; ch < 2; ch++)
            view.setInt16(
              (i * 2 + ch) * 2,
              Math.round(channels[ch][offset + i] * scale * 32767),
              true,
            );
        let binary = '';
        for (let i = 0; i < bytes.length; i += 16384)
          binary += String.fromCharCode(...bytes.subarray(i, i + 16384));
        return { base64: btoa(binary), peak, scale };
      },
      { source, name, seconds },
    );
    const input = join(scratch, `${name}.pcm`);
    await writeFile(input, Buffer.from(pcm.base64, 'base64'));
    execFileSync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-f',
      's16le',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-i',
      input,
      '-codec:a',
      'libmp3lame',
      '-q:a',
      '3',
      '-map_metadata',
      '-1',
      new URL(`${name}.mp3`, output).pathname,
    ]);
    console.log(`${name}: ${seconds}s, peak ${pcm.peak.toFixed(3)}, scale ${pcm.scale.toFixed(3)}`);
  }
} finally {
  await browser.close();
  await rm(scratch, { recursive: true, force: true });
}
