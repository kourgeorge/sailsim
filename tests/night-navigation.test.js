import test from 'node:test';
import assert from 'node:assert/strict';
import { lightIsOn, navigationLights, vesselLightVisible } from '../src/navigation/lights.js';
import { lessons } from '../src/learning/curriculum.js';
import { createPracticeState } from '../src/learning/scenario-state.js';
import { initialState } from '../src/physics.js';
import {
  beginAttempt,
  advanceAttempt,
  restoreProgress,
  recordEvent,
} from '../src/learning/engine.js';
import { practiceEvidence } from '../src/learning/practice-assessment.js';
import { marinaCues } from '../src/learning/marina-course.js';

const lesson = lessons.find((l) => l.id === 'sail-53');
test('night practical is separate from lesson 42, with daylight as the ordinary default', () => {
  const theory = lessons.find((l) => l.id === 'sail-42');
  assert.equal(theory.title, 'Night pilotage and cross-checks');
  assert.equal(theory.practice, null);
  assert.ok(theory.decisionScenarioId);
  assert.equal(createPracticeState(lesson.practice.setup).timeOfDay, 'night');
  assert.equal(initialState().timeOfDay, 'day');
  assert.equal(
    createPracticeState(lessons.find((l) => l.id === 'sail-43').practice.setup).timeOfDay,
    'day',
  );
});
test('light periods include darkness and repeat using simulation time alone', () => {
  const lights = navigationLights('haven'),
    white = lights.find((l) => l.kind === 'lighthouse');
  for (const [time, on] of [
    [0, true],
    [0.69, true],
    [0.71, false],
    [5.99, false],
    [6, true],
    [12.1, true],
  ])
    assert.equal(lightIsOn(white, time), on);
  assert.equal(lightIsOn(white, NaN), false);
  const yellow = lights.find((l) => l.id === 'haven:buoy:0');
  assert.equal(yellow.period, 4);
  const leading = lights.filter((l) => l.kind === 'leading');
  const heading =
    (Math.atan2(leading[1].x - leading[0].x, leading[0].z - leading[1].z) * 180) / Math.PI;
  assert.ok(Math.abs(heading - 27) < 0.5);
  assert.ok(leading[1].y > leading[0].y);
  for (const light of leading) assert.ok(lightIsOn(light, 999));
});
test('vessel lights respect the viewing sector, propulsion and anchoring', () => {
  assert.equal(vesselLightVisible('port', -90), true);
  assert.equal(vesselLightVisible('port', 90), false);
  assert.equal(vesselLightVisible('starboard', 90), true);
  assert.equal(vesselLightVisible('starboard', -90), false);
  assert.equal(vesselLightVisible('stern', 180), true);
  assert.equal(vesselLightVisible('stern', 100), false);
  assert.equal(vesselLightVisible('masthead', 0, { throttle: 0.2 }), true);
  assert.equal(vesselLightVisible('masthead', 180, { throttle: 0.2 }), false);
  assert.equal(vesselLightVisible('masthead', 0, { mainHoist: 1, jibHoist: 1 }), false);
  assert.equal(vesselLightVisible('masthead', 0, { mainHoist: 0, jibHoist: 0 }), true);
  for (const kind of ['port', 'starboard', 'stern', 'masthead'])
    assert.equal(vesselLightVisible(kind, 0, { anchor: true }), false);
  assert.equal(vesselLightVisible('anchor', 180, { anchor: true }), true);
});
test('night chart review advances only on an action; displayed route contains finite targets', () => {
  const state = createPracticeState(lesson.practice.setup),
    progress = restoreProgress(null),
    attempt = beginAttempt(lesson, state, progress);
  advanceAttempt(attempt, lesson, state, 0.1, progress);
  assert.equal(attempt.index, 0);
  recordEvent(attempt, 'event', 'chart');
  advanceAttempt(attempt, lesson, state, 0.1, progress);
  assert.equal(attempt.index, 1);
  assert.equal(practiceEvidence(state, attempt).timeOfDay, 'night');
  const cues = marinaCues(lesson, 0);
  assert.equal(cues.route.length, 3);
  assert.ok(cues.route.every((p) => Number.isFinite(p.x) && Number.isFinite(p.z)));
});
test('switching to daylight or exceeding the night speed limit cannot earn a pass', () => {
  for (const [patch, code] of [
    [{ timeOfDay: 'day' }, 'conditions-changed'],
    [{ speed: 3.1 }, 'speed-limit'],
  ]) {
    const state = createPracticeState(lesson.practice.setup),
      progress = restoreProgress(null),
      attempt = beginAttempt(lesson, state, progress);
    Object.assign(state, patch);
    advanceAttempt(attempt, lesson, state, 0.1, progress);
    assert.equal(attempt.status, 'invalid');
    assert.equal(attempt.criticalFailure.code, code);
    assert.equal(progress.records[lesson.id].practice, false);
  }
});
