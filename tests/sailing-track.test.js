import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSailingTrack,
  captureSailingTrack,
  sailingTrackSnapshot,
  restoreSailingTrack,
  sailingTrackFrame,
  MAX_TRACK_SAMPLES,
} from '../src/navigation/sailing-track.js';
import { lessons } from '../src/learning/curriculum.js';
import { createPracticeState } from '../src/learning/scenario-state.js';
import {
  beginAttempt,
  advanceAttempt,
  invalidateAttempt,
  restoreProgress,
  recordFor,
  practiceAssessment,
} from '../src/learning/engine.js';
import { createRace, advanceRace } from '../src/racing/race.js';

test('recording preserves the real start, turns, and endpoint between samples without keeping live state', () => {
  const state = { locationId: 'haven', x: 10, z: 20 };
  const track = createSailingTrack(state);
  for (let i = 1; i <= 45; i++) {
    state.x = 10 + i;
    state.z = 20 + Math.sin(i / 5) * 12;
    captureSailingTrack(track, state, i / 10);
  }
  const saved = sailingTrackSnapshot(track);
  assert.deepEqual(saved.samples[0], { x: 10, z: 20, t: 0 });
  assert.equal(saved.samples.at(-1).t, 4.5);
  assert.equal(saved.samples.at(-1).x, 55);
  assert.ok(saved.samples.some((sample) => sample.z < 20));
  assert.ok(saved.samples.some((sample) => sample.z > 20));
  state.x = 900;
  captureSailingTrack(track, state, 5);
  assert.equal(saved.samples.at(-1).x, 55);
  assert.deepEqual(restoreSailingTrack(JSON.parse(JSON.stringify(saved))), saved);
});

test('long runs stay bounded while retaining the full passage and exact final position', () => {
  const state = { locationId: 'strait', x: 0, z: 900 },
    track = createSailingTrack(state);
  for (let t = 1; t <= 15000; t++) {
    state.z = 900 - t;
    captureSailingTrack(track, state, t);
  }
  const saved = sailingTrackSnapshot(track);
  assert.ok(saved.samples.length <= MAX_TRACK_SAMPLES);
  assert.deepEqual(saved.samples[0], { x: 0, z: 900, t: 0 });
  assert.deepEqual(saved.samples.at(-1), { x: 0, z: -14100, t: 15000 });
  assert.ok(saved.samples.every((sample, i) => !i || sample.t > saved.samples[i - 1].t));
});

test('invalid samples, reversed time, and a different location cannot corrupt a track', () => {
  const state = { locationId: 'haven', x: 4, z: 8 },
    track = createSailingTrack(state);
  captureSailingTrack(track, { ...state, x: 9 }, 1);
  const before = sailingTrackSnapshot(track);
  captureSailingTrack(track, { ...state, x: NaN }, 2);
  captureSailingTrack(track, { ...state, locationId: 'strait' }, 3);
  captureSailingTrack(track, state, 0.5);
  assert.deepEqual(sailingTrackSnapshot(track), before);
  for (const value of [
    null,
    {},
    { ...before, locationId: 'unknown' },
    { ...before, samples: [] },
    { ...before, samples: [{ x: '1', z: 2, t: 0 }] },
    { ...before, samples: [...before.samples].reverse() },
  ]) {
    assert.equal(restoreSailingTrack(value), null);
  }
});

test('portrait and landscape chart frames contain all sailed points and course marks with padding', () => {
  const samples = [
    { x: -200, z: 800 },
    { x: 90, z: -140 },
    { x: 300, z: 900 },
  ];
  const marks = [{ x: 0, z: -500 }];
  for (const aspect of [0.5, 1, 2]) {
    const { center, span } = sailingTrackFrame(samples, marks, aspect);
    for (const p of [...samples, ...marks]) {
      assert.ok(Math.abs(p.x - center.x) < span / 2);
      assert.ok(Math.abs(p.z - center.z) < span / aspect / 2);
    }
  }
  assert.ok(sailingTrackFrame([{ x: 2, z: 3 }]).span > 0);
});

test('passed and ended lesson attempts save their own tracks and restore them with their reports', () => {
  const lesson = lessons.find((item) => item.id === 'sail-08');
  const state = createPracticeState(lesson.practice.setup),
    progress = restoreProgress(null);
  state.heading = 45;
  state.speed = 3;
  const attempt = beginAttempt(lesson, state, progress);
  const start = { x: state.x, z: state.z, t: 0 };
  for (let i = 0; i < 40; i++) {
    state.x += 0.4;
    state.z -= 0.2;
    advanceAttempt(attempt, lesson, state, 0.25, progress);
  }
  const report = recordFor(progress, lesson.id).lastPracticeResult;
  assert.equal(report.status, 'passed');
  assert.equal(report.score, 100);
  assert.deepEqual(report.track.samples[0], start);
  assert.equal(report.track.samples.at(-1).t, 10);
  assert.deepEqual(
    restoreProgress(JSON.stringify(progress)).records[lesson.id].lastPracticeResult.track,
    report.track,
  );

  state.x = 200;
  const retry = beginAttempt(lesson, state, progress);
  assert.equal(
    practiceAssessment(retry, lesson).track,
    undefined,
    'Live score calculations do not clone the whole route',
  );
  state.x = 205;
  advanceAttempt(retry, lesson, state, 0.25, progress);
  invalidateAttempt(retry, progress, 'Ended');
  const ended = recordFor(progress, lesson.id).lastPracticeResult;
  assert.equal(ended.status, 'failed');
  assert.equal(ended.track.samples[0].x, 200);
  assert.equal(ended.track.samples.at(-1).x, 205);
  assert.deepEqual(report.track.samples[0], start);
  const legacy = structuredClone(progress);
  delete legacy.records[lesson.id].lastPracticeResult.track;
  assert.equal(restoreProgress(legacy).records[lesson.id].lastPracticeResult.track, undefined);
});

test('race recording excludes countdown, follows the player, and stops at the finish', () => {
  const race = createRace('harbor-sprint');
  const original = sailingTrackSnapshot(race.track);
  advanceRace(race, 2);
  assert.deepEqual(sailingTrackSnapshot(race.track), original);
  advanceRace(race, 2);
  advanceRace(race, 1);
  for (const mark of race.course.marks) {
    Object.assign(race.player, mark);
    advanceRace(race, 1.1);
  }
  assert.equal(race.status, 'finished');
  const route = sailingTrackSnapshot(race.track);
  assert.ok(route.samples.length > 2);
  assert.ok(Math.abs(route.samples.at(-1).x - race.player.x) < 0.001);
  assert.ok(Math.abs(route.samples.at(-1).z - race.player.z) < 0.001);
  advanceRace(race, 2);
  assert.deepEqual(sailingTrackSnapshot(race.track), route);
  assert.equal(createRace('harbor-sprint').track.samples.length, 1);
});
