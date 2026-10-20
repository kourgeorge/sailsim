import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialState,
  step,
  refreshDerived,
  sailDynamics,
  backedJibForce,
  KNOT,
} from '../src/physics.js';
import {
  createChallenge,
  advanceChallenge,
  assessChallenge,
  challengeRequirements,
  challengeChart,
} from '../src/challenges/engine.js';
import { rigVisualState } from '../src/rendering/rig-state.js';
import { heaveToLab } from '../src/learning/labs/heave-to.js';
import { lessons } from '../src/learning/curriculum.js';

const settle = (patch = {}, dt = 0.1) => {
  const s = Object.assign(
    initialState(),
    {
      x: 0,
      z: 1200,
      heading: 50,
      windDirection: 0,
      windSpeed: 12,
      currentSpeed: 0,
      speed: 2,
      jibSheet: 22,
      jibSide: -1,
      mainSheet: 40,
      trim: 40,
      rudder: -30,
    },
    patch,
  );
  for (let t = 0; t < 180 - 1e-8; t += dt) step(s, dt);
  return s;
};
test('a backed jib brakes, pushes leeward, and works inside the normal no-go zone', () => {
  for (const angle of [0, 20, 50]) {
    const f = backedJibForce(-angle, 22, 22, 20, -1),
      mirror = backedJibForce(angle, 22, 22, 20, 1);
    assert.ok(f.drive < 0 && f.side > 0);
    assert.equal(f.drive, mirror.drive);
    assert.equal(f.side, -mirror.side);
  }
  const s = Object.assign(initialState(), { windDirection: 0, heading: 0, jibSide: -1 });
  refreshDerived(s);
  assert.equal(s.jibBacked, true);
  assert.ok(sailDynamics(s).jib.side > 0);
  s.jibHoist = 0;
  refreshDerived(s);
  assert.equal(s.jibBacked, false);
  assert.equal(sailDynamics(s).jib.side, 0);
});
test('held jib remains on the same visible side across the wind; release resumes normal tacking', () => {
  const s = Object.assign(initialState(), {
    windDirection: 0,
    heading: 310,
    jibSide: -1,
    jibSheet: 22,
  });
  refreshDerived(s);
  const before = rigVisualState(s).jibAngle;
  assert.equal(s.jibBacked, false);
  s.heading = 50;
  refreshDerived(s);
  assert.equal(s.jibBacked, true);
  assert.equal(rigVisualState(s).jibAngle, before);
  s.jibSide = 0;
  refreshDerived(s);
  assert.equal(s.jibBacked, false);
  assert.equal(rigVisualState(s).jibAngle, -before);
});
test('sail moments and helm produce a stable slow drift on both tacks', () => {
  const a = settle(),
    b = settle({ heading: 310, jibSide: 1, rudder: 30 });
  assert.ok(a.heading > 40 && a.heading < 70);
  assert.ok(Math.hypot(a.speed * KNOT, a.leeway) / KNOT < 1.5);
  assert.ok(Math.abs(a.yawRate) < 0.05);
  assert.ok(a.z > 1200 && b.z > 1200, 'both yachts drift downwind');
  assert.ok(Math.abs(a.heading + b.heading - 360) < 0.01);
  assert.ok(Math.abs(a.x + b.x) < 0.01);
  assert.ok(Math.abs(a.speed - b.speed) < 1e-6);
  const calm = settle({ windSpeed: 0, speed: 0 });
  assert.ok(Math.abs(calm.z - 1200) < 1e-8, 'no prescribed drift without wind');
});
test('main trim changes the equilibrium; releasing the jib restores forward drive', () => {
  const tight = settle({ mainSheet: 30, trim: 30 }),
    eased = settle();
  assert.ok(eased.heading - tight.heading > 5);
  eased.jibSide = 0;
  eased.rudder = 0;
  for (let i = 0; i < 400; i++) {
    // Use the helm only, as a skipper would, to keep the yacht on a reach.
    eased.rudder = Math.max(-35, Math.min(35, (90 - eased.heading) * 2 - eased.yawRate * 3));
    eased.mainSheet = eased.trim = eased.suggestedMainSheet;
    eased.jibSheet = eased.suggestedJibSheet;
    step(eased, 0.1);
  }
  assert.equal(eased.jibBacked, false);
  assert.ok(eased.speed > 3);
});
test('backed-sail integration converges across frame sizes', () => {
  const a = settle({}, 0.1),
    b = settle({}, 0.02);
  assert.ok(Math.abs(a.heading - b.heading) < 0.1);
  assert.ok(Math.abs(a.speed - b.speed) < 0.02);
  assert.ok(Math.hypot(a.x - b.x, a.z - b.z) < 0.3);
});
test('challenge requires a retained-sheet bow crossing and resets a broken continuous hold', () => {
  const run = createChallenge('heave-to');
  Object.assign(run.state, settle());
  assert.equal(
    challengeRequirements(run)[0].met,
    false,
    'starting in the pose cannot bypass the tack',
  );
  assessChallenge(run, 30);
  assert.equal(run.hold, 0);
  run.heaveTack = true;
  run.heaveHeldSide = -1;
  run.heavePreviousAngle = -50;
  run.heavePreviousSheet = -1;
  assessChallenge(run, 10);
  assert.equal(run.hold, 10);
  run.state.anchor = true;
  assessChallenge(run, 0.1);
  assert.equal(run.hold, 0);
  run.state.anchor = false;
  run.state.jibSide = 0;
  refreshDerived(run.state);
  assessChallenge(run, 0.1);
  assert.equal(run.heaveTack, false);
  assert.equal(challengeChart(run).cues.target, null);
});
test('the lesson lab steps the production engine and Lesson 71 links to the full challenge', () => {
  const settings = heaveToLab.settingsFor({ backed: true }),
    sim = heaveToLab.def.loop.create(settings),
    s = structuredClone(sim.s);
  heaveToLab.def.loop.step(sim, 0.1, settings);
  step(s, 0.1);
  assert.deepEqual(sim.s, s);
  const lesson = lessons.find((l) => l.id === 'sail-71');
  assert.equal(lesson.challengeId, 'heave-to');
  assert.equal(lesson.conceptLabs[4].id, 'heave-to');
});
