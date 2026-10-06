import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCockpitCamera } from '../src/rendering/cockpit-camera.js';

function fixture(aspect) {
  const camera = new THREE.PerspectiveCamera(66, aspect, 0.08, 80000);
  camera.position.set(20, 13, 27);
  const hull = new THREE.Group(),
    follow = createCockpitCamera();
  const controls = { orbit: 0.1, elevation: 0, zoom: 1 };
  const update = (dt = 1 / 60) => {
    const moving = follow.update(camera, hull, { ...controls, smooth: 1 - Math.exp(-dt * 7) });
    hull.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    return moving;
  };
  const settle = () => {
    for (let i = 0; i < 240; i++) if (!update()) return;
    assert.fail('Camera did not settle');
  };
  const points = [
    [0, 2, 4],
    [1.8, 1.6, 2.5],
    [-1.8, 1.6, 2.5],
  ];
  const project = () =>
    points.map((p) => new THREE.Vector3(...p).applyMatrix4(hull.matrixWorld).project(camera));
  return { camera, hull, follow, controls, update, settle, project };
}

for (const aspect of [1366 / 768, 390 / 844]) {
  test(`cockpit fittings stay steady through turns, waves and irregular frames at ${aspect}`, () => {
    const f = fixture(aspect);
    f.settle();
    const reference = f.project();
    let time = 0;
    for (let i = 0; i < 120; i++) {
      const dt = [1 / 120, 1 / 60, 1 / 30, 0.12, 0.25][i % 5];
      time += dt;
      f.hull.position.set(18000 + time * 3, Math.sin(time * 0.8) * 0.045, -20000 - time * 2);
      f.hull.rotation.set(
        Math.sin(time) * 0.005,
        (-((350 + time * 6) % 360) * Math.PI) / 180,
        Math.sin(time * 0.4) * 0.4,
      );
      const position = f.hull.position.clone(),
        rotation = f.hull.quaternion.clone();
      assert.equal(f.update(Math.min(dt, 0.1)), false);
      for (const [index, point] of f.project().entries()) {
        assert.ok(point.distanceTo(reference[index]) < 1e-9, 'Cockpit shifts relative to camera');
      }
      assert.deepEqual(f.hull.position, position);
      assert.deepEqual(f.hull.quaternion.toArray(), rotation.toArray());
    }
  });
}

test('cockpit orbit and zoom ease, settle and reset on reentry', () => {
  const f = fixture(1366 / 768);
  f.settle();
  const before = f.camera.position.clone();
  f.controls.orbit = 0.8;
  f.controls.zoom = 1.4;
  assert.equal(f.update(), true);
  const firstStep = f.camera.position.distanceTo(before);
  f.settle();
  assert.ok(firstStep > 0 && firstStep < f.camera.position.distanceTo(before));
  for (let i = 0; i < 5; i++) assert.equal(f.update(), false);
  f.camera.position.set(18, 15, -20);
  f.camera.lookAt(f.hull.position);
  f.follow.reset();
  const start = f.camera.position.clone();
  assert.equal(f.update(), true);
  assert.ok(f.camera.position.distanceTo(start) < 5, 'Reentry should not snap to an old pose');
  f.settle();
});
