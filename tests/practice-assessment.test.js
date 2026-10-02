import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/learning/curriculum.js';
import { initialState } from '../src/physics.js';
import { restoreProgress, recordFor, beginAttempt, advanceAttempt, invalidateAttempt, useHint, practiceAssessment, practiceRubric, PRACTICE_SCORE_RULES } from '../src/learning/engine.js';
import { restorePracticeAssessment } from '../src/learning/practice-assessment.js';

const headingLesson = lessons.find(lesson => lesson.id === 'sail-08');
const state = () => Object.assign(initialState(), { heading: 45, windDirection: 315, speed: 3, windSpeed: 12, currentSpeed: 0, currentDirection: 0, throttle: 0, anchor: false, grounded: false });
const advance = (attempt, lesson, boat, progress, seconds) => { for (let i = 0; i < seconds * 4; i++) advanceAttempt(attempt, lesson, boat, .25, progress); };

test('all 22 physical practices have explicit weighted objectives and required continuous holds', () => {
  const practices = lessons.filter(lesson => lesson.practice);
  assert.equal(practices.length, 22);
  for (const lesson of practices) {
    const rubric = practiceRubric(lesson);
    assert.equal(rubric.length, lesson.practice.steps.length);
    assert.ok(Math.abs(rubric.reduce((sum, objective) => sum + objective.weight, 0) - 100) < 1e-9);
    for (const [i, objective] of rubric.entries()) {
      assert.equal(objective.label, lesson.practice.steps[i].label);
      assert.equal(objective.kind, lesson.practice.steps[i].kind);
      assert.deepEqual(objective.target, lesson.practice.steps[i].value);
      assert.equal(objective.requiredSeconds, lesson.practice.steps[i].duration);
    }
  }
  assert.equal(PRACTICE_SCORE_RULES.passScore, 80);
  assert.equal(PRACTICE_SCORE_RULES.hintsAffectScore, false);
  assert.deepEqual(PRACTICE_SCORE_RULES.criticalConditions, ['grounding', 'conditions-changed', 'early-anchor', 'engine-engaged', 'collision', 'sails-raised', 'speed-limit', 'practice-area']);
});

test('elapsed time and partial dwell cannot earn score or pass, even after long waits', () => {
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(headingLesson, boat, progress);
  boat.speed = 0;
  advance(attempt, headingLesson, boat, progress, 100);
  assert.equal(practiceAssessment(attempt, headingLesson).score, 0);
  assert.equal(recordFor(progress, headingLesson.id).practice, false);
  boat.speed = 3;
  advance(attempt, headingLesson, boat, progress, 9.75);
  const partial = practiceAssessment(attempt, headingLesson);
  assert.equal(partial.objectives[0].heldSeconds, 9.75);
  assert.equal(partial.score, 0);
  advanceAttempt(attempt, headingLesson, boat, 0, progress);
  advanceAttempt(attempt, headingLesson, boat, 60, progress);
  assert.equal(practiceAssessment(attempt, headingLesson).score, 0);
  advance(attempt, headingLesson, boat, progress, .25);
  const report = recordFor(progress, headingLesson.id).lastPracticeResult;
  assert.equal(report.status, 'passed');
  assert.equal(report.score, 100);
  assert.equal(report.objectives[0].heldSeconds, 10);
  assert.equal(report.objectives[0].evidence.heading, 45);
  assert.equal(report.objectives[0].evidence.speed, 3);
  assert.equal(report.objectives[0].completedAt, 110);
});

test('only meaningful hold losses reduce score, capped at20, and hints preserve credit', () => {
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(headingLesson, boat, progress);
  advance(attempt, headingLesson, boat, progress, .5);
  boat.heading = 70; advance(attempt, headingLesson, boat, progress, .25); boat.heading = 45;
  assert.equal(practiceAssessment(attempt, headingLesson).objectives[0].holdBreaks, 0);
  for (let i = 0; i < 12; i++) {
    advance(attempt, headingLesson, boat, progress, 1.25);
    boat.heading = 70; advance(attempt, headingLesson, boat, progress, .25); boat.heading = 45;
    useHint(attempt, progress);
  }
  advance(attempt, headingLesson, boat, progress, 10);
  const report = recordFor(progress, headingLesson.id).lastPracticeResult;
  assert.equal(report.status, 'passed');
  assert.equal(report.score, 80);
  assert.equal(report.assisted, true);
  assert.equal(report.hints, 12);
  assert.deepEqual(report.penalties, [{ code: 'broken-holds', count: 12, points: 20 }]);
  assert.equal(report.objectives[0].bestHoldSeconds, 10);
  assert.equal(recordFor(progress, headingLesson.id).practice, true);
});

