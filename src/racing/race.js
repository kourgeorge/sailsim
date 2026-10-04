import {
  initialState,
  step,
  refreshDerived,
  groundVelocity,
  angleDifference,
  wrap,
  clamp,
  KNOT,
  VESSEL,
} from '../physics.js';
import { createRigidBody, PLAYER_HULL, solveContacts } from '../collisions.js';
import { createSailingTrack, captureSailingTrack } from '../navigation/sailing-track.js';
import { createWeather, advanceWeather, raceWeatherSeed } from '../weather.js';

export const RACE_COURSES = [
  {
    id: 'harbor-sprint',
    name: 'Harbor Sprint',
    description: 'A short triangle of fast reaches and close turns.',
    locationId: 'haven',
    windDirection: 270,
    windSpeed: 14,
    currentSpeed: 0,
    currentDirection: 90,
    start: { x: -120, z: 850, heading: 0 },
    marks: [
      { x: -120, z: 650 },
      { x: 140, z: 720 },
      { x: -120, z: 850 },
    ],
  },
  {
    id: 'windward-duel',
    name: 'Windward Duel',
    description: 'Choose your tacks on the beat, then chase the fleet downwind.',
    locationId: 'haven',
    windDirection: 0,
    windSpeed: 15,
    currentSpeed: 0,
    currentDirection: 90,
    start: { x: 0, z: 1100, heading: 52 },
    marks: [
      { x: 0, z: 780 },
      { x: 220, z: 940 },
      { x: 0, z: 1100 },
    ],
  },
  {
    id: 'channel-chase',
    name: 'Channel Chase',
    description: 'Trade places through the strait while a cross-current pushes you off course.',
    locationId: 'strait',
    windDirection: 270,
    windSpeed: 16,
    currentSpeed: 1,
    currentDirection: 90,
    start: { x: 0, z: 650, heading: 340 },
    marks: [
      { x: -90, z: 360 },
      { x: 90, z: 80 },
      { x: -90, z: -230 },
      { x: 0, z: -460 },
    ],
  },
];
export const RACE_DIFFICULTIES = {
  relaxed: { name: 'Relaxed', trimError: 15, closeAngle: 57, steering: 1.4 },
  club: { name: 'Club', trimError: 7, closeAngle: 53, steering: 1.9 },
  expert: { name: 'Expert', trimError: 0, closeAngle: 50, steering: 2.3 },
};
const RIVALS = [
  { id: 'skye', name: 'Skye', color: '#63d9cc' },
  { id: 'amber', name: 'Amber', color: '#ffb45d' },
  { id: 'coral', name: 'Coral', color: '#f48aa1' },
];
export const MARK_RADIUS = 24;
const FIXED_STEP = 1 / 30,
  RAD = Math.PI / 180;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const bearing = (a, b) => wrap(Math.atan2(b.x - a.x, a.z - b.z) / RAD);

export function createRace(courseId, difficulty = 'club', { changingWeather = true } = {}) {
  const course = RACE_COURSES.find((item) => item.id === courseId);
  if (!course || !RACE_DIFFICULTIES[difficulty]) throw new RangeError('Unknown race or difficulty');
  const racers = [{ id: 'player', name: 'You', color: '#fff1ce' }, ...RIVALS].map(
    (rival, index) => {
      const state = initialState(course.locationId);
      Object.assign(state, course.start, {
        windDirection: course.windDirection,
        windSpeed: course.windSpeed,
        currentSpeed: course.currentSpeed,
        currentDirection: course.currentDirection,
        speed: 2,
      });
      // All four boats start abreast, behind the first mark, at the same speed.
      const direction = bearing(course.start, course.marks[0]) * RAD,
        lane = [0, -20, 20, 40][index];
      state.x += Math.cos(direction) * lane;
      state.z += Math.sin(direction) * lane;
      if (index) state.worldBodies = [];
      refreshDerived(state);
      state.mainSheet = state.trim = state.suggestedMainSheet;
      state.jibSheet = state.suggestedJibSheet;
      refreshDerived(state);
      return {
        ...rival,
        state,
        mark: 0,
        finished: null,
        tack: Math.sign(angleDifference(state.heading, state.windDirection)) || 1,
        lastTack: -30,
        body: createRigidBody({
          id: rival.id,
          kind: 'free',
          mass: VESSEL.mass,
          shape: PLAYER_HULL,
        }),
      };
    },
  );
  return {
    course,
    difficulty,
    weather: createWeather(course, { enabled: changingWeather, seed: raceWeatherSeed(course.id) }),
    racers,
    player: racers[0].state,
    track: createSailingTrack(racers[0].state),
    countdown: 5,
    elapsed: 0,
    accumulator: 0,
    status: 'countdown',
    reason: '',
    contacts: 0,
  };
}

