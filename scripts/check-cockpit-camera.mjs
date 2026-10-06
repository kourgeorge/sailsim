import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
page.setDefaultTimeout(120000);
const errors = [],
  results = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.route('**/helm-stability-qa', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><style>body{margin:0}#scene{width:100vw;height:100vh}</style><div id="scene"></div></html>',
    }),
  );
  await page.goto('http://127.0.0.1:5199/helm-stability-qa');
  await page.evaluate(async () => {
    const source = await (await fetch('/src/scene.js')).text();
    const threeURL = source.match(/import \* as THREE from ["']([^"']+)["']/)[1];
    const THREE = await import(threeURL);
    const beforeRender = THREE.Scene.prototype.onBeforeRender;
    const afterRender = THREE.Scene.prototype.onAfterRender;
    let depth = 0;
    THREE.Scene.prototype.onBeforeRender = function (...args) {
      depth++;
      return beforeRender.apply(this, args);
    };
    THREE.Scene.prototype.onAfterRender = function (renderer, scene, camera, ...args) {
      afterRender.call(this, renderer, scene, camera, ...args);
      depth--;
      const screen = depth === 0 && scene.getObjectByName('helm-multifunction-screen');
      if (screen) {
        const point = screen.getWorldPosition(new THREE.Vector3()).project(camera);
        window.lastScreen = [((point.x + 1) * innerWidth) / 2, ((1 - point.y) * innerHeight) / 2];
      }
    };
    const [{ createScene }, { initialState, refreshDerived }] = await Promise.all([
      import('/src/scene.js'),
      import('/src/physics.js'),
    ]);
    const state = initialState();
    state.heading = 35;
    state.speed = 5;
    refreshDerived(state);
    const scene = createScene(document.querySelector('#scene'));
    scene.setView('deck');
    window.qa = { scene, state, time: 0, refreshDerived };
    qa.settle = async () => {
      for (let i = 0; i < 200; i++) {
        scene.render(state, qa.time);
        if (document.querySelector('#scene').dataset.renderPending === 'false') return;
        await new Promise(requestAnimationFrame);
      }
      throw new Error('Cockpit view did not settle');
    };
    await qa.settle();
  });
  for (const viewport of [{ width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    const motion = await page.evaluate(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await qa.settle();
      const reference = [...lastScreen],
        samples = [];
      for (let i = 0; i < 12; i++) {
        const dt = [1 / 120, 1 / 60, 1 / 30, 0.12, 0.25][i % 5];
        qa.time += dt;
        qa.state.x += 3 * dt;
        qa.state.z -= 2 * dt;
        qa.state.heading = (qa.state.heading + 6 * dt) % 360;
        qa.state.heel = Math.sin(qa.time * 0.5) * 25;
        qa.refreshDerived(qa.state);
        qa.scene.render(qa.state, qa.time);
        samples.push(Math.hypot(lastScreen[0] - reference[0], lastScreen[1] - reference[1]));
        await new Promise(requestAnimationFrame);
      }
      return { maxDisplayShiftPixels: Math.max(...samples), frames: samples.length };
    });
    assert.ok(motion.maxDisplayShiftPixels < 0.01, JSON.stringify(motion));
    results.push({ ...viewport, ...motion });
    await page.evaluate(() => {
      qa.state.heel = 0;
      qa.scene.render(qa.state, qa.time);
    });
    await page.screenshot({ path: `/tmp/sail-cockpit-stable-${viewport.width}.png` });
    console.log(JSON.stringify(results.at(-1)));
  }
  const pause = await page.evaluate(async () => {
    await qa.settle();
    const frames = document.querySelector('#scene').dataset.frames;
    const pixels = document.querySelector('#scene > canvas').toDataURL();
    for (let i = 0; i < 5; i++) {
      qa.scene.renderIfNeeded(qa.state, qa.time);
      await new Promise(requestAnimationFrame);
    }
    const framesStable = frames === document.querySelector('#scene').dataset.frames;
    // The WebGL drawing buffer is discarded after compositing. Compare two
    // actual renders, rather than a rendered frame with the discarded buffer.
    qa.scene.render(qa.state, qa.time);
    return {
      framesStable,
      pixelsStable: pixels === document.querySelector('#scene > canvas').toDataURL(),
    };
  });
  assert.equal(pause.framesStable, true);
  assert.equal(pause.pixelsStable, true);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, results, pause, errors }));
} finally {
  await browser.close();
}
