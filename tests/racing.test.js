import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RACE_COURSES,
  RACE_DIFFICULTIES,
  createRace,
  advanceRace,
  raceStandings,
  markEntryFraction,
} from '../src/racing/race.js';
import { racingUI } from '../src/i18n/racing.js';

test('race countdown holds the whole fleet and fixed conditions forbid engine assistance', () => {
  const race = createRace('harbor-sprint', 'club', { changingWeather: false });
  const start = race.racers.map((r) => [r.state.x, r.state.z]);
  for (let i = 0; i < 5; i++) advanceRace(race, 1);
  assert.equal(race.status, 'racing');
  assert.equal(race.elapsed, 0);
  assert.deepEqual(
    race.racers.map((r) => [r.state.x, r.state.z]),
    start,
  );
  race.player.throttle = 1;
  race.player.windSpeed = 40;
  advanceRace(race, 0.2);
  assert.equal(race.player.throttle, 0);
  assert.equal(race.player.windSpeed, race.course.windSpeed);
  assert.ok(race.elapsed > 0);
  assert.ok(race.racers.every((r) => r.state.z !== start[0][1]));
});

test('course checkpoints are sequential and fast crossings cannot miss a ring', () => {
  assert.equal(markEntryFraction({ x: -40, z: 0 }, { x: 40, z: 0 }, { x: 0, z: 0 }, 20), 0.25);
  assert.equal(markEntryFraction({ x: -40, z: 30 }, { x: 40, z: 30 }, { x: 0, z: 0 }, 20), null);
  const race = createRace('harbor-sprint');
  advanceRace(race, 2);
  advanceRace(race, 2);
  advanceRace(race, 1);
  Object.assign(race.player, race.course.marks[2]);
  advanceRace(race, 0.1);
  assert.equal(race.racers[0].mark, 0);
  for (const point of race.course.marks) {
    Object.assign(race.player, point);
    advanceRace(race, 0.1);
  }
  assert.equal(race.status, 'finished');
  assert.equal(race.reason, 'Finished');
  assert.equal(race.racers[0].mark, 3);
  const ended = structuredClone(race);
  advanceRace(race, 1);
  assert.deepEqual(race, ended);
});

test('race timing and bot movement are independent of rendered frame partitions', () => {
  const a = createRace('windward-duel'),
    b = createRace('windward-duel');
  for (let i = 0; i < 600; i++) advanceRace(a, 1 / 60);
  for (let i = 0; i < 40; i++) advanceRace(b, 0.25);
  assert.equal(a.elapsed, b.elapsed);
  for (let i = 0; i < 4; i++) {
    assert.ok(Math.abs(a.racers[i].state.x - b.racers[i].state.x) < 1e-8);
    assert.ok(Math.abs(a.racers[i].state.z - b.racers[i].state.z) < 1e-8);
  }
});

test('standings respect completed marks and finish times rather than proximity to the finish', () => {
  const race = createRace('harbor-sprint');
  race.racers[1].mark = 2;
  race.racers[2].mark = 3;
  race.racers[2].finished = 100;
  race.racers[3].mark = 3;
  race.racers[3].finished = 95;
  assert.deepEqual(
    raceStandings(race).map((r) => r.id),
    ['coral', 'amber', 'skye', 'player'],
  );
});

test('each rival completes every course at every difficulty without grounding or engine power', () => {
  for (const course of RACE_COURSES)
    for (const level of Object.keys(RACE_DIFFICULTIES)) {
      const race = createRace(course.id, level);
      race.player.worldBodies = [];
      race.player.mainHoist = race.player.jibHoist = race.player.sails = 0;
      while (race.status !== 'finished' && race.racers.slice(1).some((r) => r.finished === null)) {
        Object.assign(race.player, course.start, { speed: 0, leeway: 0, grounded: false });
        advanceRace(race, 1);
      }
      for (const rival of race.racers.slice(1)) {
        assert.ok(
          rival.finished !== null,
          `${course.id}/${level}/${rival.id} stalled at mark ${rival.mark}, ${race.elapsed.toFixed(1)}s`,
        );
        assert.equal(rival.state.grounded, false);
        assert.equal(rival.state.throttle, 0);
        assert.ok(rival.finished > 30 && rival.finished < 900);
      }
    }
});

test('race translations cover each label and preserve placeholders in all six languages', () => {
  for (const dictionary of Object.values(racingUI)) {
    assert.deepEqual(Object.keys(dictionary), Object.keys(racingUI.en));
    for (const [key, value] of Object.entries(dictionary)) {
      assert.ok(value.trim());
      assert.deepEqual(
        [...value.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(),
        [...key.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(),
      );
    }
  }
});
