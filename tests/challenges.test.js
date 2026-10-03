import test from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGES } from '../src/challenges/catalog.js';
import {
  createChallenge,
  advanceChallenge,
  assessChallenge,
  challengeRequirements,
  challengeChart,
  challengeScore,
  revealChallengeTarget,
  finishChallenge,
  keelClearance,
  targetBearing,
} from '../src/challenges/engine.js';
import {
  readChallengeBest,
  saveChallengeBest,
  challengeRecordKey,
} from '../src/challenges/records.js';
import { initializeAnchoredScenario } from '../src/anchor.js';
import { refreshDerived, angleDifference, clamp, KNOT } from '../src/physics.js';
import { challengesUI } from '../src/i18n/challenges.js';

test('five distinct authored challenges start safely and cannot complete untouched', () => {
  assert.equal(new Set(CHALLENGES.map((d) => d.kind)).size, 5);
  for (const d of CHALLENGES) {
    const run = createChallenge(d.id);
    assert.ok(run.minClearance > 1);
    for (let i = 0; i < 30; i++) advanceChallenge(run, 1);
    assert.equal(run.status, 'running', d.id);
    assert.equal(run.stage, 0);
    assert.equal(run.hold, 0);
    assert.equal(run.tacks, 0);
  }
  assert.throws(() => createChallenge('missing'), RangeError);
});

test('fixed-step challenge timing and marker drift are independent of frame partitions', () => {
  const a = createChallenge('rescue-run'),
    b = createChallenge('rescue-run');
  for (let i = 0; i < 600; i++) advanceChallenge(a, 1 / 60);
  for (let i = 0; i < 40; i++) advanceChallenge(b, 0.25);
  assert.equal(a.elapsed, b.elapsed);
  assert.deepEqual(a.target, b.target);
  assert.deepEqual(a.track, b.track);
  assert.equal(a.state.x, b.state.x);
  assert.equal(a.state.z, b.state.z);
  assert.ok(Math.abs(a.target.x - a.definition.targets[0].x - 0.4 * KNOT * a.elapsed) < 1e-8);
  const snapshot = structuredClone(a);
  for (const dt of [0, -1, NaN, Infinity]) advanceChallenge(a, dt);
  assert.deepEqual(a, snapshot);
});

test('authored weather and sail-only engine restrictions are enforced by the solver', () => {
  for (const d of CHALLENGES) {
    const run = createChallenge(d.id);
    Object.assign(run.state, { throttle: 1, windSpeed: 40, currentSpeed: 9 });
    advanceChallenge(run, 0.1);
    assert.equal(run.state.throttle, d.engine ? 1 : 0);
    for (const [key, value] of Object.entries(d.conditions)) assert.equal(run.state[key], value);
  }
});

test('rescue requires a continuous safe alongside hold, using speed relative to the drifting marker', () => {
  const run = createChallenge('rescue-run');
  Object.assign(run.state, {
    x: run.target.x - 8,
    z: run.target.z,
    heading: 0,
    speed: 0,
    leeway: 0,
  });
  refreshDerived(run.state);
  assert.equal(run.state.speedOverGround, 0.4);
  assert.ok(challengeRequirements(run).every((r) => r.met));
  assessChallenge(run, 3);
  assert.equal(run.hold, 3);
  run.state.throttle = 0.1;
  assessChallenge(run, 1);
  assert.equal(run.hold, 0, 'engine assistance resets the hold');
  run.state.throttle = 0;
  run.state.speed = 1;
  refreshDerived(run.state);
  assessChallenge(run, 5);
  assert.equal(run.hold, 0, 'passing quickly alongside is not a rescue');
  run.state.speed = 0;
  refreshDerived(run.state);
  assessChallenge(run, 5.9);
  assert.equal(run.status, 'running');
  assessChallenge(run, 0.1);
  assert.equal(run.status, 'completed');
  const collision = createChallenge('rescue-run');
  Object.assign(collision.state, collision.target);
  assessChallenge(collision, 0.1);
  assert.equal(collision.reason, 'The hull touched the rescue marker.');
});

test('anchoring credit uses actual bottom contact, paid scope, completed payout, and ground speed', () => {
  const run = createChallenge('anchor-bullseye');
  Object.assign(run.state, run.target, { heading: 90, speed: -0.6 });
  refreshDerived(run.state);
  run.state.anchorRode = 80;
  assessChallenge(run, 10);
  assert.equal(run.hold, 0, 'a target rode length is not deployment');
  initializeAnchoredScenario(run.state, { rode: 80 });
  refreshDerived(run.state);
  assert.ok(challengeRequirements(run).every((r) => r.met));
  assessChallenge(run, 4);
  run.state.anchorWinchRunning = true;
  assessChallenge(run, 1);
  assert.equal(run.hold, 0);
  run.state.anchorWinchRunning = false;
  run.state.speed = 0;
  refreshDerived(run.state);
  assessChallenge(run, 10);
  assert.equal(run.hold, 0, 'drift over the ground is still movement');
  run.state.speed = -0.6;
  refreshDerived(run.state);
  assessChallenge(run, 10);
  assert.equal(run.status, 'completed');
});

