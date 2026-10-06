import * as THREE from 'three';
import { sceneryBuilder } from './scenery-geometry.js';
import { seededRandom } from './materials.js';

// Detailed coastal architecture. Unique shapes (walls, roofs, porches) are
// merged into one body mesh; repeated parts (windows, doors, railings,
// chimneys...) are built once per style and instanced, so towns of several
// hundred houses keep framed windows, shutters and trim without huge buffers.
// Small ornaments live in separate "fine" meshes hidden on low quality tiers.

const FINE_QUALITY = new Set(['high']);

export const BUILDING_STYLES = {
  mediterranean: {
    walls: ['#e7ddc6', '#d4c2a6', '#eee6d3', '#c7d3c4'],
    roofs: ['#a05f48', '#8d5746', '#bd7856', '#96654e'],
    trim: '#efe8d6', frame: '#ece4cf', sill: '#c7b494', lintel: '#cdbb98', base: '#8d8975',
    shutters: ['#658071', '#56768a', '#8a6c4c', '#6e8a5a'],
    doors: ['#354b49', '#5b3f2e', '#40566a', '#6b4a33'],
    roof: 'gable', gableFront: true, pitch: 0.5, overhang: 0.4, barrel: true,
    chimney: '#d8ccb2', flowers: 0.45, quoins: true, window: [0.95, 1.25], door: [1.05, 2.15],
    tower: 'pyramid', garden: true,
  },
  nordic: {
    walls: ['#a44237', '#e6c071', '#eee6d3', '#974638'],
    roofs: ['#4b5b60', '#526361', '#586b63', '#45565c'],
    trim: '#f3f0e6', frame: '#f6f3ea', sill: '#f3f0e6', base: '#7e7d72',
    doors: ['#2f4a52', '#e9e4d6', '#3e5a45', '#2f4a52'],
    roof: 'gable', gableFront: true, pitch: 1, overhang: 0.35, siding: true, corners: true,
    chimney: '#5c5f5c', flowers: 0.15, window: [0.85, 1.25], door: [1, 2.1], tower: 'spire', garden: true,
  },
  caribbean: {
    walls: ['#e8c798', '#a2c6bb', '#dfae91', '#ece6d3'],
    roofs: ['#a9aca4', '#b5523f', '#5f8c84', '#9aa09a'],
    trim: '#f8f5ec', frame: '#f8f5ec', sill: '#f8f5ec', base: '#a39b86',
    shutters: ['#3f7d7a', '#d9a24a', '#4f7aa0', '#c0573f'],
    doors: ['#3f7d7a', '#c0573f', '#4f7aa0', '#d9a24a'],
    roof: 'hip', pitch: 0.55, overhang: 0.55, porch: true, fret: true, corners: true,
    ac: true, solar: true, window: [0.9, 1.35], door: [1, 2.15], tower: 'steeple',
  },
  bahamian: {
    walls: ['#f0c0c6', '#90d1cb', '#e5d88f', '#e6ece5'],
    roofs: ['#efefea', '#e4e8e6', '#8fb3b8', '#ecebe4'],
    trim: '#fbfaf4', frame: '#fbfaf4', sill: '#fbfaf4', base: '#b8b29e',
    shutters: ['#3f8f8a', '#e07a8a', '#5b8fc4', '#e6b64a'],
    doors: ['#3f8f8a', '#5b8fc4', '#e07a8a', '#3f8f8a'],
    roof: 'hip', pitch: 0.6, overhang: 0.5, porch: true, fret: true, corners: true,
    ac: true, solar: true, window: [0.9, 1.3], door: [1, 2.1], tower: 'steeple',
  },
  creole: {
    walls: ['#e0d3b2', '#f0e6d2', '#b5c9b1', '#d4b693'],
    roofs: ['#a2473b', '#8b3e35', '#5d7461', '#a2473b'],
    trim: '#f6f1e3', frame: '#f6f1e3', sill: '#efe8d6', base: '#958c76',
    shutters: ['#5e7b4e', '#7a4b33', '#4a6d78', '#5e7b4e'],
    doors: ['#5e7b4e', '#7a4b33', '#4a6d78', '#7a4b33'],
    roof: 'hip', pitch: 0.95, overhang: 0.6, porch: true, fret: true, raised: 0.7, corners: true,
    window: [0.9, 1.4], door: [1, 2.15], tower: 'steeple',
  },
  adriatic: {
    walls: ['#dfd3b9', '#ccbea6', '#d9d2bc', '#ded6c8'],
    roofs: ['#ae6c4b', '#a35f43', '#b97a54', '#9f6448'],
    trim: '#e8dfca', frame: '#e3d9c4', sill: '#e8e0cf', lintel: '#ebe3d0', base: '#a39b86',
    shutters: ['#4f6f45', '#5c7a52', '#476a5d', '#6a7d4b'],
    doors: ['#5b3f2e', '#4b3a2c', '#3f5a46', '#6b4a33'],
    roof: 'gable', pitch: 0.45, overhang: 0.3, barrel: true, quoins: true, balcony: true,
    chimney: '#d9cfbb', flowers: 0.4, window: [0.85, 1.3], door: [1.05, 2.2], tower: 'pyramid',
  },
  cycladic: {
    walls: ['#f5f1e3', '#e9e5dc', '#f6ebd6', '#ede5d4'],
    roofs: ['#f5f1e3', '#e9e5dc', '#f6ebd6', '#ede5d4'],
    trim: '#fbf8ef', frame: '#2f6f98', sill: '#fbf8ef', base: '#c8c2b4', dome: '#2f6fa6',
    shutters: ['#2f6f98', '#2f6f98', '#3d8a8a', '#b6463a'],
    doors: ['#2f6f98', '#3d8a8a', '#2f6f98', '#b6463a'],
    roof: 'flat', plankShutters: true, flowers: 0.12, window: [0.75, 1], door: [0.95, 2], spacing: 3.2, tower: 'dome',
  },
  polynesian: {
    walls: ['#b79b6b', '#d8c5a0', '#a9b694', '#d5b788'],
    roofs: ['#9a8350', '#8c7748', '#a38c58', '#94804e'],
    trim: '#6e5a3c', frame: '#6e5a3c', sill: '#7b6544', base: '#8d8471', deck: '#9b7b52',
    doors: ['#6e5a3c', '#7b6544', '#5f4f36', '#6e5a3c'],
    roof: 'thatch', pitch: 1.15, overhang: 0.85, porch: true, corners: true,
    window: [1, 1], door: [1.1, 2.1], spacing: 2.8, tower: 'steeple',
  },
  queensland: {
    walls: ['#e7e9db', '#ddd6bf', '#bfd2cd', '#e2d6cb'],
    roofs: ['#a3aaa8', '#7f8c87', '#9aa39e', '#b0b4ad'],
    trim: '#fbfbf5', frame: '#fbfbf5', sill: '#fbfbf5', base: '#9f9a8a',
    doors: ['#3f5f6a', '#6b7f5a', '#8a5a44', '#3f5f6a'],
    roof: 'hip', pitch: 0.5, overhang: 0.6, porch: true, raised: 1.4, siding: true, corners: true,
    solar: true, tank: true, ac: true, window: [1.1, 1.3], door: [1, 2.1], tower: 'steeple',
  },
  weatherboard: {
    walls: ['#e9e8da', '#dddcc9', '#c3d0c1', '#e2d4b6'],
    roofs: ['#60776b', '#8a3f36', '#5b6670', '#60776b'],
    trim: '#fbfaf2', frame: '#fbfaf2', sill: '#fbfaf2', base: '#8f8b7c',
    doors: ['#8a3f36', '#3f5a66', '#5b6b4a', '#8a3f36'],
    roof: 'gable', pitch: 0.65, overhang: 0.45, ribs: true, porch: true, siding: true, corners: true,
    chimney: '#8a5a48', tank: true, flowers: 0.15, window: [0.9, 1.35], door: [1, 2.1], tower: 'steeple',
    garden: true,
  },
};