test('critical failures retain explicit state evidence and cannot be offset by points', () => {
  for (const [patch, code] of [[{ grounded: true }, 'grounding'], [{ windSpeed: 13 }, 'conditions-changed'], [{ anchor: true }, 'early-anchor'], [{ throttle: .2 }, 'engine-engaged']]) {
    const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(headingLesson, boat, progress);
    advance(attempt, headingLesson, boat, progress, 2);
    Object.assign(boat, patch);
    advance(attempt, headingLesson, boat, progress, .25);
    const report = recordFor(progress, headingLesson.id).lastPracticeResult;
    assert.equal(report.status, 'failed');
    assert.equal(report.criticalFailure.code, code);
    assert.equal(report.objectives[0].status, 'missed');
    for (const [key, value] of Object.entries(patch)) assert.equal(report.objectives[0].evidence[key], value);
    assert.equal(recordFor(progress, headingLesson.id).practice, false);
  }
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(headingLesson, boat, progress);
  advance(attempt, headingLesson, boat, progress, 10);
  attempt.criticalFailure = { code: 'grounding', message: 'Grounding' };
  const rejected = practiceAssessment(attempt, headingLesson);
  assert.equal(rejected.completionScore, 100);
  assert.equal(rejected.score, 79);
  assert.equal(rejected.status, 'failed');
});

test('terminal history saves once, retains last5, and retries never erase established evidence', () => {
  const boat = state(), progress = restoreProgress(null);
  const success = beginAttempt(headingLesson, boat, progress);
  advance(success, headingLesson, boat, progress, 10);
  for (let i = 0; i < 7; i++) {
    const attempt = beginAttempt(headingLesson, boat, progress);
    invalidateAttempt(attempt, progress, 'Practice restarted.');
    invalidateAttempt(attempt, progress, 'Duplicate cancellation');
  }
  const record = recordFor(progress, headingLesson.id);
  assert.equal(record.practice, true);
  assert.equal(record.practiceResults.length, 5);
  assert.deepEqual(record.practiceResults.map(report => report.attemptNumber), [4, 5, 6, 7, 8]);
  assert.equal(record.lastPracticeResult.status, 'failed');
  assert.equal(record.lastPracticeResult.criticalFailure, null);
  const restored = restoreProgress(JSON.stringify(progress));
  assert.deepEqual(restored.records[headingLesson.id].practiceResults, record.practiceResults);
  const legacy = restoreProgress({ version: 1, selected: headingLesson.id, records: { [headingLesson.id]: { practice: true, knowledge: true, attempts: 2 } } });
  assert.equal(legacy.records[headingLesson.id].practice, true);
  assert.equal(legacy.records[headingLesson.id].knowledge, true);
  assert.equal(legacy.records[headingLesson.id].lastPracticeResult, null);
  assert.deepEqual(legacy.records[headingLesson.id].practiceResults, []);
});

test('restoration recomputes scores, drops malformed objectives, bounds telemetry, and never grants mastery', () => {
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(headingLesson, boat, progress);
  advance(attempt, headingLesson, boat, progress, 10);
  const report = structuredClone(recordFor(progress, headingLesson.id).lastPracticeResult);
  report.score = 999; report.objectives[0].evidence.x = 1e300; report.objectives[0].evidence.speed = Infinity;
  const restored = restorePracticeAssessment(report, headingLesson);
  assert.equal(restored.score, 100);
  assert.equal(restored.objectives[0].evidence.x, 1e7);
  assert.equal(restored.objectives[0].evidence.speed, null);
  const injected = restoreProgress({ version: 1, records: { [headingLesson.id]: { practice: false, attempts: 0, lastPracticeResult: report } } });
  assert.equal(injected.records[headingLesson.id].practice, false);
  report.objectives[0].bestHoldSeconds = 0;
  assert.equal(restorePracticeAssessment(report, headingLesson), null);
  report.objectives = [];
  assert.equal(restorePracticeAssessment(report, headingLesson), null);
});
