import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function coloredGeometry(geometry, color) {
  const result = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  geometry.dispose();
  result.deleteAttribute('uv');
  const tint = new THREE.Color(color);
  const colors = new Float32Array(result.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) colors.set([tint.r, tint.g, tint.b], i);
  result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return result;
}

export function sceneryBuilder() {
  const parts = [];
  return {
    add(geometry, color) {
      parts.push(coloredGeometry(geometry, color));
    },
    oval(color, x, y, z, sx, sy, sz, detail = 1) {
      const geometry = new THREE.IcosahedronGeometry(1, detail);
      geometry.scale(sx, sy, sz);
      geometry.translate(x, y, z);
      parts.push(coloredGeometry(geometry, color));
    },
    box(color, x, y, z, w, h, d) {
      const geometry = new THREE.BoxGeometry(w, h, d);
      geometry.translate(x, y, z);
      parts.push(coloredGeometry(geometry, color));
    },
    finish() {
      const geometry = mergeGeometries(parts);
      parts.forEach((part) => part.dispose());
      return geometry;
    },
  };
}