const dummy = new THREE.Object3D();
function local(x = 0, y = 0, z = 0, ry = 0, rx = 0, sx = 1, sy = 1, sz = 1) {
  dummy.position.set(x, y, z);
  dummy.rotation.set(rx, ry, 0, 'YXZ');
  dummy.scale.set(sx, sy, sz);
  dummy.updateMatrix();
  return dummy.matrix.clone();
}
function shade(color, amount) {
  return '#' + new THREE.Color(color).offsetHSL(0, 0, amount).getHexString();
}
// Evenly spaced positions along a wall of the given length.
function slots(length, gap) {
  const n = Math.max(1, Math.floor(length / gap));
  return Array.from({ length: n }, (_, i) => -length / 2 + ((i + 0.5) * length) / n);
}
// Wall-local frame: wall surface at z=0, +z outward, u along the wall.
// Sides: 0 front (+z), 1 right (+x), 2 back, 3 left.
function face(side, u, y, w, d, out = 0, scale = 1) {
  const ry = [0, Math.PI / 2, Math.PI, -Math.PI / 2][side],
    half = (side % 2 ? w : d) / 2 + out;
  return local(
    u * Math.cos(ry) + half * Math.sin(ry),
    y,
    -u * Math.sin(ry) + half * Math.cos(ry),
    ry,
    0,
    scale,
    scale,
    scale,
  );
}

function context() {
  const core = sceneryBuilder(),
    fine = sceneryBuilder(),
    placements = new Map(),
    stack = [new THREE.Matrix4()],
    counts = { core: 0, fine: 0 };
  const top = () => stack.at(-1);
  const add = (geometry, color, detail = false) => {
    geometry.applyMatrix4(top());
    (detail ? fine : core).add(geometry, color);
    counts[detail ? 'fine' : 'core']++;
  };
  const cube = (detail) => (color, x, y, z, w, h, d, rx = 0, ry = 0) => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    geometry.applyMatrix4(local(x, y, z, ry, rx));
    add(geometry, color, detail);
  };
  const beam = (detail) => (color, a, b, thickness) => {
    const start = new THREE.Vector3(...a),
      delta = new THREE.Vector3(...b).sub(start),
      geometry = new THREE.BoxGeometry(thickness, thickness, delta.length());
    geometry.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), delta.clone().normalize()),
    );
    geometry.translate(...start.addScaledVector(delta, 0.5).toArray());
    add(geometry, color, detail);
  };
  return {
    core, fine, placements, counts, add,
    box: cube(false), detail: cube(true), beam: beam(false), detailBeam: beam(true),
    begin(matrix) { stack.length = 0; stack.push(matrix); },
    push(matrix) { stack.push(top().clone().multiply(matrix)); },
    pop() { stack.pop(); },
    place(key, matrix, color = null) {
      if (!placements.has(key)) placements.set(key, []);
      placements.get(key).push({ matrix: top().clone().multiply(matrix), color });
    },
  };
}

// ----- Instanced components, built once per style in wall-local space -----

