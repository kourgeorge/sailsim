import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5199';
const output = '/private/tmp/sail-catamaran-water';
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
  await page.route('**/__cat-water', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><style>body{margin:0}</style>',
    }),
  );
  await page.goto(`${url}/__cat-water`);
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { catamaranHullGeometry, catamaranDeckGeometry } =
      await import('/src/rendering/catamaran-hull.js');
    const { installHullWaterExclusion } = await import('/src/rendering/hull-geometry.js');
    const { createWaterGeometry } = await import('/src/rendering/water-geometry.js');
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(1100, 760);
    document.body.append(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ff00ff');
    const boat = new THREE.Group();
    for (const x of [-2.5, 2.5]) {
      for (const geometry of [catamaranHullGeometry(), catamaranDeckGeometry()]) {
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }),
        );
        mesh.position.x = x;
        boat.add(mesh);
      }
    }
    scene.add(boat);
    const material = new THREE.ShaderMaterial({
      vertexShader:
        'varying vec4 worldPosition; void main() { worldPosition=modelMatrix*vec4(position,1.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:
        'varying vec4 worldPosition; void main() { gl_FragColor=vec4(.02,.25,.5,1.0); }',
    });
    const update = installHullWaterExclusion(material, { vesselId: 'catamaran' });
    const water = new THREE.Mesh(createWaterGeometry(207360), material);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.07;
    scene.add(water);
    const camera = new THREE.PerspectiveCamera(47, 1100 / 760, 0.08, 80000);
    const gl = renderer.getContext(),
      baseline = new Uint8Array(1100 * 760 * 4),
      clipped = new Uint8Array(baseline.length);
    const results = [];
    for (const offset of [0, 24000]) {
      camera.position.set(offset + 8, 3, offset + 17);
      camera.lookAt(offset, 0.1, offset);
      for (let frame = 0; frame < 8; frame++) {
        const time = frame * 0.3;
        boat.position.set(offset, Math.sin(time * 0.8) * 0.045, offset);
        boat.rotation.set(
          Math.sin(time * 0.95) * 0.005,
          0.2,
          Math.sin(time * 0.72) * 0.0024 + 0.035,
        );
        update(boat);
        material.uniforms.hullExclusionActive.value = false;
        renderer.render(scene, camera);
        gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, baseline);
        material.uniforms.hullExclusionActive.value = true;
        renderer.render(scene, camera);
        gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, clipped);
        let holes = 0;
        for (let i = 0; i < baseline.length; i += 4)
          if (
            clipped[i] > 180 &&
            clipped[i + 1] < 80 &&
            clipped[i + 2] > 180 &&
            clipped[i] > baseline[i] + 20
          )
            holes++;
        results.push({ offset, frame, holes });
      }
    }
    return results;
  });
  console.log(JSON.stringify(result));
  await page.screenshot({ path: `${output}/waterline-mask.png` });
  assert.ok(
    result.every((frame) => frame.holes < 10),
    'The water mask must not open gaps around either hull',
  );
  for (const mobile of [true, false]) {
    await page.goto(`${url}/__cat-water`);
    const wakeResult = await page.evaluate(async (mobile) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createCatamaran } = await import('/src/rendering/catamaran.js');
      const { createMaterials } = await import('/src/rendering/materials.js');
      const { initialState } = await import('/src/physics.js');
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(1100, 760);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      document.body.append(renderer.domElement);
      const scene = new THREE.Scene(),
        materials = createMaterials();
      scene.background = new THREE.Color('#b5c9d2');
      scene.fog = new THREE.FogExp2('#b7c7ce', 0.00031);
      const environment = createEnvironment(scene, renderer, materials, {
        vesselId: 'catamaran',
        quality: {
          name: 'balanced',
          shadowSize: 0,
          reflectionSize: mobile ? 0 : 256,
          reflectionInterval: 4,
          clouds: false,
        },
      });
      const yacht = createCatamaran(materials);
      scene.add(yacht.group);
      const state = {
        ...initialState('haven', 'catamaran'),
        x: 0,
        z: 0,
        heading: 0,
        speed: 6,
        mainHoist: 0,
        jibHoist: 0,
      };
      const camera = new THREE.PerspectiveCamera(47, 1100 / 760, 0.08, 10000);
      const wakes = scene.children.filter((mesh) => mesh.name === 'Stern wake');
      let reflectionDraws = 0;
      for (const wake of wakes)
        wake.onBeforeRender = (_r, _s, c) => {
          if (c !== camera) reflectionDraws++;
        };
      const gl = renderer.getContext(),
        shown = new Uint8Array(1100 * 760 * 4),
        hidden = new Uint8Array(shown.length),
        frames = [];
      for (let frame = 0; frame < 8; frame++) {
        const time = frame / 10;
        state.heading = frame * 3;
        state.x = time * 2;
        yacht.update(state, time);
        yacht.group.position.set(state.x, Math.sin(time * 0.8) * 0.045, state.z);
        yacht.group.rotation.set(
          Math.sin(time * 0.95) * 0.005,
          (-state.heading * Math.PI) / 180,
          Math.sin(time * 0.72) * 0.0024,
        );
        environment.update(state, time);
        environment.excludeHullWater(yacht.group);
        camera.position.set(state.x + 9, 4, state.z + 24);
        camera.lookAt(state.x, 0.3, state.z + 9);
        renderer.render(scene, camera);
        gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, shown);
        // Hold the reflection map still while measuring the two surface trails.
        const before = environment.water.onBeforeRender;
        environment.water.onBeforeRender = () => {};
        const counts = [];
        for (const wake of wakes) {
          wake.visible = false;
          renderer.render(scene, camera);
          gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, hidden);
          let pixels = 0;
          for (let i = 0; i < shown.length; i += 4)
            if (shown[i] > hidden[i] + 2 && shown[i + 1] > hidden[i + 1] + 2) pixels++;
          counts.push(pixels);
          wake.visible = true;
        }
        environment.water.onBeforeRender = before;
        frames.push(counts);
      }
      renderer.render(scene, camera);
      return { frames, reflectionDraws };
    }, mobile);
    console.log(JSON.stringify({ mobile, ...wakeResult }));
    await page.screenshot({ path: `${output}/${mobile ? 'mobile' : 'desktop'}-stern.png` });
    assert.equal(wakeResult.reflectionDraws, 0);
    assert.ok(
      wakeResult.frames.every(
        (counts) => counts.length === 2 && counts.every((count) => count > 100),
      ),
      'Both trails remain visible while moving, turning and rocking',
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
