import * as THREE from 'three';

export function createWaterGeometry(span) {
  // Huge single triangles lose interpolation/depth precision beside the hull
  // and wake. Keep the surface in smaller patches with a bounded vertex budget.
  const segments = Math.min(128, Math.ceil(span / 1000));
  return new THREE.PlaneGeometry(span, span, segments, segments);
}