function windowGeometry(s, [w, h] = s.window) {
  const b = sceneryBuilder(), t = 0.09, f = s.frame;
  b.box(f, 0, h / 2 + t / 2, 0.06, w + 2 * t, t, 0.12);
  b.box(f, 0, -h / 2 - t / 2, 0.06, w + 2 * t, t, 0.12);
  b.box(f, -w / 2 - t / 2, 0, 0.06, t, h, 0.12);
  b.box(f, w / 2 + t / 2, 0, 0.06, t, h, 0.12);
  b.box(s.sill, 0, -h / 2 - t - 0.045, 0.13, w + 0.42, 0.09, 0.26);
  return b.finish();
}
// Glazing bars and the lintel, shown on the higher quality tiers.
function windowTrimGeometry(s, [w, h] = s.window) {
  const b = sceneryBuilder(), t = 0.09, f = s.frame;
  b.box(f, 0, 0, 0.055, 0.05, h, 0.05);
  b.box(f, 0, h * 0.2, 0.055, w, 0.05, 0.05);
  if (s.lintel) b.box(s.lintel, 0, h / 2 + t + 0.09, 0.07, w + 0.5, 0.18, 0.14);
  else b.box(f, 0, h / 2 + t + 0.06, 0.09, w + 0.36, 0.08, 0.16);
  return b.finish();
}
function glassGeometry([w, h]) {
  const geometry = new THREE.BoxGeometry(w, h, 0.03);
  geometry.translate(0, 0, 0.015);
  geometry.deleteAttribute('uv');
  return geometry;
}
function archedWindowGeometry(s, glass = false) {
  const b = sceneryBuilder(), w = 0.9, h = 2.3;
  if (glass) {
    b.box('#ffffff', 0, 0, 0.015, w, h, 0.03);
    const top = new THREE.CircleGeometry(w / 2, 10, 0, Math.PI);
    top.translate(0, h / 2, 0.031);
    b.add(top, '#ffffff');
    return b.finish();
  }
  b.box(s.frame, -w / 2 - 0.06, 0, 0.06, 0.12, h, 0.12);
  b.box(s.frame, w / 2 + 0.06, 0, 0.06, 0.12, h, 0.12);
  const arch = new THREE.TorusGeometry(w / 2 + 0.06, 0.07, 4, 10, Math.PI);
  arch.translate(0, h / 2, 0.06);
  b.add(arch, s.frame);
  b.box(s.frame, 0, 0.2, 0.055, 0.05, h + 0.4, 0.05);
  b.box(s.sill, 0, -h / 2 - 0.08, 0.12, w + 0.4, 0.12, 0.24);
  return b.finish();
}
function shutterGeometry(s, slats) {
  const b = sceneryBuilder(), [w, h] = s.window, sw = w / 2 + 0.04;
  if (!slats) {
    b.box('#ffffff', 0, 0, 0.035, sw, h + 0.18, 0.07);
    return b.finish();
  }
  for (let i = 0; i < 4; i++) b.box('#bdbdbd', 0, -h / 2 + 0.2 + (i * (h - 0.2)) / 4, 0.08, sw - 0.1, 0.04, 0.03);
  b.box('#e0e0e0', 0, 0, 0.085, sw - 0.06, 0.06, 0.035);
  return b.finish();
}
function doorFrameGeometry(s) {
  const b = sceneryBuilder(), [w, h] = s.door, t = 0.12;
  b.box(s.frame, -w / 2 - t / 2, h / 2, 0.06, t, h + 0.05, 0.12);
  b.box(s.frame, w / 2 + t / 2, h / 2, 0.06, t, h + 0.05, 0.12);
  b.box(s.frame, 0, h + 0.4, 0.06, w + 2 * t, 0.1, 0.12);
  b.box('#2a3d47', 0, h + 0.2, 0.02, w, 0.3, 0.04); // transom glass
  b.box(s.frame, 0, h + 0.03, 0.06, w + 2 * t, 0.08, 0.12);
  b.box(s.lintel || s.frame, 0, h + 0.53, 0.1, w + 0.6, 0.16, 0.2);
  b.box('#c9a54a', w * 0.32, h * 0.47, 0.11, 0.05, 0.05, 0.08); // handle
  return b.finish();
}
function doorGeometry(s) {
  const b = sceneryBuilder(), [w, h] = s.door;
  b.box('#ffffff', 0, h / 2, 0.03, w, h, 0.06);
  for (const x of [-w * 0.22, w * 0.22])
    for (const y of [h * 0.28, h * 0.7]) b.box('#d8d8d8', x, y, 0.07, w * 0.32, h * 0.3, 0.03);
  return b.finish();
}
function stepGeometry(s) {
  const b = sceneryBuilder(), w = s.door[0] + 0.7;
  b.box(s.base, 0, 0.09, 0.45, w, 0.18, 0.9);
  b.box(shade(s.base, 0.08), 0, 0.22, 0.25, w - 0.2, 0.12, 0.5);
  return b.finish();
}
function hoodGeometry(s) {
  const b = sceneryBuilder(), w = s.door[0] + 0.7, y = s.door[1] + 0.75, color = s.roofs[0];
  b.box(color, 0, y, 0.45, w, 0.1, 0.95, 0.35);
  for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) b.box(s.trim, x, y - 0.3, 0.25, 0.08, 0.5, 0.08);
  return b.finish();
}
function flowerBoxGeometry(s) {
  const b = sceneryBuilder(), w = s.window[0], y = -s.window[1] / 2 - 0.32;
  b.box('#7a5a3c', 0, y, 0.24, w + 0.15, 0.22, 0.26);
  b.oval('#4f7a3c', 0, y + 0.16, 0.24, w / 2 + 0.05, 0.13, 0.15, 0);
  for (let i = 0; i < 3; i++)
    b.oval(['#d2453f', '#e86f8d', '#c43b6a'][i], -w / 3 + (i * w) / 3, y + 0.27, 0.3, 0.12, 0.08, 0.1, 0);
  return b.finish();
}
function lampGeometry() {
  const b = sceneryBuilder();
  b.box('#2f3132', 0, 0, 0.12, 0.05, 0.05, 0.24);
  b.box('#2f3132', 0, 0.02, 0.26, 0.2, 0.06, 0.2);
  b.box('#f2e3b4', 0, -0.15, 0.26, 0.15, 0.26, 0.15);
  b.box('#2f3132', 0, -0.3, 0.26, 0.18, 0.04, 0.18);
  return b.finish();
}
function potGeometry() {
  const b = sceneryBuilder(), pot = new THREE.CylinderGeometry(0.22, 0.16, 0.4, 8);
  pot.translate(0, 0.2, 0);
  b.add(pot, '#a8603f');
  b.oval('#557c3e', 0, 0.55, 0, 0.3, 0.28, 0.3, 0);
  b.oval('#e2566e', 0.08, 0.72, 0.1, 0.09, 0.08, 0.09, 0);
  return b.finish();
}
function postGeometry(s) {
  const b = sceneryBuilder();
  b.box(s.trim, 0, 0.5, 0, 0.16, 1, 0.16);
  return b.finish();
}
function railingGeometry(s) {
  const b = sceneryBuilder();
  b.box(s.trim, 0, 0.95, 0, 1.2, 0.07, 0.09);
  b.box(s.trim, 0, 0.12, 0, 1.2, 0.06, 0.07);
  for (let i = 0; i < 5; i++) b.box(s.trim, -0.48 + i * 0.24, 0.53, 0, 0.045, 0.8, 0.045);
  return b.finish();
}
function fretGeometry(s) {
  const b = sceneryBuilder();
  b.box(s.trim, 0, 0, 0, 1.2, 0.08, 0.04);
  for (let i = 0; i < 4; i++) b.box(s.trim, -0.45 + i * 0.3, -0.13, 0, 0.09, 0.2, 0.04);
  return b.finish();
}
function chimneyGeometry(s) {
  const b = sceneryBuilder();
  b.box(s.chimney, 0, -0.3, 0, 0.75, 2.6, 0.6);
  b.box(shade(s.chimney, -0.1), 0, 0.65, 0, 0.82, 0.12, 0.67);
  b.box(shade(s.chimney, 0.05), 0, 1.06, 0, 0.95, 0.14, 0.8);
  for (const x of [-0.18, 0.18]) {
    const pot = new THREE.CylinderGeometry(0.1, 0.13, 0.4, 7);
    pot.translate(x, 1.33, 0);
    b.add(pot, '#a8603f');
  }
  return b.finish();
}
function acGeometry() {
  const b = sceneryBuilder();
  b.box('#d9dad4', 0, 0, 0.24, 0.85, 0.52, 0.46);
  b.box('#8f938f', 0.12, 0, 0.475, 0.42, 0.42, 0.02);
  b.box('#6c706d', 0, -0.32, 0.2, 0.9, 0.05, 0.05);
  return b.finish();
}
function dishGeometry() {
  const b = sceneryBuilder(), dish = new THREE.SphereGeometry(0.42, 10, 4, 0, Math.PI * 2, 0, Math.PI / 3);
  dish.rotateX(Math.PI / 2);
  dish.translate(0, 0, 0.55);
  b.add(dish, '#e4e4de');
  b.box('#8c8f8c', 0, 0, 0.2, 0.06, 0.06, 0.4);
  b.box('#8c8f8c', 0, 0, 0.7, 0.04, 0.04, 0.4);
  return b.finish();
}
function solarGeometry() {
  const b = sceneryBuilder();
  b.box('#b9bdbb', 0, 0, 0, 2.1, 0.08, 1.3);
  b.box('#1e2f45', 0, 0.05, 0, 1.98, 0.03, 1.18);
  for (const x of [-0.5, 0, 0.5]) b.box('#6e7e8e', x, 0.07, 0, 0.02, 0.01, 1.18);
  return b.finish();
}
function heaterGeometry() {
  const b = sceneryBuilder(), tank = new THREE.CylinderGeometry(0.32, 0.32, 1.6, 10);
  tank.rotateZ(Math.PI / 2);
  tank.translate(0, 1.05, -0.5);
  b.add(tank, '#e9e9e4');
  b.box('#24344a', 0, 0.55, 0.15, 1.6, 0.06, 1.3, -0.6);
  for (const x of [-0.7, 0.7]) b.box('#9a9d9a', x, 0.45, -0.3, 0.06, 0.9, 0.06);
  return b.finish();
}
function tankGeometry() {
  const b = sceneryBuilder(), tank = new THREE.CylinderGeometry(0.75, 0.75, 1.9, 14);
  tank.translate(0, 1.15, 0);
  b.add(tank, '#a7aca8');
  for (const y of [0.6, 1.1, 1.6]) {
    const rib = new THREE.TorusGeometry(0.76, 0.03, 4, 14);
    rib.rotateX(Math.PI / 2);
    rib.translate(0, y, 0);
    b.add(rib, '#8d928e');
  }
  b.box('#8d8975', 0, 0.1, 0, 1.7, 0.2, 1.7);
  return b.finish();
}
function fenceGeometry(s) {
  const b = sceneryBuilder();
  for (const y of [0.35, 0.75]) b.box(s.trim, 0, y, 0, 1.5, 0.07, 0.05);
  for (let i = 0; i < 7; i++) {
    b.box(s.trim, -0.64 + i * 0.213, 0.5, 0.04, 0.08, 0.95, 0.03);
    const tip = new THREE.ConeGeometry(0.06, 0.12, 4);
    tip.translate(-0.64 + i * 0.213, 1.03, 0.04);
    b.add(tip, s.trim);
  }
  return b.finish();
}

