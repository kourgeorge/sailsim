import {
  initialState,
  step,
  refreshDerived,
  groundVelocity,
  angleDifference,
  KNOT,
  VESSEL,
  depthAt,
} from '../physics.js';
import { PLAYER_HULL } from '../collisions.js';
import { anchorSnapshot } from '../anchor.js';
import { createSailingTrack, captureSailingTrack } from '../navigation/sailing-track.js';
import { markEntryFraction } from '../racing/race.js';
import { getChallenge } from './catalog.js';

const RAD = Math.PI / 180;
const FIXED_STEP = 1 / 30;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const targetBearing = (from, to) =>
  (Math.atan2(to.x - from.x, from.z - to.z) / RAD + 360) % 360;

export function createChallenge(id) {
  const definition = getChallenge(id);
  const state = initialState(definition.locationId);
  Object.assign(state, definition.conditions, definition.start);
  refreshDerived(state);
  state.mainSheet = state.trim = state.suggestedMainSheet;
  state.jibSheet = state.suggestedJibSheet;
  refreshDerived(state);
  const run = {
    definition,
    state,
    status: 'running',
    reason: '',
    elapsed: 0,
    accumulator: 0,
    stage: 0,
    hold: 0,
    hints: [],
    tacks: 0,
    tackSide: Math.sign(angleDifference(state.heading, state.waterWindDirection)),
    previousAngle: angleDifference(state.heading, state.waterWindDirection),
    crossedTo: 0,
    tackHold: 0,
    target: { ...definition.targets[0] },
    minClearance: keelClearance(state),
    track: createSailingTrack(state),
    score: 0,
    medal: null,
  };
  return run;
}

// Sample the footprint rather than accepting a safe centre with the bow over a shoal.
export function keelClearance(state) {
  const h = state.heading * RAD;
  let depth = Infinity;
  for (const side of [-PLAYER_HULL.beam / 2, 0, PLAYER_HULL.beam / 2]) {
    for (const forward of [-PLAYER_HULL.length / 2, 0, PLAYER_HULL.length / 2]) {
      depth = Math.min(
        depth,
        depthAt(
          state.x + side * Math.cos(h) + forward * Math.sin(h),
          state.z + side * Math.sin(h) - forward * Math.cos(h),
          state.locationId,
        ),
      );
    }
  }
  return depth - VESSEL.draft;
}

export function rescueGeometry(run) {
  const s = run.state,
    h = s.heading * RAD,
    dx = run.target.x - s.x,
    dz = run.target.z - s.z;
  const velocity = groundVelocity(s),
    c = run.definition.conditions;
  return {
    side: dx * Math.cos(h) + dz * Math.sin(h),
    forward: dx * Math.sin(h) - dz * Math.cos(h),
    relativeSpeed:
      Math.hypot(
        velocity.x - Math.sin(c.currentDirection * RAD) * c.currentSpeed * KNOT,
        velocity.z + Math.cos(c.currentDirection * RAD) * c.currentSpeed * KNOT,
      ) / KNOT,
  };
}

export function challengeRequirements(run) {
  const s = run.state,
    d = run.definition;
  const range = distance(s, run.target);
  if (d.kind === 'rescue') {
    const geometry = rescueGeometry(run);
    return [
      {
        label: 'Marker alongside',
        value: Math.abs(geometry.side),
        unit: 'm',
        target: '4–12 m · ±5 m',
        met:
          Math.abs(geometry.side) >= 4 &&
          Math.abs(geometry.side) <= 12 &&
          Math.abs(geometry.forward) <= 5,
      },
      {
        label: 'Relative speed',
        value: geometry.relativeSpeed,
        unit: 'kn',
        target: '≤ 0.5 kn',
        met: geometry.relativeSpeed <= 0.5,
      },
      { label: 'Engine neutral', met: Math.abs(s.throttle) < 0.01 },
    ];
  }
  if (d.kind === 'anchor') {
    const anchor = anchorSnapshot(s);
    return [
      {
        label: 'Distance to centre',
        value: range,
        unit: 'm',
        target: '≤ 22 m',
        met: range <= d.targets[0].radius,
      },
      {
        label: 'Speed over ground',
        value: s.speedOverGround,
        unit: 'kn',
        target: '≤ 0.25 kn',
        met: s.speedOverGround <= 0.25,
      },
      {
        label: 'Actual scope',
        value: anchor.scope,
        unit: ':1',
        target: '≥ 4:1',
        met: anchor.scope >= 4,
      },
      {
        label: 'Anchor set, payout finished',
        met:
          anchor.seabedContact &&
          !s.anchorDragging &&
          !s.anchorWinchRunning &&
          Math.abs(anchor.rode - anchor.targetRode) < 0.1,
      },
      {
        label: 'Sails down, engine neutral',
        met: s.mainHoist === 0 && s.jibHoist === 0 && Math.abs(s.throttle) < 0.01,
      },
    ];
  }
  if (d.kind === 'tack')
    return [
      { label: 'Tacks completed', value: run.tacks, target: '1', met: run.tacks === 1 },
      {
        label: 'Distance to finish',
        value: range,
        unit: 'm',
        target: '≤ 25 m',
        met: range <= run.target.radius,
      },
    ];
  if (d.kind === 'passage')
    return [
      {
        label: 'Keel clearance',
        value: keelClearance(s),
        unit: 'm',
        target: '≥ 1 m',
        met: keelClearance(s) >= d.clearance,
      },
      {
        label: 'Distance to finish',
        value: range,
        unit: 'm',
        target: '≤ 28 m',
        met: range <= run.target.radius,
      },
    ];
  return [{ label: 'Discoveries', value: run.stage, target: '3', met: run.stage === 3 }];
}