// Steering chooses a sailable heading and a tack; speed always comes from the
// same sail-force, drag, current and rudder model used by the player's yacht.
export function steerRacer(race, racer, index = 0) {
  const s = racer.state,
    target = race.course.marks[racer.mark];
  if (!target || racer.finished !== null) return;
  const skill = RACE_DIFFICULTIES[race.difficulty];
  const direct = bearing(s, target),
    wind = s.waterWindDirection ?? s.windDirection;
  const angle = angleDifference(direct, wind),
    close = skill.closeAngle + index;
  let heading = direct;
  if (Math.abs(angle) < close) {
    const nextTack = angle < 0 ? -1 : 1;
    if (nextTack !== racer.tack && Math.abs(angle) > 18 && race.elapsed - racer.lastTack > 18) {
      racer.tack = nextTack;
      racer.lastTack = race.elapsed;
    }
    heading = wrap(wind + racer.tack * close);
  } else {
    // Correct the ground track for current and leeway without steering into irons.
    const drift = clamp(angleDifference(s.courseOverGround, s.heading), -18, 18);
    const corrected = wrap(direct - drift);
    if (Math.abs(angleDifference(corrected, wind)) >= close) heading = corrected;
  }
  // Give a nearby boat room; the fleet still has real hull contacts if crowded.
  for (const other of race.racers) {
    if (other === racer || distance(s, other.state) > 22) continue;
    const relative = angleDifference(bearing(s, other.state), s.heading);
    if (Math.abs(relative) < 60) heading = wrap(heading + (relative >= 0 ? -16 : 16));
  }
  s.rudder = clamp(angleDifference(heading, s.heading) * skill.steering - s.yawRate * 3, -35, 35);
  const error = skill.trimError + index * 1.5;
  // Less experienced rivals over-trim a little. Easing beyond the apparent
  // wind angle would leave them permanently luffing instead of simply slower.
  s.mainSheet = s.trim = clamp(s.suggestedMainSheet - error, 0, 85);
  s.jibSheet = clamp(s.suggestedJibSheet - error, 0, 85);
  s.outhaul = clamp(s.windSpeed / 25, 0, 1);
  s.vang = clamp(Math.abs(s.apparentWindAngle) / 140, 0.2, 0.85);
}

function fleetContacts(race) {
  const bodies = race.racers.map((racer) => {
    const s = racer.state,
      v = groundVelocity(s),
      b = racer.body;
    Object.assign(b, {
      x: s.x,
      z: s.z,
      heading: s.heading,
      yawRate: s.yawRate,
      vx: v.x,
      vz: v.z,
      grounded: s.grounded,
    });
    return b;
  });
  const contacts = solveContacts(bodies);
  if (!contacts.length) return;
  race.contacts += contacts.filter((contact) => contact.impulse > 1).length;
  for (const racer of race.racers) {
    const s = racer.state,
      b = racer.body,
      h = b.heading * RAD,
      c = s.currentDirection * RAD;
    if (s.grounded) continue;
    const vx = b.vx - Math.sin(c) * s.currentSpeed * KNOT,
      vz = b.vz + Math.cos(c) * s.currentSpeed * KNOT;
    Object.assign(s, {
      x: b.x,
      z: b.z,
      heading: b.heading,
      yawRate: b.yawRate,
      speed: (vx * Math.sin(h) - vz * Math.cos(h)) / KNOT,
      leeway: vx * Math.cos(h) + vz * Math.sin(h),
    });
    refreshDerived(s);
  }
}

