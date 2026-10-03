import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// All buildings, shutters, terraces and garden trees become one colored mesh.
// These distant landmarks need neither individual materials nor texture loads.
export function createCoastalVillage(scene, features) {
  const parts = [],
    transform = new THREE.Object3D(),
    color = new THREE.Color();
  const walls = ['#e7ddc6', '#d4c2a6', '#eee6d3', '#c7d3c4'];
  const roofs = ['#a05f48', '#8d5746', '#bd7856', '#96654e'];
  let feature;
  const add = (geometry, tint, x, y, z, rotation = 0) => {
    transform.position.set(
      feature.x + Math.cos(feature.rotation) * x + Math.sin(feature.rotation) * z,
      feature.y + y,
      feature.z - Math.sin(feature.rotation) * x + Math.cos(feature.rotation) * z,
    );
    transform.rotation.set(0, feature.rotation + rotation, 0);
    transform.updateMatrix();
    const part = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    geometry.dispose();
    part.applyMatrix4(transform.matrix);
    part.deleteAttribute('uv');
    color.set(tint);
    const colors = new Float32Array(part.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) colors.set([color.r, color.g, color.b], i);
    part.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    parts.push(part);
  };
  const box = (tint, x, y, z, w, h, d) => add(new THREE.BoxGeometry(w, h, d), tint, x, y, z);
  const roof = (x, y, z, w, d, h, tint) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(0, h);
    shape.lineTo(w / 2, 0);
    shape.closePath();
    add(
      new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, steps: 1 }),
      tint,
      x,
      y,
      z - d / 2,
    );
    box('#cb9970', x, y + h, z, 0.18, 0.16, d + 0.1);
  };
  for (feature of features) {
    const { width: w, length: d, height: h, foundation: f, variant } = feature;
    box('#8d8975', 0, -f / 2, 0, w + 1.2, f + 0.15, d + 1.2);
    box(walls[variant], 0, h / 2, 0, w, h, d);
    roof(0, h, 0, w + 0.6, d + 0.8, feature.type === 'chapel' ? 2.4 : 1.7, roofs[variant]);
    const front = d / 2 + 0.055;
    box('#354b49', 0, 1.15, front, 1.1, 2.3, 0.12);
    box('#d2c3a1', 0, 0.14, front + 0.5, 1.7, 0.28, 1.1);
    for (const side of [-1, 1]) {
      box('#334b4e', side * w * 0.29, h * 0.62, front, 0.9, 1.25, 0.1);
      box('#658071', side * w * 0.29 - 0.58, h * 0.62, front + 0.02, 0.26, 1.36, 0.13);
      box('#658071', side * w * 0.29 + 0.58, h * 0.62, front + 0.02, 0.26, 1.36, 0.13);
      box('#c7b494', side * w * 0.29, h * 0.62 - 0.69, front + 0.12, 1.25, 0.13, 0.32);
      // Side windows give the cottages depth from oblique sailing approaches.
      for (const z of [-d * 0.25, d * 0.25])
        box('#3e5655', side * (w / 2 + 0.04), h * 0.6, z, 0.1, 1.1, 0.85);
    }
    if (feature.type === 'chapel') {
      const tx = -w / 2 + 1.5,
        tz = d / 2 - 1.4;
      box('#e9e2cc', tx, 6.3, tz, 3, 12.6, 3.1);
      // Dark bell openings and narrow corner piers read clearly from the sea.
      box('#30423e', tx, 10.4, tz, 3.04, 1.8, 3.14);
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          box('#e9e2cc', tx + sx * 1.28, 10.4, tz + sz * 1.33, 0.44, 2, 0.44);
      box('#eee5cc', tx, 11.55, tz, 3.4, 0.35, 3.5);
      add(new THREE.ConeGeometry(2.5, 2.1, 4), '#9e6750', tx, 12.8, tz, Math.PI / 4);
      box('#514e3f', tx, 14.35, tz, 0.14, 1.4, 0.14);
      box('#514e3f', tx, 14.57, tz, 0.82, 0.14, 0.14);
      add(new THREE.CylinderGeometry(0.43, 0.66, 0.7, 10), '#a78e50', tx, 10, tz);
      box('#c3b797', 0, 0.02, d / 2 + 1.6, w + 2, 0.18, 2.8);
    } else {
      box('#c9b99c', w * 0.25, h + 0.8, -d * 0.2, 0.55, 1.8, 0.65);
      box('#715746', w * 0.25, h + 1.72, -d * 0.2, 0.72, 0.18, 0.82);
      box('#a97658', -w * 0.32, 0.3, front + 0.4, 0.65, 0.6, 0.65);
      add(new THREE.IcosahedronGeometry(0.55, 0), '#617845', -w * 0.32, 0.85, front + 0.4);
      if (variant % 2 === 0) {
        box('#827d64', w / 2 + 1.4, -0.25, 0, 1.6, 0.6, 1.6);
        add(new THREE.CylinderGeometry(0.1, 0.16, 2.3, 5), '#6a6050', w / 2 + 1.4, 1, 0);
        const crown = new THREE.IcosahedronGeometry(1, 1);
        crown.scale(1.5, 1.1, 1.4);
        add(crown, '#77825a', w / 2 + 1.4, 2.5, 0);
      }
    }
  }
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  const village = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }),
  );
  village.name = 'Coastal cottages and chapel';
  village.castShadow = true;
  village.receiveShadow = true;
  scene.add(village);
  return village;
}