export function revealChallengeTarget(run) {
  if (
    run.status !== 'running' ||
    run.definition.kind !== 'treasure' ||
    run.hints.includes(run.stage)
  )
    return false;
  run.hints.push(run.stage);
  return true;
}

export function challengeScore(run) {
  const { goldTime, silverTime, timeLimit } = run.definition;
  const timeScore =
    run.elapsed <= goldTime
      ? 100 - (15 * run.elapsed) / goldTime
      : run.elapsed <= silverTime
        ? 85 - (20 * (run.elapsed - goldTime)) / (silverTime - goldTime)
        : 65 - (25 * (run.elapsed - silverTime)) / (timeLimit - silverTime);
  return Math.max(1, Math.min(100, Math.round(timeScore - run.hints.length * 10)));
}

export function finishChallenge(run, reason = 'Challenge ended', completed = false) {
  if (run.status !== 'running') return;
  run.status = completed ? 'completed' : 'failed';
  run.reason = completed ? 'Challenge complete' : reason;
  run.score = completed ? challengeScore(run) : 0;
  run.evidence = challengeRequirements(run);
  run.medal = completed ? (run.score >= 85 ? 'Gold' : run.score >= 65 ? 'Silver' : 'Bronze') : null;
  captureSailingTrack(run.track, run.state, run.elapsed);
}

function countTacks(run, dt) {
  const s = run.state,
    angle = angleDifference(s.heading, s.waterWindDirection);
  if (angle * run.previousAngle < 0) {
    if (Math.abs(angle - run.previousAngle) > 180) {
      finishChallenge(run, 'A gybe breaks the one-tack route.');
      return;
    }
    run.crossedTo = Math.sign(angle);
    run.tackHold = 0;
  }
  const side = Math.sign(angle);
  if (
    side !== run.tackSide &&
    side === run.crossedTo &&
    Math.abs(angle) >= 45 &&
    Math.abs(angle) < 140 &&
    s.speed >= 0.5 &&
    s.sails > 0
  ) {
    run.tackHold += dt;
    if (run.tackHold + 1e-8 >= 2) {
      run.tacks++;
      run.tackSide = side;
      run.crossedTo = 0;
      run.tackHold = 0;
      if (run.tacks > 1) finishChallenge(run, 'A second tack ends this challenge.');
    }
  } else run.tackHold = 0;
  // Retain a non-zero angle so landing exactly on north cannot hide a crossing.
  if (angle !== 0) run.previousAngle = angle;
}

// Called after every physics step. Exported separately to exercise objective boundaries.
export function assessChallenge(run, dt, previous = run.state) {
  if (run.status !== 'running') return;
  const s = run.state,
    d = run.definition;
  run.minClearance = Math.min(run.minClearance, keelClearance(s));
  if (s.grounded) return finishChallenge(run, 'Aground');
  if (s.collisionCount > 0) return finishChallenge(run, 'Hull contact ended the challenge.');
  if (d.clearance && run.minClearance < d.clearance)
    return finishChallenge(run, 'Keel clearance fell below 1 m.');
  if (run.elapsed >= d.timeLimit) return finishChallenge(run, 'Time limit reached');
  if (d.kind === 'tack') {
    countTacks(run, dt);
    if (run.status !== 'running') return;
  }
  if (d.kind === 'rescue') {
    const g = rescueGeometry(run);
    if (
      Math.abs(g.side) < PLAYER_HULL.beam / 2 + 0.8 &&
      Math.abs(g.forward) < PLAYER_HULL.length / 2 + 0.8
    )
      return finishChallenge(run, 'The hull touched the rescue marker.');
  }
  if (d.hold) {
    run.hold = challengeRequirements(run).every((item) => item.met) ? run.hold + dt : 0;
    if (run.hold + 1e-8 >= d.hold) {
      run.hold = d.hold;
      finishChallenge(run, '', true);
    }
  } else if (markEntryFraction(previous, s, run.target, run.target.radius) !== null) {
    if (d.kind === 'tack' && run.tacks !== 1) return;
    run.stage++;
    if (run.stage === d.targets.length) finishChallenge(run, '', true);
    else run.target = { ...d.targets[run.stage] };
  }
}

export function advanceChallenge(run, dt) {
  if (run.status !== 'running' || !Number.isFinite(dt) || dt <= 0) return;
  run.accumulator += Math.min(dt, 2);
  while (run.accumulator + 1e-10 >= FIXED_STEP && run.status === 'running') {
    run.accumulator -= FIXED_STEP;
    const s = run.state,
      d = run.definition,
      previous = { x: s.x, z: s.z };
    Object.assign(s, d.conditions);
    if (!d.engine) s.throttle = 0;
    step(s, FIXED_STEP);
    run.elapsed += FIXED_STEP;
    if (d.kind === 'rescue') {
      const c = d.conditions;
      run.target.x =
        d.targets[0].x + Math.sin(c.currentDirection * RAD) * c.currentSpeed * KNOT * run.elapsed;
      run.target.z =
        d.targets[0].z - Math.cos(c.currentDirection * RAD) * c.currentSpeed * KNOT * run.elapsed;
    }
    captureSailingTrack(run.track, s, run.elapsed);
    assessChallenge(run, FIXED_STEP, previous);
  }
}

export function challengeChart(run) {
  const d = run.definition;
  const revealed =
    d.kind !== 'treasure' || run.hints.includes(run.stage) || run.status === 'completed';
  return {
    ...d.chart,
    cues: {
      target: revealed ? run.target : null,
      rescue: d.kind === 'rescue' ? run.target : null,
      alternatives: d.alternatives,
      route:
        d.kind === 'treasure'
          ? [d.start, ...d.targets.slice(0, run.stage)].map((p, i) => ({ ...p, number: i }))
          : null,
    },
  };
}