// Wall-mounted parts never show the faces pressed against the wall.
function dropWallFaces(geometry) {
  const position = geometry.attributes.position, keep = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 3) {
    a.fromBufferAttribute(position, i);
    b.fromBufferAttribute(position, i + 1).sub(a);
    c.fromBufferAttribute(position, i + 2).sub(a);
    const n = b.cross(c).normalize();
    if (n.z > -0.99) keep.push(i, i + 1, i + 2);
  }
  const result = new THREE.BufferGeometry();
  for (const [key, attribute] of Object.entries(geometry.attributes)) {
    const size = attribute.itemSize, values = new Float32Array(keep.length * size);
    keep.forEach((index, j) => {
      for (let k = 0; k < size; k++) values[j * size + k] = attribute.array[index * size + k];
    });
    result.setAttribute(key, new THREE.BufferAttribute(values, size));
  }
  geometry.dispose();
  return result;
}

const COMPONENTS = {
  window: { build: (s) => windowGeometry(s), shadow: true, wall: true },
  windowTrim: { build: (s) => windowTrimGeometry(s), fine: true, wall: true },
  attic: { build: (s) => windowGeometry(s, [0.6, 0.6]), wall: true },
  glass: { build: (s) => glassGeometry(s.window), glass: true },
  atticGlass: { build: () => glassGeometry([0.6, 0.6]), glass: true },
  arched: { build: (s) => archedWindowGeometry(s), wall: true },
  archedGlass: { build: (s) => archedWindowGeometry(s, true), glass: true },
  shutter: { build: (s) => shutterGeometry(s, false), tint: true, wall: true },
  slats: { build: (s) => shutterGeometry(s, true), tint: true, fine: true, wall: true },
  doorFrame: { build: doorFrameGeometry, wall: true },
  door: { build: doorGeometry, tint: true, wall: true },
  step: { build: stepGeometry },
  hood: { build: hoodGeometry },
  flowers: { build: flowerBoxGeometry, fine: true, wall: true },
  lamp: { build: lampGeometry, fine: true },
  pot: { build: potGeometry, fine: true },
  post: { build: postGeometry, shadow: true },
  railing: { build: railingGeometry, fine: true },
  fret: { build: fretGeometry, fine: true },
  chimney: { build: chimneyGeometry, shadow: true },
  ac: { build: acGeometry, fine: true, wall: true },
  dish: { build: dishGeometry, fine: true },
  solar: { build: solarGeometry, fine: true },
  heater: { build: heaterGeometry, fine: true },
  tank: { build: tankGeometry, fine: true },
  fence: { build: fenceGeometry, fine: true },
};

// ----- Roofs, built in a canonical frame: ridge along x, eaves facing ±z -----

function gableRoof(k, s, W, D, y0, wall, color, rand) {
  const pitch = s.pitch, rise = (D / 2) * pitch, angle = Math.atan(pitch), ov = s.overhang;
  const a = D / 2 + ov, L = a / Math.cos(angle), t = 0.16, length = W + ov * 1.6, ridgeY = y0 + rise;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  for (const sign of [-1, 1]) {
    const cz = sign * (a / 2) + sign * sin * (t / 2), cy = ridgeY - (a / 2) * pitch + cos * (t / 2);
    k.box(color, 0, cy, cz, length, t, L, sign * angle);
    // Bargeboards frame each gable edge.
    for (const x of [-length / 2 + 0.05, length / 2 - 0.05])
      k.box(s.trim, x, cy - cos * 0.12, cz - sign * sin * 0.12, 0.1, 0.28, L, sign * angle);
    const along = (dist, lift) => [sign * dist * cos + sign * sin * lift, ridgeY - dist * sin + cos * lift];
    // Tile courses across the slope, plus barrel rows or metal ribs down it.
    for (let dist = 0.35; !s.ribs && dist < L - 0.08; dist += 0.38) {
      const [z, y] = along(dist, t + 0.03);
      k.detail(shade(color, -0.07), 0, y, z, length, 0.06, 0.12, sign * angle);
    }
    if (s.barrel || s.ribs) {
      const [z, y] = along(L / 2, t + (s.barrel ? 0.05 : 0.025));
      for (let x = -length / 2 + 0.25; x < length / 2 - 0.1; x += s.barrel ? 0.5 : 0.4)
        k.detail(shade(color, s.barrel ? 0.05 : 0.06), x, y, z, s.barrel ? 0.13 : 0.04, s.barrel ? 0.08 : 0.05, L, sign * angle);
    }
    // Gutter and downpipes.
    const [gz, gy] = along(L - 0.04, -0.04);
    k.detail('#8b8f8b', 0, gy - 0.06, gz, length, 0.13, 0.15);
    for (const x of [-W / 2 + 0.25, W / 2 - 0.25])
      k.detail('#8b8f8b', x, (gy - 0.1) / 2, sign * (D / 2 + 0.12), 0.09, gy - 0.1, 0.09);
  }
  k.box(shade(color, -0.12), 0, ridgeY + t / cos - 0.02, 0, length + 0.05, 0.2, 0.34);
  // Gable wall triangles.
  const shape = new THREE.Shape();
  shape.moveTo(-D / 2, 0);
  shape.lineTo(0, rise);
  shape.lineTo(D / 2, 0);
  shape.closePath();
  for (const sign of [-1, 1]) {
    const gable = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
    gable.rotateY(Math.PI / 2);
    gable.translate(sign * (W / 2 - 0.1) - 0.1, y0, 0);
    k.add(gable, wall);
    if (rise > 1.3) {
      const m = local(sign * W / 2, y0 + rise * 0.36, 0, sign * Math.PI / 2);
      k.place('attic', m);
      k.place('atticGlass', m);
    }
  }
  return { rise, heightAt: (x, z) => ridgeY - Math.abs(z) * pitch, slope: angle };
}

