import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5207';
const output = '/tmp/sail-scenic-encounters';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
const errors = [],
  results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.route('**/__scenic-review', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<style>body{margin:0}canvas{display:block}</style>',
    }),
  );
  for (const mobile of process.argv.includes('--interaction-only') ? [] : [false, true]) {
    await page.goto(`${url}/__scenic-review`);
    await page.evaluate(async (mobile) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createMaterials, seededRandom } = await import('/src/rendering/materials.js');
      const { createYacht } = await import('/src/rendering/yacht.js');
      const { initialState } = await import('/src/physics.js');
      const { sampleBirdFlight } = await import('/src/world/bird-encounters.js');
      const { disposeSceneResources } = await import('/src/rendering/dispose.js');
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(1440, 900);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      document.body.append(renderer.domElement);
      const scene = new THREE.Scene(),
        materials = createMaterials(),
        state = initialState('fjord');
      scene.background = new THREE.Color('#b5c9d2');
      scene.fog = new THREE.FogExp2('#b7c7ce', 0.00031);
      const environment = createEnvironment(scene, renderer, materials, {
        locationId: 'fjord',
        quality: {
          name: mobile ? 'minimum' : 'high',
          shadowSize: 0,
          reflectionSize: mobile ? 0 : 256,
          reflectionInterval: 1,
          clouds: true,
        },
      });
      const camera = new THREE.PerspectiveCamera(47, 1.6, 0.08, 10000),
        yacht = createYacht(materials);
      yacht.group.position.set(state.x, 0, state.z);
      yacht.update(state, 0);
      scene.add(yacht.group);
      environment.excludeHullWater(yacht.group);
      environment.update(state, 0);
      window.review = {
        THREE,
        renderer,
        scene,
        state,
        environment,
        camera,
        sampleBirdFlight,
        yacht,
        time: 0,
        draw() {
          camera.updateMatrixWorld(true);
          renderer.render(scene, camera);
        },
        dispose() {
          disposeSceneResources(scene, {
            excludedTextures: environment.dispose(),
            extraMaterials: Object.values(materials),
          });
          renderer.dispose();
          renderer.forceContextLoss();
        },
      };
    }, mobile);
    await page.evaluate(() => {
      const h = window.review;
      h.camera.position.set(-80, 28, 1080);
      h.camera.lookAt(0, 160, -800);
      h.draw();
    });
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-fjord.png` });
    if (!mobile && process.argv.includes('--capture-background')) {
      const data = await page.evaluate(
        () => window.review.renderer.domElement.toDataURL('image/webp', 0.91).split(',')[1],
      );
      await writeFile(
        new URL('../public/section-backgrounds/fjord.webp', import.meta.url),
        Buffer.from(data, 'base64'),
      );
    }
    for (const kind of ['dolphin', 'fish', 'turtle']) {
      const result = await page.evaluate((kind) => {
        const h = window.review,
          { THREE, environment, state, camera } = h;
        h.time += 50;
        environment.update(state, h.time);
        for (const slot of environment.marineLife.encounters.slots) {
          slot.event = null;
          slot.due = Infinity;
        }
        for (const slot of environment.birdLife.encounters.slots) {
          slot.event = null;
          slot.due = Infinity;
        }
        const slot = environment.marineLife.encounters.slots.find((slot) => slot.kind === kind);
        slot.event = {
          kind,
          close: true,
          x: state.x,
          z: state.z - 24,
          heading: 0.6,
          vx: 1.2,
          vz: -1.4,
          start: h.time - 1.6,
          duration: 22,
          seed: 0.4,
        };
        environment.update(state, h.time);
        const name =
          kind === 'dolphin' ? 'Dolphins' : kind === 'fish' ? 'Surface fish' : 'Sea turtles';
        const mesh = h.scene.getObjectByName(name),
          matrix = new THREE.Matrix4();
        mesh.getMatrixAt(0, matrix);
        const point = new THREE.Vector3().setFromMatrixPosition(matrix);
        const distance = kind === 'dolphin' ? 6 : kind === 'fish' ? 2.2 : 3.5;
        camera.position
          .copy(point)
          .add(new THREE.Vector3(distance, distance * 0.5, distance * 0.3));
        camera.lookAt(point.x, Math.max(0.15, point.y), point.z);
        h.draw();
        const before = Array.from(mesh.instanceMatrix.array);
        environment.update(state, h.time);
        h.draw();
        return {
          kind,
          mobile: !environment.water.isWater,
          count: mesh.count,
          paused: JSON.stringify(before) === JSON.stringify(Array.from(mesh.instanceMatrix.array)),
          calls: h.renderer.info.render.calls,
          triangles: h.renderer.info.render.triangles,
        };
      }, kind);
      assert.ok(result.count > 0);
      assert.ok(result.paused);
      results.push(result);
      await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-${kind}.png` });
    }
    await page.evaluate(() => {
      const h = window.review,
        original = { x: h.state.x, z: h.state.z };
      h.state.x = 250;
      h.state.z = 740;
      let landing = null;
      for (let time = h.time + 1; time < h.time + 2500; time++) {
        h.environment.birdLife.update(h.state, time);
        const event = h.environment.birdLife.encounters.slots.find(
          (slot) => slot.event?.landing,
        )?.event;
        if (event) {
          landing = event;
          h.time = time + 19;
          break;
        }
      }
      if (!landing) throw new Error('No bird landed on the fjord island');
      h.environment.update(h.state, h.time);
      const point = h.sampleBirdFlight(landing, 0, h.time);
      h.camera.position.set(point.x + 2, point.y + 1.2, point.z + 3);
      h.camera.lookAt(point.x, point.y, point.z);
      h.draw();
      Object.assign(h.state, original);
    });
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-landing.png` });
    await page.evaluate(() => {
      const h = window.review,
        matrix = new h.THREE.Matrix4();
      h.environment.landDetails.flowers.getMatrixAt(0, matrix);
      const point = new h.THREE.Vector3().setFromMatrixPosition(matrix);
      h.camera.position.copy(point).add(new h.THREE.Vector3(2, 1.6, 3));
      h.camera.lookAt(point.x, point.y + 0.2, point.z);
      h.draw();
    });
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-flowers.png` });
    const cruise = await page.evaluate(() => {
      const h = window.review;
      let found = false;
      for (let time = h.time + 1; time < h.time + 2500; time++) {
        h.environment.cruiseShip.update(h.state, time, null, true);
        if (h.environment.cruiseShip.encounters.event) {
          found = true;
          break;
        }
      }
      if (!found) throw new Error('Cruise ship did not find a passage');
      const ship = h.environment.cruiseShip,
        event = ship.encounters.event;
      event.age = event.duration / 2;
      ship.update(h.state, event.start, null, true);
      h.yacht.group.visible = false;
      h.camera.position.copy(ship.group.position).add(new h.THREE.Vector3(205, 50, 175));
      h.camera.lookAt(ship.group.position.x, 18, ship.group.position.z);
      h.draw();
      return {
        decks: event.decks,
        count: h.scene.getObjectByName('Cruise tourists').count,
        calls: h.renderer.info.render.calls,
        triangles: h.renderer.info.render.triangles,
      };
    });
    results.push({ mobile, cruise });
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-cruise.png` });
    await page.evaluate(() => window.review.dispose());
  }
  for (const mobile of process.argv.includes('--scenery-only') ? [] : [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const app = await context.newPage();
    app.on('pageerror', (error) => errors.push(error.message));
    await app.goto(url);
    await app.locator(mobile ? '[data-section="explore"]' : '[data-mode="explore"]').click();
    if (mobile) await app.locator('#cover-browser-title').click();
    await app.locator('[data-cover-location="fjord"]').click();
    assert.equal(await app.locator('#cover-location-name').textContent(), 'Norwegian Fjords');
    const preview = await app
      .locator('[data-cover-location="fjord"] img')
      .evaluate((img) => ({ loaded: img.complete && img.naturalWidth > 0 }));
    assert.ok(preview.loaded);
    await app.locator('#cover-start-free').click();
    await app.locator('#play').click();
    await app.waitForFunction(
      () => document.querySelector('#scene').dataset.renderPending === 'false',
      null,
      { timeout: 90000 },
    );
    const visualTime = await app.locator('#scene').getAttribute('data-visual-time');
    const bounds = await app.locator('#scene > canvas').boundingBox();
    const x = bounds.x + bounds.width * 0.45,
      y = bounds.y + bounds.height * 0.45;
    for (let i = 0; i < 5; i++) {
      if (mobile) await app.touchscreen.tap(x, y);
      else await app.mouse.click(x, y);
    }
    assert.equal(await app.locator('#scene').getAttribute('data-secret-encounters'), '1');
    await app.waitForFunction(
      () => Number(document.querySelector('#scene').dataset.wildlife) > 0,
      null,
      { timeout: 15000 },
    );
    assert.equal(
      await app.locator('#scene').getAttribute('data-visual-time'),
      visualTime,
      'Secret appears while paused without advancing physics',
    );
    await app.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-secret-app.png` });
    results.push({ mobile, secretTap: true, paused: true, preview: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
}
