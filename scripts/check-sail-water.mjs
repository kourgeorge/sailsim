import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Use the actual yacht meshes, including their normal animation and transforms.
const url = process.env.SAIL_URL || 'http://127.0.0.1:5199';
const output = '/private/tmp/sail-fabric-water-review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.route('**/__sail-water-review', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><style>body{margin:0}canvas{display:block}</style>',
    }),
  );
  for (const mobile of process.argv.includes('--helm-only') ? [] : [false, true]) {
    await page.goto(`${url}/__sail-water-review`);
    const result = await page.evaluate(async (mobile) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createYacht } = await import('/src/rendering/yacht.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createMaterials } = await import('/src/rendering/materials.js');
      const { initialState } = await import('/src/physics.js');
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
          name: 'balanced',
          shadowSize: 0,
          reflectionSize: mobile ? 0 : 256,
          reflectionInterval: 4,
          clouds: true,
        },
      });
      const yacht = createYacht(materials);
      scene.add(yacht.group);
      const state = {
        ...initialState(),
        x: 0,
        z: 0,
        heading: 0,
        apparentWindAngle: 75,
        speed: 6,
        heel: 0,
        mainSheet: 90,
        jibSheet: 0,
        mainFlow: 'Luffing',
        jibFlow: 'Luffing',
        outhaul: 0,
        vang: 0,
      };
      const cloth = (name) =>
        yacht.group
          .getObjectByName(name)
          .children.find((mesh) => mesh.geometry?.attributes.position.count === 703);
      const main = cloth('mainsail-cloth'),
        jib = cloth('headsail-cloth');
      function triangles(mesh) {
        mesh.updateWorldMatrix(true, false);
        const geometry = mesh.geometry;
        return Array.from({ length: geometry.index.count / 3 }, (_, index) => {
          const vertices = [0, 1, 2].map((k) =>
            new THREE.Vector3()
              .fromBufferAttribute(geometry.attributes.position, geometry.index.getX(index * 3 + k))
              .applyMatrix4(mesh.matrixWorld),
          );
          return { vertices, bounds: new THREE.Box3().setFromPoints(vertices) };
        });
      }
      const ray = new THREE.Ray(),
        direction = new THREE.Vector3(),
        hit = new THREE.Vector3(),
        barycentric = new THREE.Vector3();
      function pierces(a, b) {
        for (let i = 0; i < 3; i++) {
          direction.subVectors(a[(i + 1) % 3], a[i]);
          const length = direction.length();
          if (length < 1e-8) continue;
          ray.set(a[i], direction.divideScalar(length));
          if (!ray.intersectTriangle(...b, false, hit)) continue;
          const distance = hit.distanceToSquared(a[i]);
          THREE.Triangle.getBarycoord(hit, ...b, barycentric);
          // Contact along the common mast attachment is not fabric penetration.
          if (
            distance > 1e-10 &&
            distance < length * length - 1e-10 &&
            Math.min(barycentric.x, barycentric.y, barycentric.z) > 1e-7
          )
            return true;
        }
        return false;
      }
      function intersects() {
        const a = triangles(main),
          b = triangles(jib);
        for (const left of a)
          for (const right of b) {
            if (
              left.bounds.intersectsBox(right.bounds) &&
              (pierces(left.vertices, right.vertices) || pierces(right.vertices, left.vertices))
            )
              return true;
          }
        return false;
      }
      const failures = [];
      let time = 0,
        checked = 0;
      if (!mobile)
        for (const side of [-1, 1])
          for (const mainSheet of [0, 45, 75, 90])
            for (const jibSheet of [0, 10, 30, 40, 90]) {
              Object.assign(state, { apparentWindAngle: side * 75, mainSheet, jibSheet });
              yacht.update(state, (time += 10));
              if (intersects()) failures.push({ side, mainSheet, jibSheet });
              checked++;
            }
      Object.assign(state, { apparentWindAngle: 75, mainSheet: 90, jibSheet: 0 });
      yacht.update(state, (time += 10));
      environment.update(state, time);
      environment.excludeHullWater(yacht.group);
      const wake = scene.getObjectByName('Stern wake');
      wake.updateMatrixWorld(true);
      const start = wake.localToWorld(new THREE.Vector3(0, 22.5, 0));
      const camera = new THREE.PerspectiveCamera(47, 1.6, 0.08, 10000);
      camera.position.set(18, 12, 28);
      camera.lookAt(0, 8, -1);
      let wakeReflectionDraws = 0;
      wake.onBeforeRender = (_renderer, _scene, renderCamera) => {
        if (renderCamera !== camera) wakeReflectionDraws++;
      };
      const render = () => renderer.render(scene, camera);
      render();
      window.sailWaterReview = {
        renderer,
        render,
        camera,
        scene,
        yacht,
        environment,
        state,
        stern() {
          state.mainHoist = state.jibHoist = 0;
          yacht.update(state, (time += 10));
          camera.position.set(9, 7, 24);
          camera.lookAt(0, 0.8, 5);
          environment.update(state, time);
          environment.excludeHullWater(yacht.group);
          render();
        },
        frame(index) {
          const t = index / 60;
          yacht.group.position.y = Math.sin(t * 0.8) * 0.045;
          yacht.group.rotation.set(Math.sin(t * 0.95) * 0.005, 0, Math.sin(t * 0.72) * 0.008);
          environment.update(state, t);
          environment.excludeHullWater(yacht.group);
          render();
        },
      };
      return {
        checked,
        failures,
        wakeStart: start.toArray(),
        wakeDepthTest: wake.material.depthTest,
        wakeOffset: wake.material.polygonOffset,
        wakeWritesDepth: wake.material.depthWrite,
        wakeReflectionDraws,
      };
    }, mobile);
    assert.deepEqual(result.failures, [], 'Sail cloth never penetrates the other sail');
    assert.ok(result.wakeStart[2] > 5.85, 'Foam starts beyond the stern and ladder');
    assert.equal(result.wakeDepthTest, true, 'The hull still occludes the wake');
    assert.equal(result.wakeOffset, true);
    assert.equal(result.wakeWritesDepth, false);
    assert.equal(result.wakeReflectionDraws, 0, 'Foam is not duplicated in the water reflection');
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-sails.png` });
    await page.evaluate(() => window.sailWaterReview.stern());
    for (const frame of [0, 1, 2, 3, 4, 30, 60]) {
      await page.evaluate((frame) => window.sailWaterReview.frame(frame), frame);
      await page.screenshot({
        path: `${output}/${mobile ? 'mobile' : 'desktop'}-stern-${frame}.png`,
      });
    }
    console.log(JSON.stringify({ renderer: mobile ? 'mobile' : 'desktop', ...result }));
  }
  await page.goto(`${url}/__sail-water-review`);
  const helm = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { createCatamaran } = await import('/src/rendering/catamaran.js');
    const { createMaterials } = await import('/src/rendering/materials.js');
    const { initialState } = await import('/src/physics.js');
    const { CATAMARAN } = await import('/src/vessels.js');
    const boat = createCatamaran(createMaterials()),
      state = initialState('haven', 'catamaran');
    const screen = boat.group.getObjectByName('helm-multifunction-screen');
    const sheet = boat.group.getObjectByName('mainsheet-tackle');
    const raycaster = new THREE.Raycaster(),
      direction = new THREE.Vector3();
    const { width, height } = screen.geometry.parameters;
    const failures = [];
    let time = 0,
      checked = 0;
    for (const side of [-1, 1])
      for (let mainSheet = 0; mainSheet <= 90; mainSheet += 5)
        for (let traveler = -20; traveler <= 20; traveler += 5) {
          Object.assign(state, { apparentWindAngle: side * 75, mainSheet, traveler });
          boat.update(state, (time += 10));
          boat.group.updateMatrixWorld(true);
          let obscured = false,
            obstruction = null;
          for (const eyeOffset of [-0.1, 0, 0.1]) {
            const eye = new THREE.Vector3(...CATAMARAN.helmEye);
            eye.x += eyeOffset;
            for (let row = 0; row <= 20 && !obscured; row++)
              for (let col = 0; col <= 32 && !obscured; col++) {
                const point = screen.localToWorld(
                  new THREE.Vector3(
                    (col / 32 - 0.5) * (width + 0.12),
                    (row / 20 - 0.5) * (height + 0.12),
                    0,
                  ),
                );
                direction.subVectors(point, eye);
                raycaster.far = direction.length();
                raycaster.set(eye, direction.normalize());
                const hits = raycaster.intersectObject(sheet, false);
                obscured = hits.length > 0;
                if (obscured)
                  obstruction = {
                    eyeOffset,
                    row,
                    col,
                    hit: hits[0].point.toArray(),
                    target: point.toArray(),
                    base: boat.group.getObjectByName('traveler-car').position.toArray(),
                    boomAngle: boat.group.getObjectByName('mainsail-boom').rotation.y,
                  };
              }
          }
          if (obscured) failures.push({ side, mainSheet, traveler, obstruction });
          checked++;
        }
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1280, 800);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.append(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#accbd5');
    scene.add(new THREE.HemisphereLight('#e7f4ff', '#596251', 2));
    const sun = new THREE.DirectionalLight('#fff0dc', 2);
    sun.position.set(-8, 18, -5);
    scene.add(sun, boat.group);
    Object.assign(state, { apparentWindAngle: -75, mainSheet: 90, traveler: -20 });
    boat.update(state, (time += 10));
    const camera = new THREE.PerspectiveCamera(47, 1.6, 0.08, 100);
    camera.position.set(...CATAMARAN.helmEye);
    camera.lookAt(CATAMARAN.helmEye[0], CATAMARAN.helmTargetHeight, -18);
    renderer.render(scene, camera);
    return { checked, failures };
  });
  await page.screenshot({ path: `${output}/catamaran-helm.png` });
  assert.deepEqual(
    helm.failures,
    [],
    'Catamaran mainsheet leaves the helm screen and its margin unobstructed',
  );
  console.log(JSON.stringify({ catamaranHelm: helm }));
  assert.deepEqual(errors, []);
  console.log(`Visual clearance checks passed. Images: ${output}`);
} finally {
  await browser.close();
}
