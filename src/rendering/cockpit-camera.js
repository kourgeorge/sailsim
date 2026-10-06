import * as THREE from 'three';
import { createHullCamera } from './hull-camera.js';

export function createCockpitCamera() {
  const follow = createHullCamera();
  const eye = new THREE.Vector3();
  const target = new THREE.Vector3(0, 1.5, 1);
  return {
    reset: follow.reset,
    update(camera, hull, { orbit, elevation, zoom, smooth }) {
      // Keep the existing exterior cockpit framing, including portrait space.
      const framing = Math.max(1, 0.85 / camera.aspect);
      eye
        .set(7 * Math.cos(orbit), 4.5 + elevation * 5, 6 + Math.sin(orbit) * 7)
        .multiplyScalar(zoom * framing)
        .add(target);
      return follow.update(camera, hull, { eye, target, smooth });
    },
  };
}
