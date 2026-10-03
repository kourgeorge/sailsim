import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5200';
const output = process.env.SAIL_BIRD_OUTPUT || '/tmp/sail-bird-visuals';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [],
    results = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.route('**/__bird-check', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><style>body{margin:0}canvas{display:block}</style>',
    }),
  );
  for (const mobile of [true, false]) {
    await page.goto(`${url}/__bird-check`);
    await page.evaluate(async (mobile) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createMaterials } = await import('/src/rendering/materials.js');
      const { initialState } = await import('/src/physics.js');
      const { sampleBirdFlight } = await import('/src/world/bird-encounters.js');
      const { disposeSceneResources } = await import('/src/rendering/dispose.js');
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(1280, 800);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      document.body.append(renderer.domElement);
      const scene = new THREE.Scene(),
        materials = createMaterials(),
        state = initialState();
      scene.background = new THREE.Color('#b5c9d2');
      scene.fog = new THREE.FogExp2('#b7c7ce', 0.00031);
      const environment = createEnvironment(scene, renderer, materials, {
        quality: {
          name: mobile ? 'balanced' : 'high',
          shadowSize: 0,
          reflectionSize: mobile ? 0 : 256,
          reflectionInterval: 1,
          clouds: false,
        },
      });
      const camera = new THREE.PerspectiveCamera(47, 1.6, 0.08, 10000);
      environment.update(state, 0);
      window.birdCheck = {
        THREE,
        renderer,
        scene,
        state,
        environment,
        camera,
        sampleBirdFlight,
        time: 0,
        dispose() {
          const excludedTextures = environment.dispose();
          disposeSceneResources(scene, {
            excludedTextures,
            extraMaterials: Object.values(materials),
          });
          renderer.dispose();
          renderer.forceContextLoss();
        },
      };
    }, mobile);
    for (const [species, formation, count] of [
      ['eagle', 'soaring', 1],
      ['gull', 'pair', 2],
      ['cormorant', 'v', 9],
      ['tern', 'loose', 12],
    ]) {
      const result = await page.evaluate(
        ({ species, formation, count }) => {
          const h = window.birdCheck,
            { THREE, renderer, scene, state, environment, camera } = h;
          h.time += 100;
          for (const slot of environment.birdLife.encounters.slots) {
            slot.event = null;
            slot.due = Infinity;
          }
          const event = {
            species,
            formation,
            count,
            start: h.time - 20,
            duration: 40,
            x: state.x + 8,
            z: state.z - 30,
            altitude: formation === 'soaring' ? 32 : formation === 'loose' ? 14 : 24,
            heading: 0.3,
            radius: 32,
            speed: 8,
            seed: 0.4,
          };
          environment.birdLife.encounters.slots[0].event = event;
          environment.update(state, h.time);
          const bounds = new THREE.Box3();
          for (let i = 0; i < count; i++) {
            const p = h.sampleBirdFlight(event, i, h.time);
            bounds.expandByPoint(new THREE.Vector3(p.x, p.y, p.z));
          }
          const center = bounds.getCenter(new THREE.Vector3());
          const offset =
            formation === 'soaring'
              ? new THREE.Vector3(4, -1.4, 6)
              : formation === 'pair'
                ? new THREE.Vector3(4, 3, 12)
                : new THREE.Vector3(10, 12, 28);
          camera.position.copy(center).add(offset);
          camera.lookAt(center);
          renderer.render(scene, camera);
          const visible = {
            calls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
          };
          const group = environment.birdLife.group;
          const actualCount = group.children
            .filter((mesh) => mesh.name.endsWith('bodies'))
            .reduce((sum, mesh) => sum + mesh.count, 0);
          group.visible = false;
          renderer.render(scene, camera);
          const idle = {
            calls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
          };
          group.visible = true;
          renderer.render(scene, camera);
          const matrices = () =>
            JSON.stringify(
              group.children
                .filter((mesh) => mesh.visible)
                .map((mesh) => Array.from(mesh.instanceMatrix.array)),
            );
          const before = matrices();
          environment.update(state, h.time);
          const paused = before === matrices();
          environment.update(state, h.time + 0.2);
          return {
            species,
            formation,
            actualCount,
            visible,
            idle,
            paused,
            animated: before !== matrices(),
            reflections: Boolean(environment.water.isWater),
          };
        },
        { species, formation, count },
      );
      assert.equal(result.actualCount, count);
      assert.equal(result.paused, true);
      assert.equal(result.animated, true);
      assert.equal(result.reflections, !mobile);
      assert.ok(result.visible.calls - result.idle.calls <= (mobile ? 3 : 6));
      assert.ok(result.visible.triangles - result.idle.triangles < (mobile ? 6000 : 12000));
      await page.screenshot({
        path: `${output}/${mobile ? 'mobile' : 'desktop'}-${species}-${formation}.png`,
      });
      results.push({ mobile, ...result });
    }
    const count = await page.evaluate(() => {
      const h = window.birdCheck;
      h.environment.setQuality({
        name: 'minimum',
        shadowSize: 0,
        reflectionSize: h.environment.water.isWater ? 128 : 0,
        reflectionInterval: 4,
        clouds: false,
      });
      h.environment.update(h.state, h.time + 0.3);
      h.renderer.render(h.scene, h.camera);
      return h.environment.birdLife.group.children
        .filter((mesh) => mesh.name.endsWith('bodies'))
        .reduce((sum, mesh) => sum + mesh.count, 0);
    });
    assert.equal(count, 6);
    await page.evaluate(() => window.birdCheck.dispose());
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  console.log(
    'Bird visuals passed: four species, four formations, mobile/desktop water, animation, pause, six-bird fallback and bounded draw calls.',
  );
} finally {
  await browser.close();
}
