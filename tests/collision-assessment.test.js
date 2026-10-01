import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/learning/curriculum.js';
import { initialState } from '../src/physics.js';
import { beginAttempt, advanceAttempt, restoreProgress, recordFor } from '../src/learning/engine.js';
import { collisionEvidence, restorePracticeAssessment } from '../src/learning/practice-assessment.js';
import { createDrillState, beginManeuver, advanceManeuver } from '../src/learning/maneuvers.js';
import { createManeuverRecord, finishManeuverRecord, restoreManeuverRecords } from '../src/learning/maneuver-records.js';

const lesson = lessons.find(lesson => lesson.id === 'sail-08');
const contact = () => ({ bodyId: 'haven-yacht-0', bodyKind: 'boat', point: { x: 12, z: 20 }, normal: { x: 1, z: 0 }, impulse: 2300, closingSpeed: 1.2, time: 9.8, sequence: 5 });
const state = () => Object.assign(initialState(), { heading: 45, windDirection: 315, speed: 3, windSpeed: 12, currentSpeed: 0, currentDirection: 0, throttle: 0, anchor: false, grounded: false, collisionCount: 4, contactActive: false, collision: contact() });

test('new player contact prevents final-frame practice credit and persists one failed debrief', () => {
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(lesson, boat, progress);
  for (let i = 0; i < 39; i++) advanceAttempt(attempt, lesson, boat, .25, progress);
  assert.equal(attempt.status, 'active');
  boat.collisionCount++; // Episode ended within this frame; contactActive is already false.
  advanceAttempt(attempt, lesson, boat, .25, progress);
  const record = recordFor(progress, lesson.id), report = record.lastPracticeResult;
  assert.equal(attempt.status, 'invalid');
  assert.equal(report.status, 'failed');
  assert.equal(report.criticalFailure.code, 'collision');
  assert.deepEqual(report.criticalFailure.collision, contact());
  assert.equal(report.objectives[0].heldSeconds, 9.75);
  assert.equal(report.objectives[0].evidence.collisionCount, 5);
  assert.equal(record.practice, false);
  assert.ok(report.score < 80);
  for (let i = 0; i < 5; i++) advanceAttempt(attempt, lesson, boat, .25, progress);
  assert.equal(record.practiceResults.length, 1);
  assert.deepEqual(restoreProgress(JSON.stringify(progress)).records[lesson.id].lastPracticeResult, report);
});

test('past incidents and independent world contacts do not invalidate a fresh physical attempt', () => {
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(lesson, boat, progress);
  boat.collisionEvents = [{ ...contact(), sequence: 999, bodyId: 'decorative-contact' }];
  for (let i = 0; i < 40; i++) advanceAttempt(attempt, lesson, boat, .25, progress);
  assert.equal(attempt.status, 'passed');
  assert.equal(recordFor(progress, lesson.id).practice, true);
});

test('beginning in ongoing player contact cannot bypass collision failure with a fresh baseline', () => {
  const boat = state(), progress = restoreProgress(null);
  boat.contactActive = true;
  const attempt = beginAttempt(lesson, boat, progress);
  assert.equal(attempt.status, 'invalid');
  assert.equal(attempt.criticalFailure.code, 'collision');
  assert.equal(recordFor(progress, lesson.id).lastPracticeResult.objectives[0].evidence.contactActive, true);
  const engineBoat = Object.assign(createDrillState('engine-stop'), { contactActive: true, collisionCount: 4, collision: contact() });
  const maneuver = beginManeuver('engine-stop', engineBoat);
  assert.equal(maneuver.status, 'failed');
  assert.equal(maneuver.criticalFailure.code, 'collision');
});

test('collision stopping cannot satisfy an engine drill and replay keeps contact evidence after reload', () => {
  const boat = Object.assign(createDrillState('engine-stop'), { collisionCount: 4, contactActive: false, collision: contact() });
  const attempt = beginManeuver('engine-stop', boat), record = createManeuverRecord('engine-stop', boat);
  attempt.index = 2; attempt.held = 2.9; attempt.reverseSeconds = 1;
  boat.collisionCount = 5;
  advanceManeuver(attempt, boat, .1);
  assert.equal(attempt.status, 'failed');
  assert.equal(attempt.criticalFailure.code, 'collision');
  assert.equal(attempt.completed.length, 0);
  assert.equal(attempt.events.length, 1);
  finishManeuverRecord(record, attempt, boat);
  const restored = restoreManeuverRecords(JSON.stringify([record]), ['engine-stop'])[0];
  assert.deepEqual(restored.metrics.criticalFailure, attempt.criticalFailure);
  assert.deepEqual(restored.events[0].collision, contact());
  const terminal = structuredClone(attempt);
  advanceManeuver(attempt, boat, .1);
  assert.deepEqual(attempt, terminal);
});

test('maneuver ignores historical player collisions and world-only events', () => {
  const boat = Object.assign(createDrillState('engine-stop'), { collisionCount: 4, contactActive: false, collision: contact() });
  const attempt = beginManeuver('engine-stop', boat);
  boat.collisionEvents = [contact()];
  advanceManeuver(attempt, boat, .1);
  assert.equal(attempt.status, 'active');
});

test('contact evidence rejects untyped data and bounds persisted vectors, strings and magnitudes', () => {
  assert.equal(collisionEvidence({ bodyId: 1 }), null);
  const raw = { ...contact(), bodyId: 'x'.repeat(1000), bodyKind: 'y'.repeat(1000), point: { x: 1e300, z: -1e300 }, normal: { x: NaN, z: 0 }, impulse: Infinity, closingSpeed: -3, time: 1e300, sequence: 1e300, arbitrary: { body: 'must not persist' } };
  const bounded = collisionEvidence(raw);
  assert.equal(bounded.bodyId.length, 100);
  assert.equal(bounded.bodyKind.length, 40);
  assert.deepEqual(bounded.point, { x: 1e7, z: -1e7 });
  assert.equal(bounded.normal, null);
  assert.equal(bounded.impulse, 0);
  assert.equal(bounded.closingSpeed, 0);
  assert.equal(bounded.time, 1e7);
  assert.equal(bounded.sequence, Number.MAX_SAFE_INTEGER);
  assert.equal(bounded.arbitrary, undefined);
  const boat = state(), progress = restoreProgress(null), attempt = beginAttempt(lesson, boat, progress);
  boat.collisionCount++; boat.collision = raw;
  advanceAttempt(attempt, lesson, boat, .1, progress);
  const restored = restorePracticeAssessment(recordFor(progress, lesson.id).lastPracticeResult, lesson);
  assert.deepEqual(restored.criticalFailure.collision, bounded);
  assert.deepEqual(restored.objectives[0].evidence.collision, bounded);
});

test('legacy states and saved assessments without collision fields remain valid', () => {
  const boat = state(), progress = restoreProgress(null);
  delete boat.collisionCount; delete boat.collision; delete boat.contactActive;
  const attempt = beginAttempt(lesson, boat, progress);
  for (let i = 0; i < 40; i++) advanceAttempt(attempt, lesson, boat, .25, progress);
  const report = recordFor(progress, lesson.id).lastPracticeResult;
  delete report.objectives[0].evidence.collisionCount;
  delete report.objectives[0].evidence.contactActive;
  delete report.objectives[0].evidence.collision;
  assert.equal(restorePracticeAssessment(report, lesson).status, 'passed');
});
