import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Run against Vite: node scripts/capture-section-backgrounds.mjs [dev URL]
// Reuse the simulator's yacht and geography, with no extra WebGL scene at runtime.
const url = process.argv.find((arg) => /^https?:/.test(arg)) || 'http://127.0.0.1:5199';
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
const output = new URL('../public/section-backgrounds/', import.meta.url);
await mkdir(output, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  if (process.argv.includes('--preview')) {
    const previews = new URL('../artifacts/section-covers/', import.meta.url);
    await mkdir(previews, { recursive: true });
    // Isolate the cover's visual check from the simulator's GPU requirements.
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /webgl/.test(type) ? null : original.call(this, type, ...args);
      };
    });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(url);
      for (const section of ['learn', 'explore', 'challenge']) {
        await page.locator(`button[data-${width === 390 ? 'section' : 'mode'}=${section}]`).click();
        await page.evaluate(async () => {
          const background = getComputedStyle(
            document.querySelector('.section-backdrop'),
          ).backgroundImage;
          const url = background.match(/url\("?([^"\)]+)/)[1];
          const image = new Image();
          image.src = url;
          await image.decode();
          await document.fonts.ready;
        });
        await page.screenshot({ path: new URL(`${section}-sea-${width}.png`, previews).pathname });
      }
    }
    console.log('Captured desktop and mobile section previews.');
  } else {
    await page.route('**/__section-capture', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<style>body{margin:0}#scene{width:100vw;height:100vh}</style><div id="scene"></div>',
      }),
    );
    for (const [section, location, orbit, heel] of [
      ['learn', 'haven', -0.25, 0],
      ['explore', 'shelter', 0.45, 3],
      ['challenge', 'strait', -0.65, 12],
    ]) {
      for (const portrait of [false, true]) {
        await page.setViewportSize({ width: portrait ? 900 : 2400, height: 1200 });
        await page.goto(`${url}/__section-capture`);
        const data = await page.evaluate(
          async ({ location, orbit, heel, portrait }) => {
            const { createScene } = await import('/src/scene.js');
            const { initialState } = await import('/src/physics.js');
            const container = document.querySelector('#scene');
            const scene = createScene(container, { locationId: location });
            const state = initialState(location);
            Object.assign(state, { heel, speed: heel ? 4 : 0, mainSheet: 30, jibSheet: 25 });
            scene.setView('chase');
            const canvas = container.querySelector('canvas');
            // Synthetic pointer events have no OS pointer to capture in this harness.
            canvas.setPointerCapture = () => {};
            // Use the normal camera controls to compose each view.
            canvas.dispatchEvent(
              new PointerEvent('pointerdown', {
                pointerId: 1,
                isPrimary: true,
                button: 0,
                clientX: 500,
                clientY: 500,
              }),
            );
            canvas.dispatchEvent(
              new PointerEvent('pointermove', {
                pointerId: 1,
                isPrimary: true,
                clientX: 500 + orbit / 0.006,
                clientY: 500,
              }),
            );
            canvas.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
            // A slightly wider portrait view leaves space for the page heading.
            if (portrait) canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 250 }));
            for (let i = 0; i < 24; i++) scene.render(state, 12);
            const image = document.createElement('canvas');
            image.width = portrait ? 900 : 1800;
            image.height = 1200;
            scene.render(state, 12);
            image
              .getContext('2d')
              .drawImage(
                canvas,
                0,
                0,
                canvas.width * (portrait ? 1 : 0.75),
                canvas.height,
                0,
                0,
                image.width,
                image.height,
              );
            const result = image.toDataURL('image/webp', 0.88).split(',')[1];
            scene.dispose();
            return result;
          },
          { location, orbit, heel, portrait },
        );
        const name = `${section}${portrait ? '-mobile' : ''}.webp`;
        await writeFile(new URL(name, output), Buffer.from(data, 'base64'));
        console.log(`Captured ${name}`);
      }
    }
  }
} finally {
  await browser.close();
}
