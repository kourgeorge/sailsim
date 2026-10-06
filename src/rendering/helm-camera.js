import * as THREE from 'three';
import { createHullCamera } from './hull-camera.js';

export function createHelmCamera({ helmEye = [0, 3.65, 6.7], helmTargetHeight = 1.7 } = {}) {
  const follow = createHullCamera();
  const eye = new THREE.Vector3(...helmEye);
  const target = new THREE.Vector3();
  return {
    reset: follow.reset,
    update(camera, hull, { orbit, elevation, smooth }) {
      target.set(
        helmEye[0] + Math.sin(orbit) * 14,
        helmTargetHeight - elevation * 12,
        -Math.cos(orbit) * 18,
      );
      return follow.update(camera, hull, { eye, target, smooth });
    },
  };
}
