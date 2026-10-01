import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step, refreshDerived, KNOT } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import { lessons } from '../src/learning/curriculum.js';
import { beginAttempt, advanceAttempt, restoreProgress, recordFor } from '../src/learning/engine.js';
import { practiceGroundSpeed, practiceEvidence, practiceStopThreshold } from '../src/learning/practice-assessment.js';

const lesson = lessons.find(lesson => lesson.id === 'sail-31');
const ocean = (patch = {}) => {
  const state = Object.assign(initialState(), { x: 3000, z: 3000, heading: 0, speed: 0, leeway: 0, currentSpeed: 0, windSpeed: 0 }, patch);
  applyControlPatch(state, { sails: 0, anchor: false });
  return refreshDerived(state);
};
const tick = (attempt, state, progress, seconds) => {
  for (let time = 0; time < seconds; time += .05) { step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress); }
};

test('displayed stopping targets come from the same stage contract used by assessment', () => {
  const coast = lesson.practice.steps[0], deploy = lesson.practice.steps[1];
  assert.equal(practiceStopThreshold(coast), .8);
  assert.equal(practiceStopThreshold(deploy), .2);
  const departure = lessons.find(lesson => lesson.id === 'sail-32').practice.steps[0];
  assert.equal(practiceStopThreshold(departure), null, 'Weighing anchor has no stopping target');
  assert.equal(practiceStopThreshold({ kind: 'heading', value: 45 }), null);
  assert.equal(practiceStopThreshold({ kind: 'coast', value: NaN }), null);
});

test('zero-current lateral drift cannot complete the anchor settling hold until ground motion decays', () => {
  const state = ocean({ leeway: 1 }), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  // Previously this entire exercise passed in 7.1 s at 0.62 kn sideways,
  // because longitudinal water speed stayed zero throughout.
  for (let time = 0; time < 7.2; time += .05) {
    if (attempt.index === 1) applyControlPatch(state, { anchor: true });
    step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress);
  }
  assert.equal(attempt.status, 'active');
  assert.equal(state.speed, 0);
  assert.ok(practiceGroundSpeed(state) > .6);
  assert.ok(attempt.index < 2);
  for (let time = 0; time < 30 && attempt.status === 'active'; time += .05) {
    if (attempt.index === 1) applyControlPatch(state, { anchor: true });
    step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress);
  }
  assert.equal(attempt.status, 'passed');
  assert.ok(practiceGroundSpeed(state) < .2);
  const saved = recordFor(progress, lesson.id).lastPracticeResult;
  assert.ok(saved.objectives[1].evidence.speedOverGround < .2);
  assert.ok(saved.objectives[1].evidence.leeway > 0);
  assert.deepEqual(restoreProgress(JSON.stringify(progress)).records[lesson.id].lastPracticeResult, saved);
});

test('coasting in current cannot receive stopping credit from a stale zero-SOG readout', () => {
  const state = ocean({ currentSpeed: 2, currentDirection: 90 }), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  for (let time = 0; time < 4; time += .1) {
    step(state, .1); state.speedOverGround = 0;
    advanceAttempt(attempt, lesson, state, .1, progress);
  }
  assert.equal(attempt.index, 0); assert.equal(attempt.held, 0);
  assert.equal(attempt.status, 'active');
  assert.ok(practiceGroundSpeed(state) >= 2 - 1e-8);
  assert.ok(attempt.objectives[0].evidence.speedOverGround >= 2 - 1e-8);
});

test('anchor settling checks lateral motion after a valid coast checkpoint', () => {
  const state = ocean(), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  tick(attempt, state, progress, 3.1); assert.equal(attempt.index, 1);
  applyControlPatch(state, { anchor: true }); state.leeway = .5;
  tick(attempt, state, progress, 4.1);
  assert.equal(attempt.status, 'active'); assert.equal(attempt.index, 1);
  assert.ok(practiceGroundSpeed(state) > .2);
  assert.equal(attempt.held, 0);
});

test('planned scope cannot earn anchor credit before the running seabed-contact transition', () => {
  const state = ocean(), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  tick(attempt, state, progress, 3.1); assert.equal(attempt.index, 1);
  applyControlPatch(state, { anchor: true }); refreshDerived(state);
  assert.equal(state.anchorStatus, 'Deployment pending'); assert.ok(state.anchorScope > 1);
  for (let i = 0; i < 45; i++) advanceAttempt(attempt, lesson, state, .1, progress);
  assert.equal(attempt.status, 'active'); assert.equal(attempt.held, 0);
  assert.equal(attempt.objectives[1].evidence.anchorSeabedContact, false);
  step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress);
  assert.equal(state.anchorStatus, 'Deployed · settling');
  assert.equal(attempt.objectives[1].evidence.anchorSeabedContact, true);
  tick(attempt, state, progress, 4.1);
  assert.equal(attempt.status, 'passed');
  assert.equal(recordFor(progress, lesson.id).lastPracticeResult.objectives[1].evidence.anchorSeabedContact, true);
});

test('ground speed combines signed water motion with current and never trusts cached SOG', () => {
  const stationary = ocean({ heading: 0, speed: -2, currentSpeed: 2, currentDirection: 0 });
  stationary.speedOverGround = 999;
  assert.ok(practiceGroundSpeed(stationary) < 1e-9);
  assert.ok(practiceEvidence(stationary).speedOverGround < 1e-9);
  assert.equal(practiceGroundSpeed({ speed: -.1 }), .1); // Legacy scalar fixture.
  assert.equal(practiceGroundSpeed({ heading: 90, speed: .1 }), .1);
  for (const patch of [{ heading: NaN }, { leeway: NaN }, { currentSpeed: Infinity }, { currentDirection: null }]) {
    assert.ok(Number.isNaN(practiceGroundSpeed({ heading: 0, speed: 0, speedOverGround: 0, ...patch })));
  }
  assert.equal(practiceGroundSpeed({ ...stationary, grounded: true }), 0);
  assert.ok(Math.abs(practiceGroundSpeed({ heading: 0, speed: 0, leeway: KNOT }) - 1) < 1e-9);
});
