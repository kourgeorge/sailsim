import test from 'node:test';
import assert from 'node:assert/strict';
import { catamaranLessons } from '../src/learning/catamaran-course.js';
import { createPracticeState } from '../src/learning/scenario-state.js';
import { practiceConditions } from '../src/learning/practice-conditions.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import { refreshDerived } from '../src/physics.js';

test('catamaran practice creates the authored boat and requires both engines neutral', () => {
  const lesson = catamaranLessons[0],
    state = createPracticeState(lesson.practice.setup);
  assert.equal(state.vesselId, 'catamaran');
  assert.equal(state.mainHoist, 0);
  assert.equal(state.jibHoist, 0);
  state.heading = 90;
  const neutral = () =>
    practiceConditions(lesson.practice.steps[0], state, {}).find(
      (row) => row.id === 'engine-neutral',
    ).met;
  assert.equal(neutral(), true);
  applyControlPatch(state, { portThrottle: 0.5, starboardThrottle: -0.5 });
  refreshDerived(state);
  assert.equal(state.throttle, 0);
  assert.equal(neutral(), false);
  applyControlPatch(state, { throttle: 0 });
  assert.equal(neutral(), true);
});
