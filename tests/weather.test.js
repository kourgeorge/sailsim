import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeather, advanceWeather, weatherConditions, raceRecordKey } from '../src/weather.js';
import { initialState, angleDifference } from '../src/physics.js';
import { createRace, advanceRace } from '../src/racing/race.js';
import { weatherUI } from '../src/i18n/weather.js';

test('weather stays bounded around every starting preset throughout long sails', () => {
  for (const location of ['haven', 'shelter', 'strait', 'fjord']) {
    const state = initialState(location),
      base = weatherConditions(state),
      weather = createWeather(state);
    const seen = new Set();
    let before = { ...base };
    for (let second = 0; second < 43200; second++) {
      const conditions = advanceWeather(weather, 1);
      seen.add(conditions.windSpeed.toFixed(1));
      for (const key of Object.keys(base)) {
        const angle = key.endsWith('Direction');
        const fromBase = angle
          ? angleDifference(conditions[key], base[key])
          : conditions[key] - base[key];
        assert.ok(Math.abs(fromBase) <= weather.ranges[key] + 1e-9);
        const delta = angle
          ? angleDifference(conditions[key], before[key])
          : conditions[key] - before[key];
        const maxRate = {
          windSpeed: 0.18,
          windDirection: 0.65,
          currentSpeed: 0.004,
          currentDirection: 0.08,
        }[key];
        assert.ok(Math.abs(delta) < maxRate + 1e-9, `${key} changes gradually`);
        assert.ok(Number.isFinite(conditions[key]));
      }
      assert.ok(conditions.windSpeed >= 0 && conditions.windSpeed <= 35);
      assert.ok(conditions.currentSpeed >= 0 && conditions.currentSpeed <= 4);
      before = { ...conditions };
    }
    assert.ok(seen.size > 10);
    assert.deepEqual(weather.base, base, 'the starting preset never drifts');
    assert.deepEqual(weatherConditions(state), base, 'sampling alone cannot mutate a boat');
    if (base.currentSpeed === 0) assert.equal(weather.conditions.currentSpeed, 0);
  }
});

test('weather wraps compass north smoothly and respects calm and upper limits', () => {
  const base = { windSpeed: 35, windDirection: 359, currentSpeed: 4, currentDirection: 1 };
  const weather = createWeather(base, { seed: 53 });
  let crossed = false,
    previous = 359;
  for (let i = 0; i < 7200; i++) {
    const conditions = advanceWeather(weather, 1);
    assert.ok(conditions.windDirection >= 0 && conditions.windDirection < 360);
    assert.ok(conditions.currentDirection >= 0 && conditions.currentDirection < 360);
    assert.ok(Math.abs(angleDifference(conditions.windDirection, previous)) < 0.65);
    if (conditions.windDirection < 20) crossed = true;
    assert.ok(conditions.windSpeed <= 35 && conditions.currentSpeed <= 4);
    previous = conditions.windDirection;
  }
  assert.ok(crossed);
  const calm = createWeather({
    windSpeed: 0,
    windDirection: 0,
    currentSpeed: 0,
    currentDirection: 90,
  });
  advanceWeather(calm, 7200);
  assert.deepEqual(calm.conditions, calm.base);
});

test('fixed and paused weather do not consume time or random state', () => {
  const fixed = createWeather(initialState(), { enabled: false }),
    before = structuredClone(fixed);
  advanceWeather(fixed, 3600);
  assert.deepEqual(fixed, before);
  const weather = createWeather(initialState());
  advanceWeather(weather, 17);
  const paused = structuredClone(weather);
  for (const dt of [0, -1, NaN, Infinity]) advanceWeather(weather, dt);
  assert.deepEqual(weather, paused);
});

test('weather and saved replays are independent of frame partitions', () => {
  const a = createWeather(initialState('strait'), { seed: 284 }),
    b = structuredClone(a);
  for (let i = 0; i < 6000; i++) advanceWeather(a, 0.01);
  for (let i = 0; i < 240; i++) advanceWeather(b, 0.25);
  for (const key of Object.keys(a.conditions))
    assert.ok(Math.abs(a.conditions[key] - b.conditions[key]) < 1e-8);
  const replay = structuredClone(a);
  advanceWeather(a, 45);
  advanceWeather(replay, 45);
  assert.deepEqual(replay, a);
  const other = createWeather(initialState('strait'), { seed: 893 });
  advanceWeather(other, 105);
  assert.notEqual(other.conditions.windSpeed, a.conditions.windSpeed);
});

test('races default to one changing weather sequence shared by the entire fleet', () => {
  const race = createRace('channel-chase'),
    initial = structuredClone(race.weather);
  for (let i = 0; i < 5; i++) advanceRace(race, 1);
  assert.deepEqual(race.weather, initial, 'the countdown holds weather too');
  for (let i = 0; i < 100; i++) {
    advanceRace(race, 0.25);
    const common = weatherConditions(race.player);
    for (const racer of race.racers) assert.deepEqual(weatherConditions(racer.state), common);
  }
  assert.notEqual(race.player.windSpeed, race.course.windSpeed);
  assert.equal(race.weather.enabled, true);
  const paused = structuredClone(race);
  advanceRace(race, 0);
  assert.deepEqual(race, paused);
  race.status = 'finished';
  const finished = structuredClone(race);
  advanceRace(race, 1);
  assert.deepEqual(race, finished);
  const restarted = createRace('channel-chase');
  assert.deepEqual(restarted.weather, initial);
});

test('fixed races hold course conditions and keep historical best times separate', () => {
  const race = createRace('harbor-sprint', 'club', { changingWeather: false });
  for (let i = 0; i < 35; i++) advanceRace(race, 1);
  for (const racer of race.racers)
    assert.deepEqual(weatherConditions(racer.state), weatherConditions(race.course));
  assert.equal(
    raceRecordKey('harbor-sprint', 'club', false),
    'sail-race-best-v1:harbor-sprint:club',
  );
  assert.notEqual(
    raceRecordKey('harbor-sprint', 'club', true),
    raceRecordKey('harbor-sprint', 'club', false),
  );
});

test('weather labels are translated in all supported languages', () => {
  assert.equal(Object.keys(weatherUI).length, 6);
  for (const [locale, dictionary] of Object.entries(weatherUI)) {
    assert.deepEqual(Object.keys(dictionary), Object.keys(weatherUI.en));
    for (const [key, value] of Object.entries(dictionary)) {
      assert.ok(value.trim());
      if (locale !== 'en') assert.notEqual(value, key);
    }
  }
});