test('treasure discoveries are ordered, hidden, and charge each revealed clue only once', () => {
  const run = createChallenge('treasure-chart');
  assert.equal(challengeChart(run).cues.target, null);
  Object.assign(run.state, run.definition.targets[2]);
  assessChallenge(run, 0.1);
  assert.equal(run.stage, 0);
  assert.equal(revealChallengeTarget(run), true);
  assert.equal(revealChallengeTarget(run), false);
  assert.deepEqual(run.hints, [0]);
  assert.ok(challengeChart(run).cues.target);
  for (const [index, target] of run.definition.targets.entries()) {
    Object.assign(run.state, target);
    assessChallenge(run, 0.1);
    assert.equal(run.stage, index + 1);
    if (index < 2) assert.equal(challengeChart(run).cues.target, null);
  }
  assert.equal(run.status, 'completed');
  assert.equal(run.score, 90);
});

test('route objectives detect crossings between samples', () => {
  const run = createChallenge('treasure-chart');
  const target = run.target;
  Object.assign(run.state, { x: target.x + 30, z: target.z });
  assessChallenge(run, 0.1, { x: target.x - 30, z: target.z });
  assert.equal(run.stage, 1);
});

function setHeading(run, angle, seconds = 0.1) {
  run.state.heading = (angle + 360) % 360;
  refreshDerived(run.state);
  assessChallenge(run, seconds);
}

test('tack assessment survives north wrap, requires establishment, and rejects extra tacks and gybes', () => {
  const run = createChallenge('one-tack-wonder');
  for (const angle of [15, 2, 0, -2, 0, 2, -2, -20, -50]) setHeading(run, angle);
  assert.equal(run.tacks, 0);
  setHeading(run, -52, 1.9);
  assert.equal(run.tacks, 1);
  for (let i = 0; i < 10; i++) setHeading(run, -52);
  assert.equal(run.tacks, 1);
  for (const angle of [-15, 0, 15, 52]) setHeading(run, angle);
  setHeading(run, 52, 1.9);
  assert.equal(run.reason, 'A second tack ends this challenge.');
  const gybe = createChallenge('one-tack-wonder');
  for (const angle of [120, 175, -175]) setHeading(gybe, angle);
  assert.equal(gybe.reason, 'A gybe breaks the one-tack route.');
  const noTack = createChallenge('one-tack-wonder');
  Object.assign(noTack.state, noTack.target);
  assessChallenge(noTack, 0.1);
  assert.equal(noTack.status, 'running');
});

test('shoal clearance, groundings, contacts, timeouts and interrupted runs cannot award medals', () => {
  const shallow = createChallenge('shallow-shortcut');
  Object.assign(shallow.state, { x: -95, z: -330 });
  assert.ok(keelClearance(shallow.state) < 1);
  assessChallenge(shallow, 0.1);
  assert.equal(shallow.reason, 'Keel clearance fell below 1 m.');
  for (const change of [{ grounded: true }, { collisionCount: 1 }, {}]) {
    const run = createChallenge('treasure-chart');
    Object.assign(run.state, change);
    if (!Object.keys(change).length) run.elapsed = run.definition.timeLimit;
    assessChallenge(run, 0.1);
    assert.equal(run.status, 'failed');
    assert.equal(run.medal, null);
    assert.equal(run.score, 0);
    const ended = structuredClone(run);
    advanceChallenge(run, 1);
    assert.deepEqual(run, ended);
  }
  const run = createChallenge('rescue-run');
  finishChallenge(run);
  assert.equal(run.score, 0);
});

test('medals and stored records prefer higher scores then lower times, tolerate corrupt or unavailable storage', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const run = createChallenge('treasure-chart');
  assert.equal(saveChallengeBest(storage, run), false);
  run.elapsed = run.definition.goldTime;
  assert.equal(challengeScore(run), 85);
  run.hints = [0];
  assert.equal(challengeScore(run), 75);
  finishChallenge(run, '', true);
  assert.equal(run.medal, 'Silver');
  assert.equal(saveChallengeBest(storage, run), true);
  assert.equal(saveChallengeBest(storage, run), false);
  assert.deepEqual(readChallengeBest(storage, run.definition.id), {
    score: 75,
    elapsed: run.elapsed,
  });
  run.elapsed -= 1;
  assert.equal(saveChallengeBest(storage, run), true);
  run.score = 74;
  assert.equal(saveChallengeBest(storage, run), false);
  for (const value of ['oops', '{"score":101,"elapsed":20}', '{"score":80,"elapsed":-1}']) {
    storage.setItem(challengeRecordKey(run.definition.id), value);
    assert.equal(readChallengeBest(storage, run.definition.id), null);
  }
  const unavailable = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.equal(readChallengeBest(unavailable, run.definition.id), null);
  assert.equal(saveChallengeBest(unavailable, run), false);
});

