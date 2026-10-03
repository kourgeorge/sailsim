import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CATAMARAN } from '../vessels.js';
import { anchorSnapshot } from '../anchor.js';
import {
  mesh,
  box,
  bar,
  rope,
  cylinder,
  canvasTexture,
  labelTexture,
  batchStaticMeshes,
} from './materials.js';
import {
  catamaranHullGeometry,
  catamaranDeckGeometry,
  catamaranSection,
} from './catamaran-hull.js';
import { makeSail, winch } from './yacht.js';
import { rigVisualState, smoothBoomAngle } from './rig-state.js';
import { createAnchorRig } from './anchor-rig.js';
import { createHelmDisplay } from './helm-display.js';

// Local +X starboard, −Z forward. The two watertight shells and the raised
// bridge deck are separate: open water is visible through the forward tunnel.
export function createCatamaran(mat) {
  const boat = new THREE.Group();
  boat.name = 'Haven 40 cruising catamaran';
  boat.userData.vesselId = 'catamaran';
  const shell = mat.gelcoat.clone();
  shell.side = THREE.DoubleSide;
  const hullGeometry = catamaranHullGeometry(),
    deckGeometry = catamaranDeckGeometry();
  const rudders = [],
    propellers = [];
  for (const side of [-1, 1]) {
    const x = (side * CATAMARAN.hullSpacing) / 2;
    const hull = mesh(boat, hullGeometry, shell, x, 0, 0);
    hull.name = side < 0 ? 'port-hull' : 'starboard-hull';
    mesh(boat, deckGeometry, mat.grip, x, 0, 0);
    // Long shallow fixed keels and rudders, with their lower tips at the
    // same depths used by the grounding model.
    box(boat, mat.navy, x, -0.82, -0.6, 0.2, 0.76, 3.4, 0.06);
    const rudder = box(boat, mat.navy, x, -0.68, 4.8, 0.09, 0.94, 0.75, 0.045);
    rudders.push(rudder);
    bar(boat, mat.steel, [x, -0.25, 3.7], [x, -0.7, 3.7], 0.04);
    const propeller = new THREE.Group();
    propeller.position.set(x, -0.65, 3.8);
    boat.add(propeller);
    propellers.push(propeller);
    const hub = cylinder(propeller, mat.steel, 0, 0, 0, 0.075, 0.075, 0.17, 12);
    hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const blade = box(
        propeller,
        mat.aluminum,
        Math.cos(a) * 0.12,
        Math.sin(a) * 0.12,
        0,
        0.24,
        0.08,
        0.025,
        0.03,
      );
      blade.rotation.z = a;
      blade.rotation.y = 0.35;
    }
    // Hull glazing, sheer rail, boot stripe and cleats follow each slender hull.
    for (const flank of [-1, 1]) {
      const sheer = [],
        stripe = [];
      for (let z = -5.85; z <= 4.05; z += 0.18) {
        const s = catamaranSection(z);
        sheer.push([x + flank * s.width, s.sheer + 0.07, z]);
        stripe.push([x + flank * s.width * 0.88, 0.05, z]);
      }
      rope(boat, mat.teak, sheer, 0.022, 64);
      rope(boat, mat.navy, stripe, 0.035, 64);
    }
    for (const z of [-2.7, -1.2, 0.3, 1.8])
      box(
        boat,
        mat.glass,
        x + side * (catamaranSection(z).width + 0.015),
        0.67,
        z,
        0.025,
        0.33,
        1.02,
        0.09,
      );
    for (const z of [-4.1, 2.1]) {
      box(boat, mat.aluminum, x, catamaranSection(z).sheer + 0.06, z, 0.72, 0.065, 0.82, 0.05);
      box(boat, mat.glass, x, catamaranSection(z).sheer + 0.1, z, 0.62, 0.025, 0.72, 0.045);
    }
    for (const z of [-5.35, 3.8]) {
      const y = catamaranSection(z).sheer + 0.08;
      box(boat, mat.steel, x, y, z, 0.15, 0.04, 0.3);
      bar(boat, mat.steel, [x, y + 0.12, z - 0.22], [x, y + 0.12, z + 0.22], 0.025);
    }
    // Broad aft steps are part of each transom, with a clear swim platform.
    for (let i = 0; i < 4; i++) {
      const z = 4.25 + i * 0.5,
        y = 1.35 - i * 0.25;
      box(boat, mat.gelcoat, x, y - 0.08, z, 1.1, 0.16, 0.51, 0.04);
      box(boat, mat.teak, x, y + 0.015, z, 0.97, 0.04, 0.42, 0.025);
    }
    const rail = [];
    for (const z of [-5.3, -3.8, -1.8, 0.4, 2.6, 4]) {
      const s = catamaranSection(z),
        rx = x + side * (s.width - 0.06);
      bar(boat, mat.steel, [rx, s.sheer, z], [rx, s.sheer + 0.7, z], 0.023);
      rail.push([rx, s.sheer + 0.7, z]);
    }
    rope(boat, mat.steel, rail, 0.01, 60);
    rope(
      boat,
      mat.steel,
      rail.map(([x, y, z]) => [x, y - 0.32, z]),
      0.008,
      60,
    );
    rope(
      boat,
      mat.steel,
      [
        [x + side * 0.15, 2.17, -5.55],
        [x, 2.2, -5.95],
        [x - side * 0.15, 2.17, -5.55],
      ],
      0.024,
      16,
    );
    for (const z of [1.8, 3.3]) {
      const fx = x + side * 0.86;
      rope(
        boat,
        mat.ivory,
        [
          [fx, 2, z],
          [fx, 0.9, z],
        ],
        0.012,
        8,
      );
      mesh(boat, new THREE.CapsuleGeometry(0.15, 0.5, 4, 10), mat.gelcoat, fx, 0.7, z);
    }
    const lamp = mat.paint(side < 0 ? '#cd3b39' : '#20866d', {
      emissive: side < 0 ? '#7a1715' : '#074f39',
      emissiveIntensity: 0.5,
    });
    mesh(boat, new THREE.SphereGeometry(0.07, 10, 8), lamp, x + side * 0.15, 1.7, -5.5);
  }
  // Bridge-deck underside clears still water by 0.8 m. Side decks remain
  // outside the saloon; the open aft cockpit sits on the same structural deck.
  box(boat, mat.gelcoat, 0, 1, 0.85, 4.15, 0.4, 6.7, 0.12);
  box(boat, mat.teak, 0, 1.225, 2.65, 3.8, 0.05, 2.85, 0.035);
  box(boat, mat.gelcoat, 0, 1.3, -5.25, 5.1, 0.22, 0.28, 0.08);
  bar(boat, mat.aluminum, [-2.5, 1.35, -5.25], [0, 2, -5.25], 0.035);
  bar(boat, mat.aluminum, [0, 2, -5.25], [2.5, 1.35, -5.25], 0.035);
  box(boat, mat.gelcoat, 0, 1.3, -3.9, 0.28, 0.18, 3.1, 0.04);
  const netTexture = canvasTexture(
    128,
    128,
    (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = '#d1d5c7';
      c.lineWidth = 1.1;
      for (let i = 0; i <= 128; i += 8) {
        c.beginPath();
        c.moveTo(i, 0);
        c.lineTo(i, h);
        c.moveTo(0, i);
        c.lineTo(w, i);
        c.stroke();
      }
    },
    { repeat: 3 },
  );
  const netMaterial = new THREE.MeshStandardMaterial({
    map: netTexture,
    transparent: true,
    alphaTest: 0.15,
    side: THREE.DoubleSide,
    roughness: 1,
  });
  for (const side of [-1, 1]) {
    const net = mesh(
      boat,
      new THREE.PlaneGeometry(1.45, 2.62),
      netMaterial,
      side * 0.94,
      1.31,
      -3.85,
    );
    net.rotation.x = -Math.PI / 2;
    net.name = 'foredeck-trampoline';
    for (const x of [side * 0.21, side * 1.67])
      bar(boat, mat.ivory, [x, 1.32, -5.16], [x, 1.32, -2.55], 0.022);
  }
  // Light coachroof with wraparound glazing and visibly raked front windows.
  box(boat, mat.gelcoat, 0, 1.6, -0.65, 3.9, 0.65, 3.7, 0.18);
  box(boat, mat.gelcoat, 0, 2.4, -0.5, 3.7, 1.15, 3.35, 0.2);
  const front = box(boat, mat.glass, 0, 2.55, -2.18, 3.32, 0.92, 0.06, 0.08);
  front.rotation.x = 0.22;
  for (const x of [-1.12, 0, 1.12])
    bar(boat, mat.gelcoat, [x, 2.06, -2.28], [x, 3.06, -2.07], 0.045);
  for (const side of [-1, 1]) {
    const glass = box(boat, mat.glass, side * 1.86, 2.55, -0.65, 0.04, 0.93, 2.9, 0.1);
    glass.rotation.z = side * 0.06;
    for (const z of [-1.48, 0.05])
      bar(boat, mat.gelcoat, [side * 1.9, 2.05, z], [side * 1.83, 3.05, z], 0.045);
    bar(boat, mat.steel, [side * 2.02, 1.5, -2.05], [side * 2.02, 2, -2.05], 0.026);
    bar(boat, mat.teak, [side * 2.02, 2, -2.05], [side * 2.02, 2, 1], 0.027);
  }
  box(boat, mat.gelcoat, 0, 3.14, -0.65, 4.16, 0.18, 4.08, 0.16);
  // Rear sliding saloon doors, trim and shaded cockpit seating.
  box(boat, mat.navy, 0, 2.15, 1.23, 2.8, 1.75, 0.05, 0.045);
  for (const x of [-0.68, 0.68]) box(boat, mat.glass, x, 2.17, 1.275, 1.3, 1.61, 0.03, 0.025);
  for (const x of [-0.07, 0.07]) bar(boat, mat.steel, [x, 1.9, 1.31], [x, 2.3, 1.31], 0.018);
  box(boat, mat.gelcoat, -1.2, 1.5, 2.75, 0.8, 0.55, 2.65, 0.12);
  box(boat, mat.cushion, -1.2, 1.85, 2.75, 0.75, 0.16, 2.5, 0.07);
  box(boat, mat.cushion, -1.62, 2.12, 2.75, 0.15, 0.55, 2.45, 0.05);
  box(boat, mat.gelcoat, -0.4, 1.5, 3.9, 2.4, 0.55, 0.66, 0.1);
  box(boat, mat.cushion, -0.4, 1.85, 3.9, 2.28, 0.16, 0.61, 0.06);
  cylinder(boat, mat.steel, -0.35, 1.62, 2.55, 0.07, 0.07, 0.7);
  box(boat, mat.teak, -0.35, 2.02, 2.55, 1.1, 0.08, 1.45, 0.12);
  box(boat, mat.gelcoat, -0.55, 3.28, 2.5, 3.2, 0.14, 3.1, 0.14);
  for (const x of [-2, 1]) bar(boat, mat.steel, [x, 1.3, 3.8], [x, 3.26, 3.8], 0.04);
  const solar = mat.paint('#153c52', { metalness: 0.35, roughness: 0.28 });
  for (const x of [-0.96, 0.96]) {
    box(boat, mat.aluminum, x, 3.25, -0.3, 1.58, 0.05, 2.55, 0.035);
    box(boat, solar, x, 3.285, -0.3, 1.49, 0.018, 2.45, 0.015);
    for (let i = 0; i < 7; i++)
      bar(
        boat,
        mat.steel,
        [x - 0.72, 3.3, -1.45 + i * 0.38],
        [x + 0.72, 3.3, -1.45 + i * 0.38],
        0.005,
        4,
      );
  }
  // Raised starboard helm, dual engine levers, working wheel and instrument.
  box(boat, mat.gelcoat, 2.15, 1.67, 2.6, 1.05, 0.76, 1.9, 0.1);
  box(boat, mat.teak, 2.15, 2.065, 2.9, 0.92, 0.035, 1.15, 0.02);
  box(boat, mat.gelcoat, 2.15, 2.63, 1.85, 0.98, 1.1, 0.64, 0.15);
  const wheel = new THREE.Group();
  wheel.position.set(2.15, 3, 2.29);
  wheel.rotation.x = -0.2;
  boat.add(wheel);
  mesh(wheel, new THREE.TorusGeometry(0.4, 0.022, 8, 48), mat.teak);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    bar(wheel, mat.steel, [0, 0, 0], [Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0], 0.012);
  }
  const levers = [];
  for (const x of [2.67, 2.8]) {
    const lever = new THREE.Group();
    lever.position.set(x, 2.87, 2.05);
    boat.add(lever);
    bar(lever, mat.steel, [0, 0, 0], [0, 0.3, 0], 0.02);
    mesh(lever, new THREE.SphereGeometry(0.055, 10, 8), mat.rubber, 0, 0.3, 0);
    levers.push(lever);
  }
  const display = createHelmDisplay(boat, mat);
  display.group.position.set(2.15, 3.55, 1.93);
  display.group.scale.setScalar(0.78);
  display.group.rotation.x = -0.1;
  const transom = mesh(
    boat,
    new THREE.PlaneGeometry(1.7, 0.35),
    new THREE.MeshStandardMaterial({
      map: labelTexture('TWIN HORIZON', 'HAVEN 40 CAT'),
      transparent: true,
    }),
    0,
    1.11,
    4.212,
  );
  transom.name = 'catamaran-nameplate';
  // Swept shrouds brace the mast without a backstay across the wide mainsail.
  cylinder(boat, mat.aluminum, 0, 11.13, -1.7, 0.09, 0.13, 15.8, 16);
  for (const y of [8.9, 13.7]) bar(boat, mat.aluminum, [-1.6, y, -1.3], [1.6, y, -1.3], 0.04);
  for (const side of [-1, 1])
    rope(
      boat,
      mat.steel,
      [
        [side * 2.65, 1.45, 0.3],
        [side * 1.6, 8.9, -1.3],
        [side * 1.6, 13.7, -1.3],
        [0, 19, -1.7],
      ],
      0.012,
      40,
    );
  bar(boat, mat.steel, [0, 19, -1.7], [0, 1.55, -5.5], 0.014);
  const boom = new THREE.Group();
  boom.name = 'mainsail-boom';
  boom.position.set(0, 4.3, -1.7);
  boat.add(boom);
  bar(boom, mat.aluminum, [0, 0, 0], [0, 0, 7], 0.105, 12);
  const mainGroup = new THREE.Group();
  mainGroup.position.y = 0.15;
  boom.add(mainGroup);
  const main = makeSail(mainGroup, mat, { height: 14.5, foot: 6.9, mark: 'H  40 C' });
  const jibGroup = new THREE.Group();
  jibGroup.position.set(0, 1.6, -1.7);
  boat.add(jibGroup);
  const jib = makeSail(jibGroup, mat, { height: 17.2, foot: 3.26, jib: true, luffReach: 3.8 });
  const bag = box(boom, mat.navy, 0, 0.13, 3.3, 0.28, 0.22, 6.5, 0.07);
  box(boat, mat.aluminum, 0, 3.4, 3.8, 3.4, 0.07, 0.07);
  const car = box(boat, mat.rubber, 0, 3.46, 3.8, 0.21, 0.13, 0.13);
  const sheet = bar(boat, mat.ivory, [0, 3.46, 3.8], [0, 4.3, 4.3], 0.023);
  winch(boat, mat, 2.62, 3.25, 1.47, mat.green);
  winch(boat, mat, -1.97, 1.56, 1.42, mat.red);
  for (const side of [-1, 1])
    rope(
      boat,
      side < 0 ? mat.red : mat.green,
      [
        [side * 0.1, 1.65, -2.8],
        [side * 2, 1.5, -1],
        [side * 2, 1.55, 1.4],
      ],
      0.017,
      35,
    );
  const anchorRig = createAnchorRig(mat, { fairlead: CATAMARAN.fairlead });
  boat.add(anchorRig.group);
  // Bow mooring/bridle strongpoints on both hulls.
  for (const side of [-1, 1])
    bar(boat, mat.steel, [side * 2.5, 1.45, -5.3], [side * 2.5, 1.65, -5.3], 0.035);
  batchStaticMeshes(boat, mergeGeometries, [...rudders, car, sheet]);
  let previousTime = null;
  return {
    group: boat,
    instrumentCanvas: display.canvas,
    update(state, time) {
      const rig = rigVisualState(state),
        side = Math.sign(state.apparentWindAngle) || 1;
      boom.rotation.y =
        previousTime === null
          ? rig.boomAngle
          : smoothBoomAngle(boom.rotation.y, rig.boomAngle, time - previousTime);
      previousTime = time;
      const mainHoist = state.mainHoist ?? 1,
        jibHoist = state.jibHoist ?? 1;
      mainGroup.visible = mainHoist > 0.01;
      mainGroup.scale.y = mainHoist * [1, 0.72, 0.48][state.reefLevel || 0];
      bag.visible = mainHoist < 0.99;
      jibGroup.visible = jibHoist > 0.01;
      main.update(time, state.mainFlow === 'Luffing' ? 1 : 0.08, {
        side: -side,
        outhaul: state.outhaul,
        vang: state.vang,
      });
      jib.update(time, state.jibFlow === 'Luffing' ? 1 : 0.08, {
        side: -side,
        angle: (-side * state.jibSheet * Math.PI) / 180,
        deploy: jibHoist,
      });
      car.position.x = rig.travelerX * 1.5;
      const tip = new THREE.Vector3(0, 0, 6)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), boom.rotation.y)
        .add(boom.position);
      const base = new THREE.Vector3(car.position.x, 3.46, 3.8),
        delta = tip.clone().sub(base);
      sheet.position.copy(base).add(tip).multiplyScalar(0.5);
      sheet.scale.y = delta.length() / Math.hypot(0.84, 0.5);
      sheet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
      wheel.rotation.z = (-state.rudder * Math.PI) / 90;
      rudders.forEach((rudder) => (rudder.rotation.y = (-state.rudder * Math.PI) / 180));
      levers.forEach((lever, i) => {
        const throttle = (i ? state.starboardThrottle : state.portThrottle) || 0;
        lever.rotation.x = -throttle * 0.7;
        propellers[i].rotation.z = time * throttle * 16;
      });
      display.update(state, time);
      anchorRig.update(anchorSnapshot(state), boat);
    },
  };
}
