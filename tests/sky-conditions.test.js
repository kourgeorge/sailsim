import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SKIES,
  TIMES_OF_DAY,
  SKY_LABELS,
  TIME_OF_DAY_LABELS,
  skyPreset,
  skyChoice,
  navigationLightsLit,
  lightningFlash,
} from '../src/sky-conditions.js';
import { initialState } from '../src/physics.js';
import { weatherUI } from '../src/i18n/weather.js';

const azimuth = ([x, , z]) => ((Math.atan2(x, -z) * 180) / Math.PI + 360) % 360;
const elevation = ([, y]) => (Math.asin(y) * 180) / Math.PI;

test('a new voyage starts at midday under fair skies', () => {
  const state = initialState();
  assert.equal(state.timeOfDay, 'day');
  assert.equal(state.sky, 'fair');
  assert.deepEqual(skyChoice({ timeOfDay: 'teatime', sky: 'hail' }), {
    timeOfDay: 'day',
    sky: 'fair',
  });
});

test('the sun rises in the east, crosses the noon side and sets in the west', () => {
  const at = (timeOfDay, southern = false) =>
    skyPreset({ timeOfDay, sky: 'clear' }, { southern }).sunDirection;
  assert.ok(Math.abs(azimuth(at('sunrise')) - 92) < 5);
  assert.ok(Math.abs(azimuth(at('sunset')) - 272) < 5);
  assert.equal(Math.round(azimuth(at('day'))), 180);
  assert.equal(Math.round(azimuth(at('day', true))), 0);
  assert.ok(Math.abs(azimuth(at('sunrise', true)) - 88) < 5);
  for (const time of ['sunrise', 'sunset']) assert.ok(elevation(at(time)) < 4);
  assert.ok(elevation(at('morning')) < elevation(at('day')));
  assert.ok(elevation(at('afternoon')) < elevation(at('day')));
  for (const time of TIMES_OF_DAY) assert.ok(elevation(at(time)) > 0);
});

test('every time and sky combination yields finite, valid lighting', () => {
  for (const timeOfDay of TIMES_OF_DAY)
    for (const sky of SKIES) {
      const preset = skyPreset({ timeOfDay, sky });
      for (const color of [preset.haze, preset.sunColor, preset.water.color, preset.dome.zenith])
        assert.match(color, /^#[0-9a-f]{6}$/);
      for (const value of [
        preset.sunIntensity,
        preset.ambientIntensity,
        preset.fogDensity,
        preset.clouds.coverage,
        ...preset.sunDirection,
        ...preset.clouds.lit,
      ])
        assert.ok(Number.isFinite(value), `${timeOfDay}/${sky}`);
      assert.equal(
        preset.backdrop === 'stars',
        timeOfDay === 'night' && ['clear', 'fair'].includes(sky),
      );
    }
});

test('bad weather dims the sun, thickens fog and brings rain', () => {
  const fair = skyPreset({ timeOfDay: 'day', sky: 'fair' }),
    fog = skyPreset({ timeOfDay: 'day', sky: 'fog' }),
    rain = skyPreset({ timeOfDay: 'day', sky: 'rain' }),
    storm = skyPreset({ timeOfDay: 'day', sky: 'storm' });
  assert.ok(fog.fogDensity > rain.fogDensity && rain.fogDensity > fair.fogDensity * 4);
  assert.ok(storm.sunIntensity < rain.sunIntensity && rain.sunIntensity < fair.sunIntensity);
  assert.equal(fair.rain, 0);
  assert.ok(rain.rain > 0 && storm.rain >= rain.rain);
  assert.equal(storm.lightning, true);
  assert.equal(rain.lightning, false);
  assert.equal(fog.clouds.visible, false);
  assert.equal(fog.backdrop, 'dome');
  assert.ok(
    skyPreset({ timeOfDay: 'day', sky: 'clear' }).clouds.coverage > fair.clouds.coverage,
    'a clear sky has fewer clouds',
  );
});

test('the default midday sky keeps the original look', () => {
  const preset = skyPreset({ timeOfDay: 'day', sky: 'fair' });
  assert.equal(preset.sunIntensity, 3.1);
  assert.equal(preset.ambientIntensity, 1.25);
  assert.equal(preset.environmentIntensity, 0.55);
  assert.equal(preset.fogDensity, 0.00031);
  assert.equal(preset.clouds.coverage, 0.5);
  const night = skyPreset({ timeOfDay: 'night', sky: 'fair' });
  assert.equal(night.haze, '#101c30');
  assert.equal(night.sunIntensity, 0.32);
});

test('navigation lights follow COLREGs Rule 20', () => {
  assert.equal(navigationLightsLit({ timeOfDay: 'day', sky: 'fair' }), false);
  assert.equal(navigationLightsLit({ timeOfDay: 'afternoon', sky: 'overcast' }), false);
  for (const timeOfDay of ['sunset', 'night', 'sunrise'])
    assert.equal(navigationLightsLit({ timeOfDay, sky: 'clear' }), true);
  for (const sky of ['fog', 'rain', 'storm'])
    assert.equal(navigationLightsLit({ timeOfDay: 'day', sky }), true);
});

test('lightning flashes now and then, and identically on replay', () => {
  const samples = Array.from({ length: 6000 }, (_, i) => lightningFlash(i / 20));
  const lit = samples.filter((value) => value > 0.5).length;
  assert.ok(lit > 10 && lit < samples.length * 0.05);
  assert.ok(samples.every((value) => value >= 0 && value <= 1));
  assert.deepEqual(
    samples.slice(0, 400),
    Array.from({ length: 400 }, (_, i) => lightningFlash(i / 20)),
  );
});

test('time of day and sky labels are translated in all six languages', () => {
  const labels = [...Object.values(TIME_OF_DAY_LABELS), ...Object.values(SKY_LABELS), 'Sky'].filter(
    (label) => !['Night'].includes(label),
  );
  for (const language of Object.keys(weatherUI))
    for (const label of labels) assert.ok(weatherUI[language][label], `${language}: ${label}`);
});
