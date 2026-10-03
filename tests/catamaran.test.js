import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step, refreshDerived, KNOT, vesselWaterClearance } from '../src/physics.js';
import { CATAMARAN, getVessel, catamaranHullShape, vesselYawInertia } from '../src/vessels.js';
import { catamaranResistance, catamaranRightingMoment } from '../src/catamaran-physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import {
  createRigidBody,
  detectContact,
  separatedBeyond,
  solveContacts,
} from '../src/collisions.js';
import { bowFairlead, initializeAnchoredScenario, anchorSnapshot } from '../src/anchor.js';
import {
  catamaranHullGeometry,
  catamaranSection,
  insideCatamaranHull,
} from '../src/rendering/catamaran-hull.js';
import { islands } from '../src/physics.js';
import { shoreScale } from '../src/rendering/geography.js';

const ocean = (patch) =>
  Object.assign(
    initialState('haven', 'catamaran'),
    { x: 3000, z: 3000, heading: 0, sails: 0, windSpeed: 0, currentSpeed: 0, worldBodies: [] },
    patch,
  );
const run = (s, seconds, dt = 0.02) => {
  for (let t = 0; t < seconds - 1e-8; t += dt) step(s, Math.min(dt, seconds - t));
  return s;
};
const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≉ ${b}`);

test('a catamaran uses shared dimensions and separated mass for yaw inertia', () => {
  assert.equal(getVessel(initialState()).id, 'monohull');
  assert.equal(getVessel('unknown').id, 'monohull');
  const state = ocean();
  step(state, 0.02);
  assert.equal(state._playerBody.mass, CATAMARAN.mass);
  assert.equal(state._playerBody.shape.type, 'compound');
  near(state._playerBody.inertia, vesselYawInertia(CATAMARAN));
  assert.equal(CATAMARAN.length, 12);
  assert.equal(CATAMARAN.hullSpacing + CATAMARAN.hullBeam, CATAMARAN.beam);
});
test('both hull shells match the water exclusion and retain a clear center tunnel', () => {
  const geometry = catamaranHullGeometry();
  geometry.computeBoundingBox();
  near(geometry.boundingBox.min.z, -6);
  near(geometry.boundingBox.max.z, 6);
  near(geometry.boundingBox.min.y, -CATAMARAN.hullDraft, 1e-5);
  assert.ok([...geometry.attributes.position.array].every(Number.isFinite));
  for (const z of [-5, -3, 0, 3, 5]) {
    for (const x of [-2.5, 2.5]) assert.ok(insideCatamaranHull({ x, y: 0, z }));
    for (const x of [-1, 0, 1]) assert.equal(insideCatamaranHull({ x, y: 0, z }), false);
    assert.equal(insideCatamaranHull({ x: 2.5, y: catamaranSection(z).sheer + 0.1, z }), false);
  }
  geometry.dispose();
});
test('visual hull displacement and waterplane support the declared cruising load', () => {
  let volume = 0,
    waterplane = 0;
  for (let z = -5.99; z < 6; z += 0.02) {
    const { width, sheer, depth } = catamaranSection(z),
      atWater = sheer / depth;
    waterplane += 2 * width * (1 - 0.07 * atWater) * Math.sqrt(1 - atWater ** 2) * 0.02;
    for (let y = sheer - depth + 0.005; y < 0; y += 0.01) {
      const s = (sheer - y) / depth;
      volume += 2 * width * (1 - 0.07 * s) * Math.sqrt(Math.max(0, 1 - s * s)) * 0.0002;
    }
  }
  assert.ok(
    Math.abs(volume * 2 * 1025 - CATAMARAN.mass) < CATAMARAN.mass * 0.05,
    'submerged shells support the mass within 5%, before appendage volume',
  );
  near(waterplane, CATAMARAN.waterplaneArea, 0.1);
  near((14.5 * 6.9) / 2, CATAMARAN.mainArea, 0.1);
  near((17.2 * 3.26) / 2, CATAMARAN.jibArea, 0.1);
});
test('collision contacts hit either hull but do not invent a wall between the bows', () => {
  const cat = createRigidBody({ id: 'cat', kind: 'free', mass: 9500, shape: catamaranHullShape() });
  const buoy = (x) =>
    createRigidBody({
      id: 'buoy',
      kind: 'fixed',
      x,
      z: -4.5,
      shape: { type: 'circle', radius: 0.3 },
    });
  assert.equal(detectContact(cat, buoy(0)), null);
  assert.equal(separatedBeyond(cat, buoy(0)), true);
  for (const x of [-2.5, 2.5]) {
    assert.ok(detectContact(cat, buoy(x)));
    assert.equal(separatedBeyond(cat, buoy(x)), false);
  }
  const wall = createRigidBody({
    id: 'wall',
    kind: 'fixed',
    z: -5.9,
    shape: { type: 'box', length: 1, beam: 12 },
  });
  cat.vz = -3;
  const contacts = solveContacts([cat, wall]);
  assert.ok(contacts.some((c) => c.impulse > 0));
  assert.ok(cat.vz > -3);
});
test('linked throttle and neutral control both engines, including opposing commands', () => {
  const s = ocean();
  applyControlPatch(s, { portThrottle: 1, starboardThrottle: -1 });
  refreshDerived(s);
  assert.equal(s.portThrottle, 1);
  assert.equal(s.starboardThrottle, -1);
  assert.equal(s.throttle, 0);
  applyControlPatch(s, { throttle: 0 });
  refreshDerived(s);
  assert.equal(s.portThrottle, 0);
  assert.equal(s.starboardThrottle, 0);
  applyControlPatch(s, { throttle: 0.4 });
  refreshDerived(s);
  assert.equal(s.portThrottle, 0.4);
  assert.equal(s.starboardThrottle, 0.4);
  applyControlPatch(s, { portThrottle: -0.2 });
  refreshDerived(s);
  near(s.throttle, 0.1);
  assert.equal(s.starboardThrottle, 0.4);
});
test('equal engines propel straight ahead and astern without artificial yaw', () => {
  for (const throttle of [-0.7, 0.7]) {
    const s = run(ocean({ throttle }), 30);
    assert.ok(s.speed * throttle > 2);
    near(s.heading, 0);
    near(s.leeway, 0);
    near(s.heel, 0);
  }
});
test('differential thrust turns at rest and mirrors port/starboard commands', () => {
  const right = run(ocean({ portThrottle: 2 / 3, starboardThrottle: -1 }), 15);
  const left = run(ocean({ portThrottle: -1, starboardThrottle: 2 / 3 }), 15);
  assert.ok(right.yawRate > 1);
  assert.ok(left.yawRate < -1);
  near(right.yawRate, -left.yawRate);
  near(right.x - 3000, 3000 - left.x);
  near(right.z, left.z);
  near(right.speed, left.speed);
  assert.ok(
    Math.hypot(right.x - 3000, right.z - 3000) < 8,
    'balanced thrust maneuvers within a boat length',
  );
});
test('rudder force reverses astern and cannot steer a motionless unpowered hull', () => {
  const ahead = run(ocean({ speed: 4, rudder: 20 }), 3),
    astern = run(ocean({ speed: -4, rudder: 20 }), 3);
  assert.ok(ahead.yawRate > 0);
  assert.ok(astern.yawRate < 0);
  const still = run(ocean({ rudder: 35 }), 30);
  near(still.speed, 0);
  near(still.yawRate, 0);
  near(still.x, 3000);
  near(still.z, 3000);
});
test('passive drag is dissipative and symmetric without a hard monohull speed cap', () => {
  let previousForce = 0;
  for (const speed of [0.1, 1, 2, 4, 6, 8]) {
    const force = catamaranResistance(speed);
    assert.ok(force > previousForce);
    near(force, -catamaranResistance(-speed));
    previousForce = force;
  }
  const s = ocean({ speed: 9, leeway: 0.4, yawRate: 3 });
  const energy = () =>
    0.5 * CATAMARAN.mass * ((s.speed * KNOT) ** 2 + s.leeway ** 2) +
    0.5 * vesselYawInertia(CATAMARAN) * ((s.yawRate * Math.PI) / 180) ** 2;
  const initial = energy();
  let previous = initial;
  for (let i = 0; i < 3000; i++) {
    step(s, 0.02);
    const next = energy();
    assert.ok(next <= previous + 1e-7, 'passive hull cannot gain kinetic energy');
    previous = next;
  }
  assert.ok(energy() < initial * 0.1);
  assert.ok(Math.abs(s.yawRate) < 0.1);
});
test('catamaran stability is stiff initially but loses righting lever after hull unloading', () => {
  assert.ok(catamaranRightingMoment(2) > 20000);
  assert.ok(catamaranRightingMoment(20) > catamaranRightingMoment(50));
  assert.ok(catamaranRightingMoment(70) < 0);
  for (const angle of [2, 10, 30, 60])
    near(catamaranRightingMoment(angle), -catamaranRightingMoment(-angle));
  const unreefed = ocean({
    sails: 1,
    windSpeed: 20,
    windDirection: 90,
    mainSheet: 40,
    jibSheet: 40,
  });
  const reefed = ocean({
    sails: 1,
    windSpeed: 20,
    windDirection: 90,
    mainSheet: 40,
    jibSheet: 40,
    reefLevel: 2,
  });
  for (let i = 0; i < 500; i++)
    for (const s of [unreefed, reefed]) {
      s.heading = 0;
      s.yawRate = 0;
      step(s, 0.02);
    }
  assert.ok(unreefed.speed > 1);
  assert.ok(Math.abs(unreefed.heel) > 0);
  assert.ok(Math.abs(unreefed.heel) < 10);
  assert.ok(Math.abs(reefed.heel) < Math.abs(unreefed.heel));
  assert.ok(reefed.stabilityLoad < unreefed.stabilityLoad);
  assert.equal(unreefed.capsized, false);
});
test('bare catamaran windage causes drift and current remains a separate ground velocity', () => {
  const windy = run(ocean({ windSpeed: 20, windDirection: 90 }), 20);
  assert.ok(windy.x < 2997);
  const current = run(ocean({ currentSpeed: 2, currentDirection: 90 }), 10);
  // Apparent air from moving with the current introduces a small opposing windage force.
  assert.ok(current.x > 3000 + 18 * KNOT);
  assert.ok(current.x < 3000 + 20 * KNOT);
});
test('both hulls and their appendages participate in grounding', () => {
  const island = islands[0];
  const edge = island.x + island.rx * shoreScale(0) * (1 + CATAMARAN.draft / 24);
  const s = ocean({ x: edge + 1, z: island.z, heading: 0 });
  assert.ok(
    vesselWaterClearance(s).grounded,
    'shoreward hull grounds even with center in deeper water',
  );
  step(s, 0.1);
  assert.equal(s.grounded, true);
  const before = { x: s.x, z: s.z };
  applyControlPatch(s, { throttle: 1 });
  run(s, 2);
  near(s.x, before.x);
  near(s.z, before.z);
});
test('catamaran anchor uses its own bow fitting and holds both hulls through yaw', () => {
  const s = ocean({ currentSpeed: 2, currentDirection: 90 }),
    bow = bowFairlead(s);
  near(bow.z, s.z - 5.5);
  near(bow.y, 1.35);
  initializeAnchoredScenario(s, { rode: 110 });
  run(s, 180, 0.1);
  const snapshot = anchorSnapshot(s);
  assert.ok(snapshot.distance <= snapshot.swingRadius + 0.02);
  near(snapshot.anchorPoint.x, bow.x);
  near(snapshot.anchorPoint.z, bow.z);
});
test('catamaran integration converges across frame sizes and stays finite in extreme wind', () => {
  const patch = { sails: 1, windSpeed: 15, windDirection: 90, rudder: 10 };
  const a = run(ocean(patch), 12, 0.01),
    b = run(ocean(patch), 12, 0.1);
  near(a.speed, b.speed, 0.02);
  near(a.heading, b.heading, 0.08);
  near(a.heel, b.heel, 0.03);
  near(a.x, b.x, 0.06);
  const extreme = run(
    ocean({ sails: 1, windSpeed: 70, windDirection: 90, mainSheet: 30, jibSheet: 30 }),
    100,
    0.1,
  );
  for (const key of ['x', 'z', 'speed', 'heading', 'heel', 'rollRate', 'leeway', 'yawRate'])
    assert.ok(Number.isFinite(extreme[key]), key);
  const capsized = run(ocean({ heel: 65, capsized: true, throttle: 1 }), 20, 0.1);
  assert.ok(capsized.capsized);
  assert.ok(Math.abs(capsized.speed) < 0.01, 'capsized engine provides no thrust');
  assert.equal(initialState('haven', 'catamaran').capsized, false);
});
