import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step } from '../src/physics.js';
import {
  createRigidBody,
  detectContact,
  recordContactImpacts,
  stepRigidBodies,
} from '../src/collisions.js';
import { impactMotion } from '../src/rendering/body-motion.js';
import { buoyBodyDefinition } from '../src/world/bodies.js';
import { createRace, advanceRace, RACE_COURSES } from '../src/racing/race.js';

for (const vesselId of ['monohull', 'catamaran']) {
  test(`${vesselId} pushes a navigation buoy, which rocks and settles on its mooring`, () => {
    const state = initialState('haven', vesselId);
    const buoy = state.worldBodies.find((body) => body.visual?.type === 'buoy');
    const anchor = { ...buoy.mooring };
    Object.assign(state, {
      x: buoy.x - 9,
      z: buoy.z + (vesselId === 'catamaran' ? 2.5 : 0),
      heading: 90,
      speed: 4,
      mainHoist: 0,
      jibHoist: 0,
      sails: 0,
      windSpeed: 0,
      currentSpeed: 0,
    });
    let rocking = 0;
    for (let i = 0; i < 120; i++) {
      step(state, 1 / 60);
      const motion = impactMotion(buoy, state.elapsed);
      rocking = Math.max(rocking, Math.hypot(motion.roll, motion.pitch));
    }
    assert.equal(state.collision.bodyId, buoy.id);
    assert.ok(buoy.x - anchor.x > 0.5, 'the contacted buoy physically moves');
    assert.ok(buoy.vx > 0, 'impact transfers momentum');
    assert.ok(rocking > 0.05, 'the initial knock remains visibly noticeable');
    assert.equal(buoy.mooring.x, anchor.x, 'the seabed attachment stays fixed');
    Object.assign(state, { x: anchor.x - 50, speed: 0, leeway: 0, yawRate: 0 });
    for (let i = 0; i < 200; i++) step(state, 0.1);
    assert.ok(Math.hypot(buoy.x - anchor.x, buoy.z - anchor.z) < 1.1);
    assert.ok(Math.hypot(buoy.vx, buoy.vz) < 0.05);
  });
}

test('small sustained-contact impulses do not erase the initial buoy reaction', () => {
  const buoy = createRigidBody(buoyBodyDefinition('buoy', { x: 0, z: 0 }, 0));
  const boat = createRigidBody({
    id: 'boat',
    kind: 'free',
    mass: 5600,
    shape: { type: 'box', length: 12, beam: 4 },
  });
  const contact = { aId: 'boat', bId: 'buoy', impulse: 900, point: { x: -1, z: 0 } };
  recordContactImpacts([boat, buoy], [contact], 1);
  recordContactImpacts([boat, buoy], [{ ...contact, impulse: 5 }], 1.02);
  assert.equal(buoy.lastImpact.time, 1);
  assert.ok(Math.abs(impactMotion(buoy, 1.1).roll) > 0.1);
  assert.deepEqual(impactMotion(buoy, 4), { roll: 0, pitch: 0 });
});

test('every race starts clear of solid marks and keeps buoy state isolated between runs', () => {
  for (const course of RACE_COURSES) {
    const race = createRace(course.id),
      fresh = createRace(course.id);
    for (const buoy of race.marks) {
      assert.equal(
        race.player.worldBodies.find((body) => body.id === buoy.id),
        buoy,
      );
      for (const racer of race.racers) {
        Object.assign(racer.body, {
          x: racer.state.x,
          z: racer.state.z,
          heading: racer.state.heading,
        });
        assert.equal(
          detectContact(racer.body, buoy),
          null,
          `${course.id}/${racer.id} starts clear`,
        );
      }
    }
    race.marks[0].x += 2;
    assert.equal(fresh.marks[0].x, course.marks[0].x);
  }
});

for (const racerIndex of [0, 1]) {
  test(`${racerIndex ? 'rival' : 'player'} contact pushes the shared numbered race buoy`, () => {
    const race = createRace('harbor-sprint', 'club', { changingWeather: false });
    race.countdown = 0;
    race.status = 'racing';
    const buoy = race.marks[0],
      x = buoy.x,
      z = buoy.z;
    const state = race.racers[racerIndex].state;
    Object.assign(state, {
      x: x - 8.35,
      z,
      heading: 90,
      speed: 5,
      mainHoist: 0,
      jibHoist: 0,
      sails: 0,
    });
    advanceRace(race, 0.5);
    assert.ok(buoy.x > x + 0.15);
    assert.ok(buoy.vx > 0);
    assert.equal(buoy.lastImpact.otherId, race.racers[racerIndex].id);
    assert.ok(state.speed < 5);
    assert.equal(buoy.mooring.x, x);
  });
}

test('shared race buoy motion advances once per simulation step, not once per racer', () => {
  const race = createRace('harbor-sprint', 'club', { changingWeather: false });
  race.countdown = 0;
  race.status = 'racing';
  const buoy = race.marks[0];
  buoy.vx = 2;
  const expected = structuredClone(buoy);
  stepRigidBodies([expected], 1 / 30);
  advanceRace(race, 1 / 30);
  assert.ok(Math.abs(buoy.x - expected.x) < 1e-9);
  assert.ok(Math.abs(buoy.vx - expected.vx) < 1e-9);
});
