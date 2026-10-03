import * as THREE from 'three';

// An onboard camera must share the hull's transform on the same frame. Damping
// its world position makes the pedestal move relative to the viewer whenever
// the boat turns or frame intervals vary. Only damp the view inside the boat.
export function createHelmCamera({helmEye=[0,3.65,6.7],helmTargetHeight=1.7}={}) {
  const eye = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const desiredEye = new THREE.Vector3(...helmEye);
  const target = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const inverseHull = new THREE.Quaternion();
  const desiredRotation = new THREE.Quaternion();
  const look = new THREE.Matrix4();
  let attached = false;

  return {
    reset() {
      attached = false;
    },
    update(camera, hull, { orbit, elevation, smooth }) {
      if (!attached) {
        inverseHull.copy(hull.quaternion).invert();
        eye.copy(camera.position).sub(hull.position).applyQuaternion(inverseHull);
        rotation.copy(inverseHull).multiply(camera.quaternion);
        attached = true;
      }
      target.set(helmEye[0]+Math.sin(orbit) * 14, helmTargetHeight - elevation * 12, -Math.cos(orbit) * 18);
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
