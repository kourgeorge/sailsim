import test from 'node:test';
import assert from 'node:assert/strict';
import { createVesselHorns } from '../src/world/vessel-horns.js';
import { hornSamples } from '../src/audio/horns.js';

const body = (patch = {}) => ({
  id: 'boat',
  x: 0,
  z: -40,
  vx: 0,
  vz: 3,
  visual: { type: 'yacht' },
  ...patch,
});
const state = (...bodies) => ({
  x: 0,
  z: 0,
  speed: 0,
  heading: 0,
  elapsed: 0,
  worldBodies: bodies,
});

test('horn warnings follow closing risk, with cooldown and no receding warnings', () => {
  const s = state(body()),
    horns = createVesselHorns();
  assert.equal(horns.update(s, true), null);
  s.elapsed = 5;
  assert.equal(horns.update(s, true).signal, 'warning');
  for (let time = 6; time < 40; time++) {
    s.elapsed = time;
    assert.equal(horns.update(s, true), null);
  }
  s.elapsed = 41;
  assert.equal(horns.update(s, true).signal, 'warning');
  s.worldBodies[0].vz = -3;
  s.elapsed = 80;
  assert.equal(horns.update(s, true), null);
});

test('disabled sessions are silent and a new world resets pending signals', () => {
  const s = state(body()),
    horns = createVesselHorns();
  horns.update(s, true);
  s.elapsed = 10;
  assert.equal(horns.update(s, false), null);
  assert.equal(horns.update(s, true).signal, 'warning');
  s.worldBodies = [body()];
  assert.equal(horns.update(s, true), null);
});

test('nearby greetings are infrequent, directional, and warnings take priority', () => {
  const s = state(body({ x: 100, z: 0, vz: 0 })),
    horns = createVesselHorns();
  const greetings = [];
  for (s.elapsed = 0; s.elapsed < 600; s.elapsed++) {
    const event = horns.update(s, true);
    if (event) {
      greetings.push(s.elapsed);
      assert.equal(event.signal, 'greeting');
      assert.ok(event.pan > 0);
    }
  }
  assert.ok(greetings.length >= 2 && greetings.length <= 5);
  assert.ok(greetings[0] >= 25);
  assert.ok(greetings.slice(1).every((time, index) => time - greetings[index] >= 130));
  const warningHorns = createVesselHorns();
  const encounter = state(
    body({ x: 100, z: 0, vz: 0 }),
    body({ id: 'ship', z: -150, vz: 10, visual: { type: 'cruise' } }),
  );
  warningHorns.update(encounter, true);
  encounter.elapsed = 80;
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(warningHorns.update(encounter, true)).filter(([key]) =>
        ['voice', 'signal'].includes(key),
      ),
    ),
    { voice: 'ship', signal: 'warning' },
  );
});

test('recent contact produces a warning even without a closing velocity', () => {
  const s = state(body({ vz: 0 })),
    horns = createVesselHorns();
  horns.update(s, true);
  s.elapsed = 5;
  s.collision = { bodyId: 'boat', time: 4.8 };
  assert.equal(horns.update(s, true).signal, 'warning');
});

test('a greeting does not postpone a newly urgent warning for the greeting cooldown', () => {
  const s = state(body({ x: 100, z: 0, vz: 0 })),
    horns = createVesselHorns();
  let greeting;
  for (s.elapsed = 0; s.elapsed < 90; s.elapsed++) {
    greeting = horns.update(s, true);
    if (greeting) break;
  }
  assert.equal(greeting.signal, 'greeting');
  s.elapsed += 3;
  s.worldBodies.push(body({ id: 'closing' }));
  assert.equal(horns.update(s, true).signal, 'warning');
});

test('warning audio has five one-second blasts and distinct small/large fundamentals', () => {
  const rate = 8000;
  const power = (data, hz) => {
    let real = 0,
      imaginary = 0;
    for (let i = rate / 10; i < rate * 0.8; i++) {
      real += data[i] * Math.cos((2 * Math.PI * hz * i) / rate);
      imaginary += data[i] * Math.sin((2 * Math.PI * hz * i) / rate);
    }
    return Math.hypot(real, imaginary);
  };
  for (const voice of ['ship', 'boat']) {
    const samples = hornSamples(voice, 'warning', rate);
    let bursts = 0,
      sounding = false;
    for (let offset = 0; offset < samples.length; offset += 80) {
      const audible = samples.slice(offset, offset + 80).some((value) => Math.abs(value) > 0.01);
      if (audible && !sounding) bursts++;
      sounding = audible;
    }
    assert.equal(bursts, 5);
    assert.ok(samples.length / rate > 6 && samples.length / rate < 6.5);
    assert.ok(samples.every((value) => Number.isFinite(value) && Math.abs(value) < 1));
    assert.ok(
      power(samples, voice === 'ship' ? 82 : 330) >
        power(samples, voice === 'ship' ? 330 : 82) * 20,
    );
  }
});
