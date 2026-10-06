import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const url = process.env.SAIL_URL || 'http://127.0.0.1:5199';
const output = '/private/tmp/sail-catamaran-water';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-webgl'] });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  await page.route('**/__cat-water', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><style>body{margin:0}</style>' }));
  await page.goto(`${url}/__cat-water`);
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { catamaranHullGeometry, catamaranDeckGeometry } = await import('/src/rendering/catamaran-hull.js');
    const { installHullWaterExclusion } = await import('/src/rendering/hull-geometry.js');
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(1100, 760);
    document.body.append(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ff00ff');
    const boat = new THREE.Group();
    for (const x of [-2.5, 2.5]) {
      for (const geometry of [catamaranHullGeometry(), catamaranDeckGeometry()]) {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }));
        mesh.position.x = x;
        boat.add(mesh);
      }
    }
    scene.add(boat);
    const material = new THREE.ShaderMaterial({
      vertexShader: 'varying vec4 worldPosition; void main() { worldPosition=modelMatrix*vec4(position,1.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'varying vec4 worldPosition; void main() { gl_FragColor=vec4(.02,.25,.5,1.0); }',
    });
    const update = installHullWaterExclusion(material, { vesselId: 'catamaran' });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(160000, 160000, 128, 128), material);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -.07;
    scene.add(water);
    const camera = new THREE.PerspectiveCamera(47, 1100 / 760, .08, 80000);
    const gl = renderer.getContext(), baseline = new Uint8Array(1100 * 760 * 4), clipped = new Uint8Array(baseline.length);
    const results = [];
    for (const offset of [0, 24000]) {
      camera.position.set(offset + 8, 3, offset + 17);
      camera.lookAt(offset, .1, offset);
      for (let frame = 0; frame < 8; frame++) {
        const time = frame * .3;
        boat.position.set(offset, Math.sin(time * .8) * .045, offset);
        boat.rotation.set(Math.sin(time * .95) * .005, .2, Math.sin(time * .72) * .0024 + .035);
        update(boat);
        material.uniforms.hullExclusionActive.value = false;
        renderer.render(scene, camera);
        gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, baseline);
        material.uniforms.hullExclusionActive.value = true;
        renderer.render(scene, camera);
        gl.readPixels(0, 0, 1100, 760, gl.RGBA, gl.UNSIGNED_BYTE, clipped);
        let holes = 0;
        for (let i = 0; i < baseline.length; i += 4)
          if (clipped[i] > baseline[i] + 20 && clipped[i + 2] > baseline[i + 2] + 20) holes++;
        results.push({ offset, frame, holes });
      }
    }
    return results;
  });
  console.log(JSON.stringify(result));
  await page.screenshot({ path: `${output}/waterline-mask.png` });
} finally {
  await browser.close();
}