// Segment/circle intersection prevents a low frame rate from skipping a mark.
export function markEntryFraction(from, to, mark, radius = MARK_RADIUS) {
  const x = from.x - mark.x,
    z = from.z - mark.z,
    dx = to.x - from.x,
    dz = to.z - from.z;
  const c = x * x + z * z - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dz * dz,
    b = 2 * (x * dx + z * dz),
    disc = b * b - 4 * a * c;
  if (a < 1e-12 || disc < 0) return null;
  const fraction = (-b - Math.sqrt(disc)) / (2 * a);
  return fraction >= 0 && fraction <= 1 ? fraction : null;
}

export function raceStandings(race) {
  const remaining = (racer) => {
    if (racer.finished !== null) return 0;
    let length = distance(racer.state, race.course.marks[racer.mark]);
    for (let i = racer.mark + 1; i < race.course.marks.length; i++)
      length += distance(race.course.marks[i - 1], race.course.marks[i]);
    return length;
  };
  return race.racers
    .map((racer) => ({ ...racer, remaining: remaining(racer) }))
    .sort((a, b) => {
      if (a.finished !== null || b.finished !== null)
        return (a.finished ?? Infinity) - (b.finished ?? Infinity);
      return b.mark - a.mark || a.remaining - b.remaining;
    });
}

export function advanceRace(race, dt, { autopilotPlayer = false } = {}) {
  if (!Number.isFinite(dt) || dt <= 0 || race.status === 'finished') return;
  race.accumulator += Math.min(dt, 2);
  while (race.accumulator + 1e-9 >= FIXED_STEP && race.status !== 'finished') {
    race.accumulator -= FIXED_STEP;
    if (race.countdown > 0) {
      race.countdown = Math.max(0, race.countdown - FIXED_STEP);
      if (race.countdown < 1e-8) {
        race.countdown = 0;
        race.status = 'racing';
      }
      continue;
    }
    const before = race.racers.map((racer) => ({ x: racer.state.x, z: racer.state.z }));
    const conditions = advanceWeather(race.weather, FIXED_STEP);
    for (const [index, racer] of race.racers.entries()) {
      const s = racer.state;
      // All competitors experience exactly the same weather and no engine assistance.
      Object.assign(s, conditions, { throttle: 0 });
      refreshDerived(s);
      if (index || autopilotPlayer) steerRacer(race, racer, index);
      if (racer.finished !== null) {
        // Sail clear of the finish before stopping so early finishers do not
        // form a wall across the final ring for the boats behind them.
        s.rudder = 0;
        if (distance(s, race.course.marks.at(-1)) > 90) {
          s.speed = 0;
          s.leeway = 0;
          s.yawRate = 0;
          continue;
        }
      }
      step(s, FIXED_STEP);
    }
    fleetContacts(race);
    for (const [index, racer] of race.racers.entries()) {
      if (racer.finished !== null) continue;
      const entry = markEntryFraction(before[index], racer.state, race.course.marks[racer.mark]);
      if (entry !== null && ++racer.mark === race.course.marks.length)
        racer.finished = race.elapsed + entry * FIXED_STEP;
    }
    race.elapsed += FIXED_STEP;
    captureSailingTrack(race.track, race.player, race.elapsed);
    if (race.racers[0].finished !== null || race.player.grounded || race.elapsed >= 900) {
      race.status = 'finished';
      race.reason = race.player.grounded
        ? 'Aground'
        : race.racers[0].finished !== null
          ? 'Finished'
          : 'Time limit reached';
    }
  }
}
