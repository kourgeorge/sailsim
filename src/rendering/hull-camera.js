import * as THREE from 'three';

// Follow the hull on the same frame. Interpolate only the viewer's local pose;
// damping a moving world-space eye while aiming at the hull produces jitter.
export function createHullCamera() {
  const eye = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const inverseHull = new THREE.Quaternion();
  const desiredRotation = new THREE.Quaternion();
  const look = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);
  let attached = false;
  return {
    reset() {
      attached = false;
    },
    update(camera, hull, { eye: desiredEye, target, smooth }) {
      if (!attached) {
        inverseHull.copy(hull.quaternion).invert();
        eye.copy(camera.position).sub(hull.position).applyQuaternion(inverseHull);
        rotation.copy(inverseHull).multiply(camera.quaternion);
        attached = true;
      }
      desiredRotation.setFromRotationMatrix(look.lookAt(desiredEye, target, up));
      eye.lerp(desiredEye, smooth);
      rotation.slerp(desiredRotation, smooth);
      const moving =
        eye.distanceToSquared(desiredEye) > 1e-6 || rotation.angleTo(desiredRotation) > 1e-5;
      if (!moving) {
        eye.copy(desiredEye);
        rotation.copy(desiredRotation);
      }
      camera.position.copy(eye).applyQuaternion(hull.quaternion).add(hull.position);
      camera.quaternion.copy(hull.quaternion).multiply(rotation);
      return moving;
    },
  };
}
