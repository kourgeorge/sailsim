import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { WORLD_DESTINATIONS } from '../src/locations.js';

await mkdir('artifacts/world-destinations/scenery', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : WORLD_DESTINATIONS.map((p) => p.id);
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // The synthetic capture document does not need Vite's development reload
  // socket. Chromium may block that socket for intercepted localhost pages.
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (
      text.startsWith("WebSocket connection to 'ws://127.0.0.1:5199/") ||
      text.startsWith('[vite] failed to connect to websocket.')
    )
      return;
    errors.push(text);
  });
  await page.route('**/__world-scenery', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<style>body{margin:0;background:#17343c}#scene{width:1200px;height:800px;position:relative}canvas{display:block}</style><div id="scene"></div>',
    }),
  );
  for (const id of ids) {
    await page.goto('http://127.0.0.1:5199/__world-scenery');
    const info = await page.evaluate(async (id) => {
      const { createScene } = await import('/src/scene.js');
      const { initialState } = await import('/src/physics.js');
      const { addFreeSailingTraffic } = await import('/src/world/free-sailing-traffic.js');
      const container = document.querySelector('#scene'),
        state = initialState(id);
      addFreeSailingTraffic(state);
      const scene = createScene(container, {
        locationId: id,
        vesselId: 'monohull',
        isFreeSailing: () => true,
      });
      scene.setView('chase');
      for (let frame = 0; frame < 6; frame++) scene.render(state, 10 + frame * 0.016);
      const blob = await scene.capture();
      const data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      const info = { ...container.dataset };
      scene.dispose();
      return { data, info };
    }, id);
    await writeFile(
      `artifacts/world-destinations/scenery/${id}.png`,
      Buffer.from(info.data, 'base64'),
    );
    console.log(id, JSON.stringify(info.info));
  }
  console.log('Errors', JSON.stringify(errors));
  if (errors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