function hipSurface(k, We, De, ye, apex, color, detail = false) {
  const alongX = We >= De, rl = Math.abs(We - De) / 2;
  const A = [-We / 2, ye, De / 2], B = [We / 2, ye, De / 2], C = [We / 2, ye, -De / 2], D = [-We / 2, ye, -De / 2];
  const Rm = alongX ? [-rl, apex, 0] : [0, apex, -rl], Rp = alongX ? [rl, apex, 0] : [0, apex, rl];
  const faces = alongX
    ? [[A, B, Rp, Rm], [B, C, Rp], [C, D, Rm, Rp], [D, A, Rm]]
    : [[A, B, Rp], [B, C, Rm, Rp], [C, D, Rm], [D, A, Rp, Rm]];
  const points = [];
  const tri = (p, q, r) => {
    const n = new THREE.Vector3(...q).sub(new THREE.Vector3(...p)).cross(new THREE.Vector3(...r).sub(new THREE.Vector3(...p)));
    points.push(...p, ...(n.y >= 0 ? q : r), ...(n.y >= 0 ? r : q));
  };
  for (const f of faces) {
    tri(f[0], f[1], f[2]);
    if (f[3]) tri(f[0], f[2], f[3]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.computeVertexNormals();
  k.add(geometry, color, detail);
  return { A, B, C, D, Rm, Rp, alongX, rl };
}

function hipRoof(k, s, W, D, y0, color, rand) {
  const pitch = s.pitch, ov = s.overhang, thatch = s.roof === 'thatch';
  const We = W + 2 * ov, De = D + 2 * ov, ye = y0 - ov * pitch, rise = (Math.min(W, D) / 2) * pitch;
  const apex = y0 + rise;
  k.box(s.trim, 0, ye - 0.12, 0, We, 0.24, De);
  const roof = hipSurface(k, We, De, ye, apex, color);
  if (thatch) {
    // A second, lower skirt gives the layered look of pandanus thatch.
    hipSurface(k, We + 0.5, De + 0.5, ye - 0.45, apex - 0.45 - 0.25 * pitch, shade(color, -0.06));
    k.beam(shade(color, -0.15), [roof.Rm[0], apex + 0.08, roof.Rm[2]], [roof.Rp[0] + 0.001, apex + 0.08, roof.Rp[2] + 0.001], 0.38);
  } else {
    const cap = shade(color, -0.1);
    for (const [corner, ridge] of [[roof.A, roof.alongX ? roof.Rm : roof.Rp], [roof.B, roof.Rp], [roof.C, roof.alongX ? roof.Rp : roof.Rm], [roof.D, roof.Rm]])
      k.beam(cap, [corner[0], corner[1] + 0.06, corner[2]], [ridge[0], ridge[1] + 0.06, ridge[2]], 0.16);
    if (roof.rl > 0.05) k.beam(cap, [roof.Rm[0], apex + 0.06, roof.Rm[2]], [roof.Rp[0], apex + 0.06, roof.Rp[2]], 0.18);
  }
  // Horizontal courses follow the contour of the roof at several heights.
  const courses = thatch ? 7 : 5;
  for (let i = 1; i < courses; i++) {
    const t = i / courses, y = ye + t * (apex - ye) + 0.02;
    const hx = roof.alongX ? We / 2 - t * (We / 2 - roof.rl) : (We / 2) * (1 - t);
    const hz = roof.alongX ? (De / 2) * (1 - t) : De / 2 - t * (De / 2 - roof.rl);
    const c = shade(color, thatch ? (i % 2 ? -0.08 : 0.04) : -0.06), size = thatch ? 0.12 : 0.06;
    k.detail(c, 0, y, hz, hx * 2, size, size);
    k.detail(c, 0, y, -hz, hx * 2, size, size);
    k.detail(c, hx, y, 0, size, size, hz * 2);
    k.detail(c, -hx, y, 0, size, size, hz * 2);
  }
  // Gutters along the eaves.
  if (!thatch) {
    k.detail('#8b8f8b', 0, ye - 0.08, De / 2 + 0.06, We, 0.12, 0.14);
    k.detail('#8b8f8b', 0, ye - 0.08, -De / 2 - 0.06, We, 0.12, 0.14);
  }
  const slope = Math.atan(pitch);
  return {
    rise,
    slope,
    heightAt(x, z) {
      const dx = Math.max(0, Math.abs(x) - (roof.alongX ? roof.rl : 0)), dz = Math.max(0, Math.abs(z) - (roof.alongX ? 0 : roof.rl));
      return apex - Math.max(dx, dz) * pitch;
    },
  };
}

function flatRoof(k, s, f, w, d, top, wall, v, rand) {
  if (v === 3 && f.type !== 'chapel') {
    // Barrel-vaulted cave house roof.
    const vault = new THREE.CylinderGeometry(d / 2, d / 2, w, 14, 1, false, Math.PI, Math.PI);
    vault.rotateZ(-Math.PI / 2);
    vault.scale(1, 0.32, 1);
    vault.translate(0, top, 0);
    k.add(vault, wall);
    k.box(s.trim, 0, top + 0.05, 0, w + 0.12, 0.1, d + 0.12);
    return;
  }
  k.box(s.trim, 0, top + 0.07, 0, w + 0.14, 0.14, d + 0.14);
  for (const z of [-d / 2 + 0.07, d / 2 - 0.07]) k.box(wall, 0, top + 0.36, z, w + 0.14, 0.45, 0.22);
  for (const x of [-w / 2 + 0.07, w / 2 - 0.07]) k.box(wall, x, top + 0.36, 0, 0.22, 0.45, d - 0.3);
  // Rounded lime coping along the parapet.
  for (const z of [-d / 2 + 0.07, d / 2 - 0.07]) k.detail(s.trim, 0, top + 0.62, z, w + 0.2, 0.08, 0.28);
  for (const x of [-w / 2 + 0.07, w / 2 - 0.07]) k.detail(s.trim, x, top + 0.62, 0, 0.28, 0.08, d - 0.3);
  if (v === 0 || f.type === 'chapel') {
    const r = Math.min(w, d) * (f.type === 'chapel' ? 0.32 : 0.24), z = f.type === 'chapel' ? 0 : -d * 0.12;
    const drum = new THREE.CylinderGeometry(r * 1.02, r * 1.05, 0.7, 16);
    drum.translate(0, top + 0.35, z);
    k.add(drum, wall);
    const dome = new THREE.SphereGeometry(r, 16, 7, 0, Math.PI * 2, 0, Math.PI / 2);
    dome.translate(0, top + 0.7, z);
    k.add(dome, s.dome);
    const lantern = new THREE.CylinderGeometry(0.22, 0.26, 0.5, 8);
    lantern.translate(0, top + 0.7 + r + 0.2, z);
    k.add(lantern, wall);
    k.box('#d8d2bf', 0, top + r + 1.45, z, 0.08, 0.7, 0.08);
    k.box('#d8d2bf', 0, top + r + 1.55, z, 0.4, 0.08, 0.08);
    // Small arched openings around the drum.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      k.box('#30424a', Math.sin(a) * r * 1.03, top + 0.38, z + Math.cos(a) * r * 1.03, 0.22, 0.38, 0.06, 0, a);
    }
  } else if (v === 1) {
    // Wooden pergola over a roof terrace.
    const px = [-w * 0.32, w * 0.32], pz = [d * 0.05, d * 0.42];
    for (const x of px) for (const z of pz) k.detail('#8a6b48', x, top + 1.15, z, 0.14, 2.3, 0.14);
    for (const z of pz) k.detail('#8a6b48', 0, top + 2.3, z, w * 0.7, 0.14, 0.16);
    for (let x = -w * 0.3; x <= w * 0.3; x += 0.45) k.detail('#9a7a55', x, top + 2.42, (pz[0] + pz[1]) / 2, 0.08, 0.08, pz[1] - pz[0] + 0.4);
    k.detail('#b0503e', 0, top + 0.6, d * 0.2, 1.2, 0.08, 0.7); // terrace table
    k.detail('#8a6b48', 0, top + 0.37, d * 0.2, 0.12, 0.5, 0.12);
  } else if (v === 2) {
    // Exterior stair climbing the right-hand wall to the roof terrace.
    const n = Math.ceil(top / 0.28), depth = Math.min(0.32, (d - 0.6) / n);
    for (let i = 0; i < n; i++) {
      const h = ((i + 1) * top) / n;
      k.box(s.trim, w / 2 + 0.55, h / 2, d / 2 - 0.3 - i * depth, 1, h, depth);
    }
    k.detail(wall, w / 2 + 1.1, top / 2 + 0.4, d / 2 - 0.3 - (n * depth) / 2, 0.14, 0.5, n * depth);
  }
  if (v !== 0 && f.type !== 'chapel') {
    k.box(wall, -w * 0.3, top + 0.75, d * 0.3, 0.5, 1.2, 0.5);
    k.box(wall, -w * 0.3, top + 1.42, d * 0.3, 0.75, 0.14, 0.75);
    if (rand() < 0.6) k.place('heater', local(w * 0.2, top + 0.1, -d * 0.25));
  }
}

function roofFor(k, s, f, w, d, top, wall, color, v, rand) {
  if (s.roof === 'flat') {
    flatRoof(k, s, f, w, d, top, wall, v, rand);
    return { heightAt: () => top, slope: 0, flat: true };
  }
  if (s.roof === 'gable') {
    const turn = s.gableFront || f.type === 'chapel';
    if (!turn) return gableRoof(k, s, w, d, top, wall, color, rand);
    k.push(local(0, 0, 0, Math.PI / 2));
    const roof = gableRoof(k, s, d, w, top, wall, color, rand);
    k.pop();
    return { ...roof, turned: true, heightAt: (x, z) => roof.heightAt(-z, x) };
  }
  return hipRoof(k, s, w, d, top, color, rand);
}

// ----- Houses -----

function buildHouse(k, f, s, rand) {
  const w = f.width, d = f.length, h = f.height, v = f.variant % 4, overwater = f.type === 'bungalow';
  const raise = overwater ? 0 : s.raised || 0, porch = s.porch ? (overwater ? 2.6 : 2.2) : 0;
  const floors = h >= 6.2 ? 2 : 1, fh = h / floors, top = raise + h;
  const wall = s.walls[v], roofColor = s.roofs[v], dark = shade(wall, -0.12);
  const [ww, wh] = s.window, [dw] = s.door;

  if (overwater) {
    k.box(s.deck || '#a8875a', 0, -0.1, porch / 2, w + 3, 0.22, d + 2 + porch);
    for (const x of [-w / 2 - 1.3, 0, w / 2 + 1.3])
      for (const z of [-d / 2 - 0.9, d / 2 + porch + 0.8]) k.place('post', local(x, -3.2, z, 0, 0, 1.6, 3.1, 1.6));
    // Ladder from the deck down into the lagoon.
    for (const x of [-0.35, 0.35]) k.detail(s.trim, x, -0.9, d / 2 + porch + 1.05, 0.08, 2, 0.08);
    for (let y = -1.7; y < 0; y += 0.35) k.detail(s.trim, 0, y, d / 2 + porch + 1.05, 0.7, 0.05, 0.06);
  } else {
    k.box(s.base, 0, -f.foundation / 2, porch / 2, w + 0.9, f.foundation + 0.12, d + 0.9 + porch);
  }
  if (raise > 0) {
    k.box('#3e3d37', 0, raise / 2, 0, w - 0.4, raise, d - 0.4);
    for (const x of [-w / 2 + 0.25, 0, w / 2 - 0.25])
      for (const z of [-d / 2 + 0.25, d / 2 - 0.25]) k.place('post', local(x, 0, z, 0, 0, 1.4, raise, 1.4));
    k.box(s.trim, 0, raise - 0.08, 0, w + 0.14, 0.18, d + 0.14);
    for (let x = -w / 2 + 0.6; x < w / 2 - 0.4; x += 0.3) k.detail(s.trim, x, raise / 2, d / 2 - 0.18, 0.05, raise - 0.2, 0.04);
  }
  k.box(wall, 0, raise + h / 2, 0, w, h, d);
  k.box(dark, 0, raise + 0.18, 0, w + 0.05, 0.36, d + 0.05);
  if (s.corners)
    for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) k.box(s.trim, x, raise + h / 2, z, 0.17, h, 0.17);
  if (s.quoins)
    for (const x of [-1, 1])
      for (const z of [-1, 1])
        for (let y = raise + 0.45, i = 0; y < top - 0.3; y += 0.7, i++) {
          const a = i % 2 ? 0.55 : 0.32, b = i % 2 ? 0.32 : 0.55;
          k.detail(s.lintel || shade(wall, 0.05), x * (w / 2 - a / 2 + 0.03), y, z * (d / 2 - b / 2 + 0.03), a, 0.26, b);
        }
  if (s.siding) for (let y = raise + 0.6; y < top - 0.25; y += 0.34) k.detail(dark, 0, y, 0, w + 0.04, 0.045, d + 0.04);
  if (floors === 2) k.box(s.trim, 0, raise + fh, 0, w + 0.12, 0.16, d + 0.12);
  if (s.roof !== 'flat') k.box(s.trim, 0, top - 0.1, 0, w + 0.16, 0.2, d + 0.16);

  // Windows, shutters and the front door on every wall.
  const doorBase = Math.max(raise, porch && !overwater ? 0.3 : 0);
  const balcony = s.balcony && floors === 2 && v % 2 === 0;
  for (let side = 0; side < 4; side++) {
    const length = side % 2 ? d : w, us = slots(length - 0.6, (s.spacing || 2.4) * (side === 0 ? 1 : 1.3)), room = (length - 0.6) / us.length;
    const doorSlot = Math.floor(us.length / 2);
    for (let floor = 0; floor < floors; floor++) {
      const base = raise + floor * fh, y = base + Math.min(1 + wh / 2, fh - 0.4 - wh / 2);
      us.forEach((u, i) => {
        if (side === 0 && i === doorSlot && (floor === 0 || balcony)) {
          const at = floor === 0 ? doorBase : base + 0.02, m = face(0, u, at, w, d);
          k.place('doorFrame', m);
          k.place('door', m, s.doors[(v + floor) % 4]);
          if (floor === 0) {
            if (!porch && raise === 0) k.place('step', m);
            if (!porch && s.roof !== 'flat') k.place('hood', m);
            k.place('lamp', face(0, u + dw / 2 + 0.45, at + 2.25, w, d));
            if (!porch && rand() < 0.7) k.place('pot', face(0, u - dw / 2 - 0.55, 0, w, d, 0.35));
          } else {
            k.box(s.sill, u, at - 0.06, d / 2 + 0.55, 2.6, 0.16, 1.1);
            for (const x of [-1, 1]) k.box(s.sill, u + x, at - 0.34, d / 2 + 0.25, 0.14, 0.42, 0.5);
            k.place('railing', local(u - 0.6, at + 0.02, d / 2 + 1.04));
            k.place('railing', local(u + 0.6, at + 0.02, d / 2 + 1.04));
            for (const x of [-1.25, 1.25]) k.place('railing', local(u + x, at + 0.02, d / 2 + 0.5, Math.PI / 2, 0, 0.8));
          }
          return;
        }
        const m = face(side, u, y, w, d);
        k.place('window', m);
        k.place('windowTrim', m);
        k.place('glass', m);
        if (s.shutters && room > ww * 2 + 0.35)
          for (const sign of [-1, 1]) {
            const shutter = face(side, u + sign * (ww / 2 + 0.13 + ww / 4 + 0.02), y, w, d), color = s.shutters[(v + side) % 4];
            k.place('shutter', shutter, color);
            if (!s.plankShutters) k.place('slats', shutter, color);
          }
        if (s.flowers && rand() < s.flowers) k.place('flowers', m);
        if (s.ac && side % 2 && floor === floors - 1 && rand() < 0.3) k.place('ac', face(side, u, y - wh / 2 - 0.65, w, d));
      });
    }
  }

  if (porch) {
    const deckTop = overwater ? 0 : doorBase, front = d / 2 + porch, pz = d / 2 + porch / 2;
    if (!overwater) {
      if (raise === 0) k.box(s.base, 0, (deckTop - 0.2) / 2, pz, w + 0.2, deckTop - 0.2, porch);
      else for (const x of [-w / 2 + 0.2, w / 2 - 0.2]) k.place('post', local(x, 0, front - 0.2, 0, 0, 1.3, deckTop, 1.3));
      k.box(s.deck || shade(wall, -0.28), 0, deckTop - 0.1, pz, w + 0.2, 0.2, porch);
    }
    const roofY = floors === 2 ? raise + fh + 0.05 : top - 0.02, drop = 0.5, span = porch + 0.3;
    k.box(roofColor, 0, roofY - drop / 2 + 0.07, pz + 0.15, w + 0.5, 0.12, Math.hypot(span, drop), Math.atan2(drop, span));
    k.box(s.trim, 0, roofY - drop - 0.05, front + 0.28, w + 0.5, 0.24, 0.08);
    const postTop = roofY - drop * (porch / span), n = Math.max(2, Math.round(w / 2.2)) + 1;
    const xs = Array.from({ length: n }, (_, i) => -w / 2 + 0.15 + (i * (w - 0.3)) / (n - 1));
    for (const x of xs) k.place('post', local(x, deckTop, front - 0.15, 0, 0, 1, postTop - deckTop, 1));
    const entry = us0(w, s);
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1];
      if (s.fret) placeRun(k, 'fret', a, b, postTop - 0.08, front - 0.12);
      if (!overwater && entry > a && entry < b) continue;
      placeRun(k, 'railing', a, b, deckTop, front - 0.15);
    }
    for (const x of [xs[0], xs.at(-1)]) {
      const run = porch - 0.3, segments = Math.max(1, Math.round(run / 1.2));
      for (let j = 0; j < segments; j++)
        k.place('railing', local(x, deckTop, d / 2 + 0.15 + ((j + 0.5) * run) / segments, Math.PI / 2, 0, run / segments / 1.2));
    }
    if (!overwater) {
      const steps = Math.max(1, Math.ceil(deckTop / 0.2)), rise = deckTop / steps;
      for (let i = 0; i < steps - 1; i++) {
        const tread = deckTop - (i + 1) * rise;
        k.box(s.base, entry, tread / 2, front + 0.15 + i * 0.3, 1.6, tread, 0.3);
      }
      if (rand() < 0.6) k.place('pot', local(entry + 1.2, deckTop, front - 0.5));
      if (rand() < 0.5) k.place('pot', local(-w / 2 + 0.6, deckTop, d / 2 + 0.5));
    }
  }

  const roof = roofFor(k, s, f, w, d, top, wall, roofColor, v, rand);
  if (s.chimney && v !== 3) {
    const cx = (v % 2 ? -1 : 1) * w * 0.28, cz = roof.turned ? 0 : -d * 0.12;
    k.place('chimney', local(cx, roof.heightAt(cx, cz) + 0.45, cz));
  }
  if (s.solar && v !== 2 && !roof.flat) {
    const z = d * 0.26;
    k.place('solar', local(-w * 0.15, roof.heightAt(-w * 0.15, z) + 0.1, z, 0, roof.slope));
  }
  if (v === 1 && !overwater && s.roof !== 'thatch') k.place('dish', face(1, -d * 0.3, top - 0.7, w, d));
  if (s.tank && !overwater && v % 2 === 0) k.place('tank', local(-w / 2 - 1.05, 0, -d * 0.2));
  if (s.roof === 'flat' && rand() < 0.5) {
    // Bougainvillea climbing a front corner.
    const x = (v % 2 ? -1 : 1) * (w / 2 - 0.35);
    for (let i = 0; i < 5; i++) {
      const bush = new THREE.IcosahedronGeometry(1, 1);
      bush.scale(0.55, 0.45, 0.3);
      bush.translate(x + (rand() - 0.5) * 0.7, 0.5 + i * 0.5, d / 2 + 0.22);
      k.add(bush, i % 2 ? '#c2337a' : '#d24690', true);
    }
  }
  if (s.garden && !overwater && rand() < 0.55) {
    const z = d / 2 + porch + 2.2, gap = us0(w, s);
    for (let x = -w / 2 - 0.2; x < w / 2; x += 1.5) if (Math.abs(x + 0.75 - gap) > 1.2) k.place('fence', local(x + 0.75, 0, z));
  }
}
// Horizontal position of the front entrance.
function us0(w, s) {
  const us = slots(w - 0.6, s.spacing || 2.4);
  return us[Math.floor(us.length / 2)];
}
function placeRun(k, key, a, b, y, z) {
  const segments = Math.max(1, Math.round((b - a - 0.16) / 1.2)), size = (b - a - 0.16) / segments;
  for (let j = 0; j < segments; j++) k.place(key, local(a + 0.08 + (j + 0.5) * size, y, z, 0, 0, size / 1.2));
}

