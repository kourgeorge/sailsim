import * as THREE from 'three';
import { CATAMARAN } from '../vessels.js';

export function catamaranSection(z) {
  const sections = CATAMARAN.sections;
  let width = sections.at(-1)[1];
  for (let i = 1; i < sections.length; i++)
    if (z <= sections[i][0]) {
      const [az, aw] = sections[i - 1],
        [bz, bw] = sections[i];
      width = THREE.MathUtils.lerp(aw, bw, (z - az) / (bz - az));
      break;
    }
  const sheer = z > 4 ? 1.3 - (z - 4) * 0.5 : 1.3 + 0.18 * (Math.max(0, -z) / 6) ** 2;
  const depth = sheer + 0.7 * (1 - 0.8 * (Math.abs(z) / 6) ** 3);
  return { width, sheer, depth };
}
export function insideCatamaranHull({ x, y, z }) {
  if (z < -6 || z > 6) return false;
  const { width, sheer, depth } = catamaranSection(z),
    s = (sheer - y) / depth;
  return (
    s >= 0 &&
    s <= 1 &&
    Math.abs(Math.abs(x) - CATAMARAN.hullSpacing / 2) <
      width * (1 - 0.07 * s) * Math.sqrt(1 - s * s)
  );
}
export function catamaranHullGeometry() {
  const positions = [],
    uv = [],
    indices = [],
    rows = 96,
    cols = 32;
  for (let i = 0; i <= rows; i++) {
    const z = -6 + (12 * i) / rows,
      { width, sheer, depth } = catamaranSection(z);
    for (let j = 0; j <= cols; j++) {
      const a = (j / cols) * Math.PI,
        d = Math.sin(a);
      positions.push(Math.cos(a) * width * (1 - 0.07 * d), sheer - d * depth, z);
      uv.push(i / rows, j / cols);
      if (i < rows && j < cols) {
        const n = i * (cols + 1) + j;
        indices.push(n, n + cols + 2, n + cols + 1, n, n + 1, n + cols + 2);
      }
    }
  }
  // Closed transoms and fine bow ends, rather than two open half-pipes.
  for (const row of [0, rows]) {
    const z = -6 + (12 * row) / rows,
      center = positions.length / 3;
    positions.push(0, catamaranSection(z).sheer, z);
    uv.push(row / rows, 0);
    for (let j = 0; j < cols; j++) {
      const n = row * (cols + 1) + j;
      indices.push(...(row === 0 ? [center, n + 1, n] : [center, n, n + 1]));
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export function catamaranDeckGeometry() {
  const positions = [],
    uv = [],
    indices = [];
  for (let i = 0; i <= 96; i++) {
    const z = -6 + (12 * i) / 96,
      { width, sheer } = catamaranSection(z);
    for (const side of [-1, 1]) {
      positions.push(side * width, sheer + 0.025, z);
      uv.push((side + 1) / 2, i / 96);
    }
    if (i < 96) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