test('all six languages cover authored challenge text and preserve every placeholder', () => {
  for (const dictionary of Object.values(challengesUI)) {
    assert.deepEqual(Object.keys(dictionary), Object.keys(challengesUI.en));
    for (const [key, value] of Object.entries(dictionary)) {
      assert.ok(value?.trim(), key);
      assert.deepEqual(
        [...value.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(),
        [...key.matchAll(/\{\w+\}/g)].map((m) => m[0]).sort(),
      );
    }
    for (const d of CHALLENGES)
      for (const text of [
        d.name,
        d.description,
        d.instructions,
        ...d.targets.map((p) => p.clue).filter(Boolean),
      ])
        assert.ok(dictionary[text], text);
  }
});

// These pilots only change helm, sail trim, throttle and anchor controls. They
// never move the boat, edit elapsed time, or synthesize assessment evidence.
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function steer(state, heading) {
  state.rudder = clamp(angleDifference(heading, state.heading) * 1.7 - state.yawRate * 3, -35, 35);
}
function drive(state, point, speed = 3, slow = false) {
  let heading = targetBearing(state, point);
  if (state.speedOverGround > 0.5)
    heading -= clamp(angleDifference(state.courseOverGround, state.heading), -15, 15);
  steer(state, heading);
  const target = slow ? Math.min(speed, distance(state, point) * 0.05) : speed,
    u = target * KNOT;
  state.throttle = clamp((58 * u + 38 * u * u) / 1650 + (target - state.speed) * 0.45, -0.8, 1);
}
function trim(state) {
  state.mainSheet = state.trim = state.suggestedMainSheet;
  state.jibSheet = state.suggestedJibSheet;
}

test('every challenge and both passage choices can be completed through the production physics', () => {
  for (const id of [...CHALLENGES.map((d) => d.id), 'outer-passage']) {
    const run = createChallenge(id === 'outer-passage' ? 'shallow-shortcut' : id);
    let phase = 0,
      stopped = false;
    while (run.status === 'running') {
      const s = run.state;
      if (id === 'treasure-chart') {
        steer(
          s,
          targetBearing(s, run.target) -
            clamp(angleDifference(s.courseOverGround, s.heading), -18, 18),
        );
        trim(s);
      } else if (id === 'one-tack-wonder') {
        if (s.x > 235) phase = 1;
        let heading = phase ? 308 : 52;
        const direct = targetBearing(s, run.target);
        if (phase && direct < 310 && direct > 220)
          heading = direct - clamp(angleDifference(s.courseOverGround, s.heading), -12, 12);
        steer(s, heading);
        trim(s);
      } else if (run.definition.kind === 'passage') {
        const points = run.definition.alternatives[id === 'outer-passage' ? 1 : 0].points;
        if (phase < points.length - 1 && distance(s, points[phase]) < 12) phase++;
        drive(s, points[phase], 3.7);
      } else if (id === 'rescue-run') {
        if (phase === 0) {
          const point = { x: run.target.x + 9, z: run.target.z - 55 };
          drive(s, point);
          if (distance(s, point) < 12) phase = 1;
        } else if (!stopped) {
          const point = { x: run.target.x + 9, z: run.target.z };
          drive(s, point, 1.2, true);
          if (distance(s, point) < 4 && s.speed < 0.5) stopped = true;
        } else {
          s.throttle = 0;
          s.rudder = 0;
        }
      } else if (id === 'anchor-bullseye') {
        if (!stopped) {
          const point = { x: 150, z: 230 };
          drive(s, point, 2.5, true);
          if (distance(s, point) < 15 && s.speed < 0.8) {
            stopped = true;
            s.anchorRode = 85;
            s.anchor = true;
          }
        } else {
          s.throttle = 0;
          s.rudder = 0;
        }
      }
      advanceChallenge(run, 0.1);
    }
    assert.equal(run.status, 'completed', `${id}: ${run.reason} at ${run.state.x},${run.state.z}`);
    assert.ok(run.elapsed > 30 && run.elapsed < run.definition.timeLimit);
    assert.ok(run.score >= 1 && run.score <= 100);
    assert.ok(run.track.samples.length > 20);
    assert.equal(run.state.collisionCount, 0);
  }
});