// ----- Chapels -----

function buildChapel(k, f, s, rand) {
  const w = f.width, d = f.length, h = Math.max(5, Math.min(f.height, 7)), v = f.variant % 4;
  const wall = s.walls[2], roofColor = s.roofs[v], dark = shade(wall, -0.12);
  k.box(s.base, 0, -f.foundation / 2, 0, w + 1.2, f.foundation + 0.15, d + 1.2);
  k.box(s.base, 0, 0.04, d / 2 + 1.6, w + 1.6, 0.18, 2.6);
  k.box(shade(s.base, 0.08), 0, 0.2, d / 2 + 0.75, 3.2, 0.2, 0.9);
  k.box(wall, 0, h / 2, 0, w, h, d);
  k.box(dark, 0, 0.2, 0, w + 0.08, 0.4, d + 0.08);
  for (const x of [-w / 2, w / 2]) for (const z of [-d / 2, d / 2]) k.box(s.lintel || s.trim, x, h / 2, z, 0.35, h, 0.35);
  // Buttresses between the tall side windows.
  const us = slots(d - 2.4, 3);
  for (const side of [1, 3]) {
    us.forEach((u) => {
      const m = face(side, u, h * 0.52, w, d);
      k.place('arched', m);
      k.place('archedGlass', m);
    });
    for (let i = 1; i < us.length; i++) {
      const u = (us[i - 1] + us[i]) / 2, sx = side === 1 ? 1 : -1;
      k.box(wall, sx * (w / 2 + 0.25), h * 0.38, -u, 0.5, h * 0.76, 0.45);
      k.box(s.trim, sx * (w / 2 + 0.25), h * 0.77, -u, 0.55, 0.12, 0.5);
    }
  }
  const door = face(0, 0, 0.3, w, d, 0, 1.3);
  k.place('doorFrame', door);
  k.place('door', door, s.doors[0]);
  k.place('lamp', face(0, 1.25, 2.9, w, d));
  k.place('lamp', face(0, -1.25, 2.9, w, d));
  // Rose window above the door.
  const rose = new THREE.TorusGeometry(0.72, 0.1, 6, 18);
  rose.translate(0, h * 0.82, d / 2 + 0.06);
  k.add(rose, s.trim);
  const glass = new THREE.CircleGeometry(0.68, 18);
  glass.translate(0, h * 0.82, d / 2 + 0.02);
  k.add(glass, '#2e4a5e');
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.BoxGeometry(1.36, 0.05, 0.04);
    spoke.rotateZ((i * Math.PI) / 4);
    spoke.translate(0, h * 0.82, d / 2 + 0.05);
    k.add(spoke, s.trim, true);
  }
  k.box(s.trim, 0, h - 0.1, 0, w + 0.2, 0.2, d + 0.2);
  roofFor(k, s, f, w, d, h, wall, roofColor, v, rand);
  if (s.tower === 'dome') {
    // Cycladic bell gable over the façade.
    const gy = h + 0.6;
    k.box(wall, 0, gy + 1.2, d / 2 - 0.15, 3.2, 2.4, 0.35);
    for (const x of [-0.75, 0.75]) {
      k.box('#30424a', x, gy + 1.1, d / 2 - 0.1, 0.6, 1, 0.4);
      const bell = new THREE.CylinderGeometry(0.15, 0.24, 0.32, 10);
      bell.translate(x, gy + 1.15, d / 2 - 0.15);
      k.add(bell, '#a78e50');
    }
    k.box(s.trim, 0, gy + 2.45, d / 2 - 0.15, 3.4, 0.12, 0.45);
    k.box('#d8d2bf', 0, gy + 2.95, d / 2 - 0.15, 0.08, 0.9, 0.08);
    k.box('#d8d2bf', 0, gy + 3.1, d / 2 - 0.15, 0.45, 0.08, 0.08);
    return;
  }
  // Bell tower at the front corner.
  const tw = Math.min(3.1, Math.max(2.4, w * 0.4)), tx = -w / 2 + tw / 2 - 0.35, tz = d / 2 - tw / 2 + 0.35;
  const th = h * 1.75 + 2, bell = th - 1.3;
  k.box(wall, tx, th / 2, tz, tw, th, tw);
  for (let y = 3.5; y < bell - 1.5; y += 3.4) k.box(s.trim, tx, y, tz, tw + 0.12, 0.14, tw + 0.12);
  for (let y = 2.5; y < bell - 2; y += 3.4) k.box('#30424a', tx, y + 1, tz + tw / 2 + 0.02, 0.28, 0.8, 0.05);
  // Belfry: dark openings, corner piers, louvres and the bell itself.
  k.box('#30423e', tx, bell, tz, tw + 0.04, 1.8, tw + 0.04);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) k.box(wall, tx + sx * (tw / 2 - 0.2), bell, tz + sz * (tw / 2 - 0.2), 0.44, 2, 0.44);
  for (const side of [0, 1, 2, 3])
    for (let i = 0; i < 3; i++) {
      k.push(local(tx, 0, tz));
      k.push(face(side, 0, bell - 0.6 + i * 0.4, tw - 0.1, tw - 0.1, 0.02));
      k.detail(shade(wall, -0.3), 0, 0, 0, tw - 1, 0.08, 0.12, 0.5);
      k.pop();
      k.pop();
    }
  const bellGeometry = new THREE.CylinderGeometry(0.42, 0.62, 0.7, 10);
  bellGeometry.translate(tx, bell - 0.3, tz);
  k.add(bellGeometry, '#a78e50');
  k.box(s.trim, tx, bell + 1.15, tz, tw + 0.4, 0.35, tw + 0.4);
  // Clock face below the belfry.
  const clock = new THREE.CircleGeometry(0.55, 16);
  clock.translate(tx, bell - 1.8, tz + tw / 2 + 0.03);
  k.add(clock, '#f2efe4', true);
  k.detail('#2b2b2b', tx, bell - 1.62, tz + tw / 2 + 0.05, 0.05, 0.38, 0.02);
  k.detail('#2b2b2b', tx + 0.12, bell - 1.8, tz + tw / 2 + 0.05, 0.28, 0.05, 0.02);
  const crown = bell + 1.32;
  let tip = crown;
  if (s.tower === 'spire') {
    const spire = new THREE.ConeGeometry(tw * 0.72, tw * 2.3, 8);
    spire.translate(tx, crown + tw * 1.15, tz);
    k.add(spire, roofColor);
    tip = crown + tw * 2.3;
  } else if (s.tower === 'pyramid') {
    const pyramid = new THREE.ConeGeometry(tw * 0.82, tw * 0.75, 4);
    pyramid.rotateY(Math.PI / 4);
    pyramid.translate(tx, crown + tw * 0.375, tz);
    k.add(pyramid, roofColor);
    tip = crown + tw * 0.75;
  } else {
    const drum = new THREE.CylinderGeometry(tw * 0.33, tw * 0.36, 1.4, 8);
    drum.translate(tx, crown + 0.7, tz);
    k.add(drum, s.trim);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      k.box('#30424a', tx + Math.sin(a) * tw * 0.345, crown + 0.75, tz + Math.cos(a) * tw * 0.345, 0.22, 0.7, 0.05, 0, a);
    }
    const cone = new THREE.ConeGeometry(tw * 0.42, tw * 1.5, 8);
    cone.translate(tx, crown + 1.4 + tw * 0.75, tz);
    k.add(cone, roofColor);
    tip = crown + 1.4 + tw * 1.5;
  }
  k.box('#514e3f', tx, tip + 0.6, tz, 0.12, 1.3, 0.12);
  k.box('#514e3f', tx, tip + 0.85, tz, 0.75, 0.12, 0.12);
}

