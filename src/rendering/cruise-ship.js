import * as THREE from 'three';
import { sceneryBuilder } from './scenery-geometry.js';
import { createCruiseEncounters, cruiseHullShape } from '../world/cruise-encounters.js';

function shipGeometry(decks) {
  const b = sceneryBuilder();
  const outline = new THREE.Shape(
    cruiseHullShape().vertices.map(([x, z]) => new THREE.Vector2(x, z)),
  );
  const hull = new THREE.ExtrudeGeometry(outline, {
    depth: 10,
    bevelEnabled: false,
    curveSegments: 10,
  });
  hull.rotateX(Math.PI / 2);
  hull.translate(0, 7, 0);
  b.add(hull, '#173d53');
  b.box('#e9e9de', 0, 7, 4, 27, 1, 140);
  for (let d = 0; d < decks; d++) {
    const y = 8.8 + d * 3.05,
      length = 133 - Math.max(0, d - decks + 3) * 11;
    const width = 26 - Math.max(0, d - decks + 2) * 2;
    b.box('#f3f0df', 0, y, 4, width, 2.85, length);
    b.box('#587e8c', 0, y + 0.12, 4, width + 0.06, 1.45, length - 3);
    b.box('#f8f5e7', 0, y + 1.3, 4, width + 1, 0.28, length + 1);
    // Balcony partitions break the dark glass into cabin rows.
    for (const side of [-1, 1])
      for (let z = -length / 2 + 7; z < length / 2; z += 3.3)
        b.box('#e3e7df', side * (width / 2 + 0.07), y + 0.15, z, 0.13, 1.6, 0.14);
  }
  const roof = 10.3 + (decks - 1) * 3.05;
  b.box('#d2b18a', 0, roof + 0.15, 11, 21, 0.2, 81);
  b.box('#73c9cf', 0, roof + 0.32, 24, 7, 0.15, 18);
  b.box('#eaece3', 0, roof + 2, -45, 24, 4, 15);
  b.box('#315a6c', 0, roof + 2.4, -52.6, 23, 1.8, 0.1);
  b.box('#d09450', 0, roof + 4, 49, 8, 8, 11);
  b.box('#293f47', 0, roof + 8.2, 49, 8.4, 0.65, 11.4);
  b.oval('#f5f3e8', -7, roof + 4.8, -33, 2, 2, 2, 2);
  b.oval('#f5f3e8', 7, roof + 4.8, -33, 2, 2, 2, 2);
  for (const side of [-1, 1])
    for (let z = -15; z <= 45; z += 20) {
      b.oval('#e79d42', side * 14, 11, z, 1.5, 1.6, 6.8);
      b.oval('#f6e8ce', side * 14, 12, z, 1.5, 0.65, 6);
    }
  for (const side of [-1, 1]) {
    b.box('#d9e9e4', side * 10.5, roof + 1.1, 12, 0.1, 0.1, 81);
    for (let z = -27; z < 53; z += 4)
      b.box('#d9e9e4', side * 10.5, roof + 0.65, z, 0.07, 1.2, 0.07);
  }
  return { geometry: b.finish(), roof };
}

export function createCruiseShip(scene, locationId, quality, options) {
  const group = new THREE.Group();
  group.name = 'Visiting cruise ship';
  group.visible = false;
  scene.add(group);
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  const initial = shipGeometry(8),
    ship = new THREE.Mesh(initial.geometry, material);
  group.add(ship);
  const b = sceneryBuilder();
  b.oval('#e3b98b', 0, 1.5, 0, 0.19, 0.22, 0.18);
  b.box('#faf6e8', 0, 1.1, 0, 0.4, 0.55, 0.26);
  for (const x of [-0.11, 0.11]) b.box('#365369', x, 0.62, 0, 0.13, 0.5, 0.14);
  // A raised arm reads as a wave from the yacht without skeletal animation.
  b.box('#e3b98b', 0.31, 1.4, 0, 0.12, 0.58, 0.13);
  const tourists = new THREE.InstancedMesh(b.finish(), material, 48);
  tourists.name = 'Cruise tourists';
  tourists.frustumCulled = false;
  group.add(tourists);
  const foam = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      color: '#cbe8e3',
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const wakePositions = [];
  // A tapered stern wake, one small mesh rather than a particle system.
  for (const [x, z] of [
    [-13, 77],
    [13, 77],
    [-38, 240],
    [13, 77],
    [38, 240],
    [-38, 240],
  ])
    wakePositions.push(x, 0.015, z);
  foam.geometry.dispose();
  foam.geometry = new THREE.BufferGeometry();
  foam.geometry.setAttribute('position', new THREE.Float32BufferAttribute(wakePositions, 3));
  group.add(foam);
  const encounters = createCruiseEncounters(locationId, options),
    transform = new THREE.Object3D();
  let budget = quality,
    decks = 8,
    roof = initial.roof;
  return {
    group,
    encounters,
    setQuality(next) {
      budget = next;
    },
    update(state, time, view, enabled) {
      const event = encounters.update(state, time, view, enabled);
      group.visible = Boolean(event);
      if (!event) return;
      if (decks !== event.decks) {
        const next = shipGeometry(event.decks);
        ship.geometry.dispose();
        ship.geometry = next.geometry;
        roof = next.roof;
        decks = event.decks;
      }
      group.position.set(event.body.x, 0, event.body.z);
      group.rotation.y = (-event.body.heading * Math.PI) / 180;
      tourists.count = ['low', 'minimum', 'compatibility'].includes(budget.name) ? 16 : 48;
      for (let i = 0; i < tourists.count; i++) {
        const side = i % 2 ? -1 : 1;
        transform.position.set(side * 9.7, roof, (Math.floor(i / 2) / 24) * 73 - 25);
        transform.rotation.set(0, (side * Math.PI) / 2, Math.sin(event.age * 2 + i) * 0.035);
        transform.scale.setScalar(1);
        transform.updateMatrix();
        tourists.setMatrixAt(i, transform.matrix);
        tourists.setColorAt(i, new THREE.Color().setHSL((i * 0.17) % 1, 0.35, 0.68));
      }
      tourists.instanceMatrix.needsUpdate = true;
      tourists.instanceColor.needsUpdate = true;
    },
    dispose() {
      encounters.dispose();
      group.visible = false;
    },
  };
}
