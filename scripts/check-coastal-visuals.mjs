import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5199';
const output = process.env.SAIL_SCENERY_OUTPUT || '/tmp/sail-coastal-visuals';
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
  await page.route('**/__coastal-check', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><style>body{margin:0}canvas{display:block}</style>',
    }),
  );
  for (const mobile of [true, false]) {
    await page.goto(`${url}/__coastal-check`);
    await page.evaluate(async (mobile) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createMaterials } = await import('/src/rendering/materials.js');
      const { createYacht } = await import('/src/rendering/yacht.js');
      const { initialState } = await import('/src/physics.js');
      const { createChartRenderer } = await import('/src/navigation/chart.js');
      const { disposeSceneResources } = await import('/src/rendering/dispose.js');
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(1280, 800);
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
          name: mobile ? 'balanced' : 'high',
          shadowSize: 0,
          reflectionSize: mobile ? 0 : 256,
          reflectionInterval: 1,
          clouds: false,
        },
      });
      const state = initialState(),
        yacht = createYacht(materials);
      yacht.group.position.set(state.x, 0, state.z);
      yacht.group.rotation.y = (-state.heading * Math.PI) / 180;
      yacht.update(state, 0);
      scene.add(yacht.group);
      environment.excludeHullWater(yacht.group);
      const camera = new THREE.PerspectiveCamera(47, 1.6, 0.08, 10000);
      const drawChart = createChartRenderer({
        getState: () => state,
        getTraining: () => null,
        getChallengeIndex: () => 0,
      });
      const chart = document.createElement('canvas');
      chart.width = 1280;
      chart.height = 800;
      window.coastalCheck = {
        THREE,
        scene,
        renderer,
        environment,
        state,
        yacht,
        camera,
        time: 0,
        drawChart,
        chart,
        initialState,
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
      environment.update(state, 0);
    }, mobile);
    for (const kind of ['Dolphins', 'Surface fish']) {
      const result = await page.evaluate((kind) => {
        const h = window.coastalCheck,
          { THREE, scene, renderer, environment, state, camera } = h;
        const animals = scene.getObjectByName(kind),
          matrix = new THREE.Matrix4(),
          point = new THREE.Vector3();
        let found = false;
        for (let i = 0; i < 1800; i++) {
          h.time += 0.1;
          environment.update(state, h.time);
          if (animals.count < (kind === 'Dolphins' ? 3 : 6)) continue;
          animals.getMatrixAt(0, matrix);
          point.setFromMatrixPosition(matrix);
          if (point.y > 0.2) {
            found = true;
            break;
          }
        }
        if (!found) throw new Error(`No surfaced ${kind}`);
        camera.position.copy(point).add(new THREE.Vector3(8, 4, 8));
        camera.lookAt(point.x, 0, point.z);
        renderer.render(scene, camera);
        const visible = {
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        };
        environment.marineLife.group.visible = false;
        renderer.render(scene, camera);
        const idle = {
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        };
        environment.marineLife.group.visible = true;
        renderer.render(scene, camera);
        const before = Array.from(animals.instanceMatrix.array);
        for (let i = 0; i < 5; i++) environment.update(state, h.time);
        return {
          kind,
          time: h.time,
          count: animals.count,
          visible,
          idle,
          paused:
            JSON.stringify(before) === JSON.stringify(Array.from(animals.instanceMatrix.array)),
          reflections: Boolean(environment.water.isWater),
        };
      }, kind);
      assert.equal(result.paused, true);
      assert.equal(result.reflections, !mobile);
      assert.ok(
        result.visible.calls - result.idle.calls <= 6,
        'Wildlife adds at most three draws per water/render pass',
      );
      assert.ok(
        result.visible.triangles - result.idle.triangles < 5000,
        'Wildlife has a small fixed geometry budget',
      );
      await page.screenshot({
        path: `${output}/${mobile ? 'mobile' : 'desktop'}-${kind.replaceAll(' ', '-')}.png`,
      });
      results.push({ mobile, ...result });
    }
    const reduced = await page.evaluate(() => {
      const h = window.coastalCheck;
      h.environment.setQuality({
        name: 'minimum',
        shadowSize: 0,
        reflectionSize: h.environment.water.isWater ? 128 : 0,
        reflectionInterval: 4,
        clouds: false,
      });
      h.environment.update(h.state, h.time + 0.1);
      h.renderer.render(h.scene, h.camera);
      return {
        dolphins: h.scene.getObjectByName('Dolphins').count,
        fish: h.scene.getObjectByName('Surface fish').count,
      };
    });
    assert.ok(reduced.dolphins <= 2 && reduced.fish <= 6);
    if (mobile)
      for (const id of ['haven', 'shelter', 'strait']) {
        await page.evaluate((id) => {
          const h = window.coastalCheck;
          Object.assign(h.state, h.initialState(id));
          h.renderer.domElement.style.display = 'none';
          document.body.append(h.chart);
          h.drawChart(h.chart);
        }, id);
        await page.screenshot({ path: `${output}/chart-${id}.png` });
      }
    await page.evaluate(() => window.coastalCheck.dispose());
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  console.log(
    'Coastal visuals passed: desktop/mobile water, surfaced dolphins/fish, paused motion, reduced detail, chart landmarks and bounded draw calls.',
  );
} finally {
  await browser.close();
}