// Builds all houses, chapels and overwater bungalows of one town.
export function createBuildings(
  scene,
  features,
  styleName,
  { quality = null, name = 'Coastal buildings', castShadow = false, snapRotation = false } = {},
) {
  if (!features.length) return null;
  const s = BUILDING_STYLES[styleName] || BUILDING_STYLES.mediterranean, k = context();
  for (const f of features) {
    const rotation = snapRotation
      ? (Math.abs(Math.round((f.rotation || 0) / (Math.PI / 2))) % 2) * Math.PI
      : f.rotation || 0;
    k.begin(local(f.x, f.y, f.z, rotation));
    const rand = seededRandom((Math.abs(Math.round(f.x * 13 + f.z * 7)) % 2147483000) + 1);
    if (f.type === 'chapel') buildChapel(k, f, s, rand);
    else buildHouse(k, f, s, rand);
  }
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 });
  const glass = new THREE.MeshStandardMaterial({ color: '#2b4653', roughness: 0.12, metalness: 0.55, envMapIntensity: 1.3 });
  const meshes = [], fine = [];
  const body = new THREE.Mesh(k.core.finish(), material);
  body.name = name;
  body.castShadow = castShadow;
  body.receiveShadow = true;
  meshes.push(body);
  if (k.counts.fine) {
    const detail = new THREE.Mesh(k.fine.finish(), material);
    detail.name = `${name} trim`;
    detail.receiveShadow = true;
    meshes.push(detail);
    fine.push(detail);
  }
  const color = new THREE.Color();
  for (const [key, list] of k.placements) {
    const component = COMPONENTS[key],
      geometry = component.build(s),
      mesh = new THREE.InstancedMesh(
        component.wall ? dropWallFaces(geometry.index ? geometry.toNonIndexed() : geometry) : geometry,
        component.glass ? glass : material,
        list.length,
      );
    mesh.name = `${name} ${key}`;
    list.forEach((item, i) => {
      mesh.setMatrixAt(i, item.matrix);
      if (component.tint) mesh.setColorAt(i, color.set(item.color || '#ffffff'));
    });
    mesh.castShadow = castShadow && !!component.shadow;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    meshes.push(mesh);
    if (component.fine) fine.push(mesh);
  }
  scene.add(...meshes);
  const town = {
    body,
    meshes,
    get triangles() {
      return meshes.reduce(
        (sum, mesh) => !mesh.visible ? sum : sum + (mesh.geometry.attributes.position.count / 3) * (mesh.isInstancedMesh ? mesh.count : 1),
        0,
      );
    },
    setQuality(next) {
      const visible = !next || FINE_QUALITY.has(next.name);
      fine.forEach((mesh) => (mesh.visible = visible));
    },
  };
  town.setQuality(quality);
  return town;
}
