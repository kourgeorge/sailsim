import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createHelmCamera } from '../src/rendering/helm-camera.js';

function fixture(aspect = 390 / 844) {
  const camera = new THREE.PerspectiveCamera(90, aspect, 0.08, 10000);
  camera.position.set(20, 13, 27);
  const hull = new THREE.Group();
  const helm = createHelmCamera();
  const update = (dt = 1 / 60, orbit = 0, elevation = 0) => {
    const moving = helm.update(camera, hull, { orbit, elevation, smooth: 1 - Math.exp(-dt * 7) });
    hull.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    return moving;
  };
  const settle = (orbit = 0, elevation = 0) => {
    for (let i = 0; i < 240; i++) if (!update(1 / 60, orbit, elevation)) return;
    assert.fail('Camera did not settle');
  };
  // Points on the physical instrument and wheel, expressed in hull coordinates.
  const points = [
    new THREE.Vector3(0, 2.84, 3.87),
    new THREE.Vector3(0.58, 3.18, 3.87),
    new THREE.Vector3(0, 1.97, 4.23),
  ];
  const project = () =>
    points.map((point) => point.clone().applyMatrix4(hull.matrixWorld).project(camera));
  return { camera, hull, helm, update, settle, project };
}

for (const aspect of [390 / 844, 1440 / 1000]) {
  test(`cockpit stays fixed in Helm view through motion and irregular frames at aspect ${aspect}`, () => {
    const f = fixture(aspect);
    f.settle();
    const reference = f.project();
    let time = 0;
    for (let i = 0; i < 360; i++) {
      const dt = [1 / 120, 1 / 60, 1 / 30, 0.12, 0.25][i % 5];
      time += dt;
      const heading = (((350 + time * 6) % 360) * Math.PI) / 180;
      f.hull.position.set(time * 3, Math.sin(time * 0.8) * 0.045, time * -2);
      f.hull.rotation.set(Math.sin(time * 0.95) * 0.005, -heading, Math.sin(time * 0.4) * 0.5);
      const position = f.hull.position.clone(),
        rotation = f.hull.quaternion.clone();
      assert.equal(
        f.update(Math.min(0.1, dt)),
        false,
        'Hull movement does not restart a camera transition',
      );
      for (const [index, point] of f.project().entries()) {
        assert.ok(point.distanceTo(reference[index]) < 1e-10, 'Cockpit point moves on screen');
      }
      assert.deepEqual(f.hull.position, position);
      assert.deepEqual(f.hull.quaternion.toArray(), rotation.toArray());
    }
  });
}

test('entering Helm and looking around ease into position and finish at rest', () => {
  const f = fixture();
  const original = f.camera.position.clone();
  assert.equal(f.update(), true);
  assert.ok(f.camera.position.distanceTo(original) > 0);
  assert.ok(f.camera.position.distanceTo(new THREE.Vector3(0, 3.65, 6.7)) > 1);
  f.settle();
  const before = f.camera.quaternion.clone();
  assert.equal(f.update(1 / 60, 0.6, 0.2), true);
  const firstAngle = before.angleTo(f.camera.quaternion);
  assert.ok(firstAngle > 0);
  f.settle(0.6, 0.2);
  assert.ok(firstAngle < before.angleTo(f.camera.quaternion));
  const direction = new THREE.Vector3(Math.sin(0.6) * 14, 1.7 - 0.2 * 12, -Math.cos(0.6) * 18)
    .sub(f.camera.position)
    .normalize();
  assert.ok(f.camera.getWorldDirection(new THREE.Vector3()).distanceTo(direction) < 1e-10);
  const position = f.camera.position.clone(),
    rotation = f.camera.quaternion.clone();
  for (let i = 0; i < 30; i++) assert.equal(f.update(0.1, 0.6, 0.2), false);
  assert.deepEqual(f.camera.position, position);
  assert.deepEqual(f.camera.quaternion.toArray(), rotation.toArray());
});

test('returning from an external view starts from the current camera pose', () => {
  const f = fixture();
  f.settle();
  f.camera.position.set(18, 15, -20);
  f.camera.lookAt(f.hull.position);
  f.helm.reset();
  const before = f.camera.position.clone();
  f.update();
  assert.ok(f.camera.position.distanceTo(before) < 4, 'Re-entry must not snap to an old Helm pose');
  f.settle();
  assert.ok(f.camera.position.distanceTo(new THREE.Vector3(0, 3.65, 6.7)) < 1e-10);
});
