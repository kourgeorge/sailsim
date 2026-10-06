import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5199';
const output = '/private/tmp/sail-land-sightings';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } }),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.route('**/__land-sightings', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><style>body{margin:0}</style>',
    }),
  );
  for (const mobile of [true, false]) {
    await page.goto(`${url}/__land-sightings`);
    const result = await page.evaluate(async (mobile) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createMaterials, seededRandom } = await import('/src/rendering/materials.js');
      const { initialState } = await import('/src/physics.js');
      Math.random = seededRandom(92);
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(1100, 760);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      document.body.append(renderer.domElement);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#b5c9d2');
      scene.fog = new THREE.FogExp2('#b7c7ce', 0.00031);
      const environment = createEnvironment(scene, renderer, createMaterials(), {
        quality: {
          name: mobile ? 'minimum' : 'high',
          shadowSize: 0,
          reflectionSize: mobile ? 0 : 256,
          reflectionInterval: 1,
          clouds: false,
        },
      });
      const state = { ...initialState(), x: -340, z: -160 };
      const camera = new THREE.PerspectiveCamera(47, 1100 / 760, 0.08, 10000);
      camera.position.set(state.x, 3, state.z);
      camera.lookAt(state.x, 3, state.z - 100);
      const view = {
        position: camera.position,
        direction: camera.getWorldDirection(new THREE.Vector3()),
        fov: camera.fov,
        aspect: camera.aspect,
      };
      let time = 0,
        event;
      for (; time < 45; time++) {
        environment.update(state, time, view);
        event = environment.landAnimals.encounters.slots.find((slot) => slot.event)?.event;
        if (event) break;
      }
      if (!event) return { missing: true };
      environment.update(state, time + 4, view);
      renderer.render(scene, camera);
      const gl = renderer.getContext(),
        shown = new Uint8Array(1100 * 760 * 4),
        hidden = new Uint8Array(shown.length);
      gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, shown);
      const group = environment.landAnimals.group;
      const before = environment.water.onBeforeRender;
      environment.water.onBeforeRender = () => {};
      group.visible = false;
      renderer.render(scene, camera);
      gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, hidden);
      let pixels = 0;
      for (let i = 0; i < shown.length; i += 4)
        if (
          Math.abs(shown[i] - hidden[i]) +
            Math.abs(shown[i + 1] - hidden[i + 1]) +
            Math.abs(shown[i + 2] - hidden[i + 2]) >
          12
        )
          pixels++;
      group.visible = true;
      environment.water.onBeforeRender = before;
      renderer.render(scene, camera);
      return { time, species: event.species, count: event.count, pixels };
    }, mobile);
    console.log(JSON.stringify({ mobile, ...result }));
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-shore.png` });
    assert.ok(
      !result.missing && result.time < 45,
      'A short coastal visit should produce a sighting',
    );
    assert.ok(
      result.pixels > 20,
      'The animals must actually be visible from the boat, above the terrain',
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
