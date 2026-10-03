import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Render the real destination geometry once, at publication quality. Browsing
// uses compressed images and does not start a second live WebGL scene.
const url = process.argv.find((argument) => /^https?:/.test(argument)) || 'http://127.0.0.1:5199';
const output = new URL('../public/destination-previews/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
try {
  const page = await browser.newPage({ viewport: { width: 2100, height: 1400 } });
  await page.route('**/__destination-capture', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<style>body{margin:0}canvas{display:block}</style>',
    }),
  );
  const labels = {};
  for (const id of ['haven', 'shelter', 'strait']) {
    await page.goto(`${url}/__destination-capture`);
    const result = await page.evaluate(async (id) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { createEnvironment } = await import('/src/rendering/environment.js');
      const { createMaterials } = await import('/src/rendering/materials.js');
      const { createYacht } = await import('/src/rendering/yacht.js');
      const { syncBodyTransform } = await import('/src/rendering/body-motion.js');
      const { getWorldBodyDefinitions } = await import('/src/world/bodies.js');
      const { getLocation } = await import('/src/locations.js');
      const { initialState } = await import('/src/physics.js');
      const { islandHeight } = await import('/src/rendering/geography.js');
      const location = getLocation(id),
        state = initialState(id);
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(2100, 1400);
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.body.append(renderer.domElement);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#adc7d0');
      const materials = createMaterials();
      const environment = createEnvironment(scene, renderer, materials, {
        locationId: id,
        quality: { shadowSize: 4096, reflectionSize: 1024, reflectionInterval: 1, clouds: true },
      });
      const yacht = createYacht(materials);
      yacht.group.position.set(state.x, 0, state.z);
      yacht.group.rotation.y = (-state.heading * Math.PI) / 180;
      yacht.update(state, 12);
      scene.add(yacht.group);
      environment.excludeHullWater(yacht.group);
      const template = createYacht(materials, { detailed: false }).group;
      getWorldBodyDefinitions(id)
        .filter((body) => body.visual.type === 'yacht')
        .forEach((body, index) => {
          const boat = template.clone(true);
          boat.scale.setScalar(body.visual.scale);
          syncBodyTransform(boat, body, 0, 12, index);
          scene.add(boat);
        });
      environment.update(state, 12);
      const center = new THREE.Vector3(location.chart.centerX, 0, location.chart.centerZ);
      const span = location.chart.span;
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 12000);
      camera.position.copy(center).add(new THREE.Vector3(span * 0.12, span * 1.1, span * 0.56));
      camera.lookAt(center);
      camera.updateMatrixWorld(true);
      const bounds = new THREE.Box3();
      for (const island of location.islands) {
        for (const x of [-1, 1])
          for (const z of [-1, 1])
            for (const y of [0, island.height]) {
              bounds.expandByPoint(
                new THREE.Vector3(
                  island.x + x * island.rx * 1.12,
                  y,
                  island.z + z * island.rz * 1.12,
                ).applyMatrix4(camera.matrixWorldInverse),
              );
            }
      }
      const size = bounds.getSize(new THREE.Vector3()),
        projectedCenter = bounds.getCenter(new THREE.Vector3());
      const height = Math.max(size.y, size.x / 1.5) * 1.08;
      camera.left = projectedCenter.x - height * 0.75;
      camera.right = projectedCenter.x + height * 0.75;
      camera.top = projectedCenter.y + height / 2;
      camera.bottom = projectedCenter.y - height / 2;
      camera.updateProjectionMatrix();
      const sun = scene.children.find((object) => object.isDirectionalLight);
      sun.position.copy(center).add(new THREE.Vector3(-span * 0.6, span, -span * 0.7));
      sun.target.position.copy(center);
      Object.assign(sun.shadow.camera, {
        left: -span,
        right: span,
        top: span,
        bottom: -span,
        near: 1,
        far: span * 4,
      });
      sun.shadow.camera.updateProjectionMatrix();
      sun.shadow.normalBias = 0.25;
      sun.shadow.bias = -0.00008;
      sun.shadow.needsUpdate = true;
      const project = (x, y, z) => {
        const point = new THREE.Vector3(x, y, z).project(camera);
        return {
          x: Number(((point.x + 1) * 50).toFixed(2)),
          y: Number(((1 - point.y) * 50).toFixed(2)),
        };
      };
      const landmarks = [];
      if (location.lighthouse) {
        const lighthouse = location.lighthouse;
        landmarks.push({
          label: 'Lighthouse',
          ...project(
            lighthouse.x,
            islandHeight(lighthouse.x, lighthouse.z, location.islands[lighthouse.islandIndex]) + 24,
            lighthouse.z,
          ),
        });
      }
      if (location.marina)
        landmarks.push({ label: 'Marina', ...project(location.marina.x, 2, location.marina.z) });
      for (let frame = 0; frame < 3; frame++) renderer.render(scene, camera);
      return { image: renderer.domElement.toDataURL('image/webp', 0.94).split(',')[1], landmarks };
    }, id);
    await writeFile(new URL(`${id}.webp`, output), Buffer.from(result.image, 'base64'));
    labels[id] = result.landmarks;
    console.log(`Captured ${id}.webp`);
  }
  await writeFile(
    new URL('../src/navigation/destination-landmarks.json', import.meta.url),
    JSON.stringify(labels, null, 2) + '\n',
  );
} finally {
  await browser.close();
}
