import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5199';
const output = '/private/tmp/sail-buoy-review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.route('**/__buoy-review', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><style>body{margin:0}</style>',
    }),
  );
  for (const kind of ['navigation', 'race']) {
    await page.goto(`${url}/__buoy-review`);
    await page.evaluate(async (kind) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { initialState, step } = await import('/src/physics.js');
      const { createMaterials } = await import('/src/rendering/materials.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createYacht } = await import('/src/rendering/yacht.js');
      const { createRace, advanceRace } = await import('/src/racing/race.js');
      const { createRaceVisuals } = await import('/src/racing/visuals.js');
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(1100, 760);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      document.body.append(renderer.domElement);
      const scene = new THREE.Scene(),
        materials = createMaterials();
      scene.background = new THREE.Color('#b5c9d2');
      scene.fog = new THREE.FogExp2('#b7c7ce', 0.00031);
      const environment = createEnvironment(scene, renderer, materials, {
        quality: {
          name: 'balanced',
          shadowSize: 0,
          reflectionSize: 0,
          reflectionInterval: 4,
          clouds: false,
        },
      });
      const race =
        kind === 'race' ? createRace('harbor-sprint', 'club', { changingWeather: false }) : null;
      const state = race ? race.player : initialState();
      const buoy = race
        ? race.marks[0]
        : state.worldBodies.find((body) => body.visual?.type === 'buoy');
      const origin = { x: buoy.x, z: buoy.z };
      Object.assign(state, {
        x: buoy.x - 9,
        z: buoy.z,
        heading: 90,
        speed: 4,
        mainHoist: 0,
        jibHoist: 0,
        sails: 0,
        windSpeed: 0,
        currentSpeed: 0,
      });
      const fleet = race ? createRaceVisuals(scene, materials) : null;
      if (race) {
        race.countdown = 0;
        race.status = 'racing';
        fleet.set(race);
      }
      const boat = createYacht(materials);
      scene.add(boat.group);
      let marker;
      scene.traverse((object) => {
        if (object.userData.bodyId === buoy.id) marker = object;
      });
      if (!marker) throw new Error('Missing rendered buoy');
      const camera = new THREE.PerspectiveCamera(45, 1100 / 760, 0.08, 10000);
      camera.position.set(origin.x - 9, 7, origin.z + 14);
      camera.lookAt(origin.x - 2, 1, origin.z);
      const frame = () => {
        boat.group.position.set(state.x, 0, state.z);
        boat.group.rotation.y = (-state.heading * Math.PI) / 180;
        boat.update(state, state.elapsed);
        environment.update(state, state.elapsed);
        environment.excludeHullWater(boat.group);
        fleet?.update(state.elapsed);
        renderer.render(scene, camera);
        const floating = marker.getObjectByName('Physical race buoy') || marker;
        return {
          x: buoy.x,
          z: buoy.z,
          renderedX: marker.position.x,
          renderedZ: marker.position.z,
          displacement: Math.hypot(buoy.x - origin.x, buoy.z - origin.z),
          roll: floating.rotation.z,
          pitch: floating.rotation.x,
          collision: state.collision?.bodyId,
          solid: floating.children.some((mesh) => mesh.isMesh && !mesh.material.transparent),
        };
      };
      window.buoyReview = {
        frame,
        advance(seconds) {
          for (let i = 0; i < Math.round(seconds * 60); i++) {
            if (race) advanceRace(race, 1 / 60);
            else step(state, 1 / 60);
          }
          return frame();
        },
        release() {
          Object.assign(state, { x: origin.x - 50, speed: 0, leeway: 0, yawRate: 0 });
          return this.advance(15);
        },
      };
      frame();
    }, kind);
    await page.screenshot({ path: `${output}/${kind}-before.png` });
    const contact = await page.evaluate(() => window.buoyReview.advance(1.5));
    assert.ok(contact.displacement > 0.25, `${kind} moves under contact`);
    assert.equal(contact.renderedX, contact.x);
    assert.equal(contact.renderedZ, contact.z);
    assert.ok(contact.solid, `${kind} is visibly solid`);
    assert.ok(contact.collision);
    await page.screenshot({ path: `${output}/${kind}-contact.png` });
    if (kind === 'navigation') {
      const settled = await page.evaluate(() => window.buoyReview.release());
      assert.ok(settled.displacement < 1.1);
      await page.screenshot({ path: `${output}/${kind}-settled.png` });
    }
    console.log(JSON.stringify({ kind, ...contact }));
  }
  assert.deepEqual(errors, []);
  console.log(`Visible buoy contacts passed. Images: ${output}`);
} finally {
  await browser.close();
}
