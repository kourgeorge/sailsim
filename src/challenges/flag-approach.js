import { windOverWater } from '../physics.js';
import { PLAYER_HULL } from '../collisions.js';

const RAD = Math.PI / 180;
// Passes further out than this are ordinary sailing, not an attempt at the flag.
const ATTEMPT_RANGE = 15;
export const FLAG_GAP = 5;
export const FLAG_MIN_SPEED = 1;

// Point A: the start sits 200 m straight downwind of the flag, as an instructor would set it.
export const FLAG_APPROACH = {
  id: 'flag-approach',
  name: 'Flag Approach',
  kind: 'flag',
  symbol: '⚑',
  difficulty: 'Hard',
  description:
    'The examiner calls a point of sail and a tack. Sail past the flag exactly as called, four times.',
  instructions:
    'For each call, sail past the flag with it on your windward side, no more than 5 m from the hull, moving at 1 kn or more, on the called point of sail and tack. Do not stop beside it or touch it. A wrong pass costs 5 points; try again.',
  locationId: 'haven',
  engine: false,
  conditions: { windDirection: 0, windSpeed: 12, currentDirection: 90, currentSpeed: 0 },
  start: { x: 100, z: 1150, heading: 315, speed: 3 },
  targets: [{ x: 100, z: 950, radius: 5 }],
  calls: [
    { label: 'Close-hauled, port tack', pointOfSail: 'close-hauled', tack: -1 },
    { label: 'Close-hauled, starboard tack', pointOfSail: 'close-hauled', tack: 1 },
    { label: 'Broad reach, starboard tack', pointOfSail: 'broad-reach', tack: 1 },
    { label: 'Broad reach, port tack', pointOfSail: 'broad-reach', tack: -1 },
  ],
  tips: [
    'You start at point A: about 200 m straight downwind of the flag, so it streams toward you.',
    'The flag is upwind, so trim for close-hauled first, then think.',
    'Check the call. If it asks for the tack you are on now, tack straight away so you arrive from the other side.',
    'Sail as close to the wind as you can and watch the angle from your bow to the flag. At about 100°, tack and sail to the flag.',
    'For a broad-reach call, first get upwind of the flag, then turn and come down to it on the called tack.',
    'Keep sailing as you pass. This is not a person-overboard stop.',
  ],
  goldTime: 600,
  silverTime: 840,
  timeLimit: 1500,
  chart: { center: { x: 100, z: 1000 }, span: 700 },
};

// Same frame as rescue geometry: positive side is starboard, positive forward is ahead.
export function flagGeometry(state, flag) {
  const h = state.heading * RAD,
    dx = flag.x - state.x,
    dz = flag.z - state.z;
  return {
    side: dx * Math.cos(h) + dz * Math.sin(h),
    forward: dx * Math.sin(h) - dz * Math.cos(h),
  };
}

// Recompute from the raw heading and wind so cached instrument values cannot pass a call.
export function sailingAs(state) {
  const angle = windOverWater(state).angle ?? 0,
    off = Math.abs(angle);
  return {
    tack: angle >= 0 ? 1 : -1,
    pointOfSail: off <= 60 ? 'close-hauled' : off >= 110 && off <= 165 ? 'broad-reach' : 'other',
  };
}

export function flagRequirements(run) {
  const s = run.state,
    call = run.definition.calls[Math.min(run.stage, run.definition.calls.length - 1)];
  const g = flagGeometry(s, run.target),
    sailing = sailingAs(s),
    gap = Math.max(0, Math.abs(g.side) - PLAYER_HULL.beam / 2);
  return [
    {
      label: 'Calls completed',
      value: run.stage,
      target: String(run.definition.calls.length),
      met: run.stage === run.definition.calls.length,
    },
    { label: 'Called point of sail', met: s.sails > 0 && sailing.pointOfSail === call.pointOfSail },
    { label: 'Called tack', met: sailing.tack === call.tack },
    { label: 'Flag on windward side', met: Math.sign(g.side) === sailing.tack },
    {
      label: 'Gap to hull',
      value: gap,
      unit: 'm',
      target: `≤ ${FLAG_GAP} m`,
      met: gap <= FLAG_GAP,
    },
    {
      label: 'Boat speed',
      value: s.speed,
      unit: 'kn',
      target: `≥ ${FLAG_MIN_SPEED} kn`,
      met: s.speed >= FLAG_MIN_SPEED,
    },
  ];
}

// Judges the moment the flag passes abeam. Returns 'pass', 'miss', 'hit' or null.
export function judgeFlagPass(run) {
  const s = run.state,
    g = flagGeometry(s, run.target),
    previous = run.flagForward;
  run.flagForward = g.forward;
  const halfBeam = PLAYER_HULL.beam / 2;
  if (Math.abs(g.side) < halfBeam + 0.3 && Math.abs(g.forward) < PLAYER_HULL.length / 2)
    return 'hit';
  if (!(previous > 0 && g.forward <= 0) || Math.abs(g.side) > ATTEMPT_RANGE) return null;
  const call = run.definition.calls[run.stage],
    sailing = sailingAs(s);
  const reason =
    Math.abs(g.side) - halfBeam > FLAG_GAP
      ? 'Too wide. Pass within 5 m of the hull.'
      : Math.sign(g.side) !== sailing.tack
        ? 'The flag was on your leeward side. Keep it upwind of the boat.'
        : s.speed < FLAG_MIN_SPEED
          ? 'Keep moving as you pass. Do not stop beside the flag.'
          : s.sails <= 0 || sailing.pointOfSail !== call.pointOfSail
            ? 'Wrong point of sail for this call.'
            : sailing.tack !== call.tack
              ? 'Wrong tack for this call.'
              : '';
  if (!reason) return 'pass';
  run.misses.push({ stage: run.stage, elapsed: run.elapsed, reason });
  return 'miss';
}
