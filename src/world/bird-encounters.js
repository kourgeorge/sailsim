import { getLocation } from '../locations.js';
import { islandHeight } from '../rendering/geography.js';

const TAU = Math.PI * 2;
const smooth = (a, b, value) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const BIRD_SPECIES = Object.freeze([
  Object.freeze({
    id: 'eagle',
    name: 'Sea eagle',
    span: 2.25,
    body: 0.76,
    speed: 8,
    flapRate: 1.15,
    back: '#594735',
    belly: '#ac9269',
    head: '#c5b392',
    beak: '#bd9651',
    tip: '#302c29',
    formations: ['soaring', 'pair'],
  }),
  Object.freeze({
    id: 'gull',
    name: 'Gull',
    span: 1.38,
    body: 0.51,
    speed: 7,
    flapRate: 1.8,
    back: '#b7c5c6',
    belly: '#e5e9dc',
    head: '#e8ebdf',
    beak: '#cba263',
    tip: '#3b4548',
    formations: ['soaring', 'pair', 'loose'],
  }),
  Object.freeze({
    id: 'cormorant',
    name: 'Cormorant',
    span: 1.55,
    body: 0.69,
    speed: 9,
    flapRate: 2.5,
    back: '#273b3c',
    belly: '#3a4d47',
    head: '#283a36',
    beak: '#9eaa85',
    tip: '#203035',
    formations: ['pair', 'v', 'loose'],
  }),
  Object.freeze({
    id: 'tern',
    name: 'Tern',
    span: 0.92,
    body: 0.37,
    speed: 8.5,
    flapRate: 3.1,
    back: '#b8caca',
    belly: '#e1e9e4',
    head: '#303b41',
    beak: '#ca7753',
    tip: '#677981',
    formations: ['pair', 'loose'],
  }),
]);
export const BIRD_FORMATIONS = Object.freeze(['soaring', 'pair', 'v', 'loose']);
export const MAX_VISIBLE_BIRDS = 18;

export function birdLimit(quality) {
  return ['minimum', 'compatibility'].includes(quality.name)
    ? 6
    : quality.name === 'low'
      ? 9
      : MAX_VISIBLE_BIRDS;
}

// Formation coordinates are metres across / behind the leader, in flight axes.
export function birdOffset(formation, index, seed = 0) {
  if (formation === 'pair') return { across: index ? 2.6 : -2.6, behind: index * 1.5 };
  if (formation === 'v') {
    const row = Math.ceil(index / 2);
    return { across: row * (index % 2 ? -3 : 3), behind: row * 3.8 };
  }
  if (formation === 'loose')
    return {
      across: ((index % 4) - 1.5) * 3.2 + Math.sin(index * 2.4 + seed) * 0.8,
      behind: Math.floor(index / 4) * 4.4 + Math.cos(index * 1.8 + seed) * 1.3 + index * 0.1,
    };
  return { across: 0, behind: 0 };
}

export function sampleBirdFlight(event, index, time, target = {}) {
  const age = time - event.start;
  if (event.formation === 'soaring') {
    const point = (t) => {
      const radius =
        event.radius +
        150 * (1 - smooth(0, 8, t)) +
        150 * smooth(event.duration - 8, event.duration, t);
      const angle = event.seed + (t * event.speed) / event.radius;
      return { x: event.x + Math.cos(angle) * radius, z: event.z + Math.sin(angle) * radius };
    };
    const here = point(age),
      next = point(age + 0.02);
    target.x = here.x;
    target.z = here.z;
    target.heading = Math.atan2(next.x - here.x, here.z - next.z);
    target.bank = -0.2;
  } else {
    const offset = birdOffset(event.formation, index, event.seed);
    const along = (age - event.duration / 2) * event.speed - offset.behind;
    target.x = event.x + Math.sin(event.heading) * along + Math.cos(event.heading) * offset.across;
    target.z = event.z - Math.cos(event.heading) * along + Math.sin(event.heading) * offset.across;
    target.heading = event.heading;
    target.bank = Math.sin(age * 0.7 + index * 1.3) * 0.045;
  }
  target.y =
    event.altitude +
    Math.sin(age * 0.8 + index * 1.7) * 0.35 +
    (event.formation === 'v' ? Math.ceil(index / 2) * 0.15 : 0);
  return target;
}

export function createBirdEncounters(locationId, { random = Math.random } = {}) {
  const location = getLocation(locationId),
    slots = [
      { event: null, due: 0, intro: 'eagle' },
      { event: null, due: 0, intro: 'gull' },
    ];
  let previous = null,
    speciesBag = [];
  const pickSpecies = () => {
    if (!speciesBag.length) {
      speciesBag = [...BIRD_SPECIES];
      for (let i = speciesBag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [speciesBag[i], speciesBag[j]] = [speciesBag[j], speciesBag[i]];
      }
    }
    return speciesBag.pop();
  };
  function spawn(slot, state, time) {
    const species = slot.intro
      ? BIRD_SPECIES.find((bird) => bird.id === slot.intro)
      : pickSpecies();
    const formation = slot.intro
      ? slot.intro === 'eagle'
        ? 'soaring'
        : 'loose'
      : species.formations[Math.floor(random() * species.formations.length)];
    const count =
      formation === 'soaring'
        ? 1
        : formation === 'pair'
          ? 2
          : formation === 'v'
            ? 9
            : 10 + Math.floor(random() * 3);
    for (let attempt = 0; attempt < 8; attempt++) {
      const bearing = (state.heading * Math.PI) / 180 + (random() - 0.5) * 1.8;
      const distance = 55 + random() * 55;
      const event = {
        species: species.id,
        formation,
        count,
        start: time,
        duration: formation === 'soaring' ? 44 : 36 + random() * 8,
        x: state.x + Math.sin(bearing) * distance,
        z: state.z - Math.cos(bearing) * distance,
        heading: bearing + (random() < 0.5 ? -1 : 1) * (1.1 + random() * 0.8),
        speed: species.speed,
        radius: 26 + random() * 14,
        altitude: 0,
        seed: random() * TAU,
      };
      let terrain = 0;
      const sample = {};
      // Check the full corridor once at spawn, including room for wings, the
      // flock's width, trees and coastal towers. No terrain queries per frame.
      for (let age = 0; age <= event.duration; age += 2) {
        sampleBirdFlight(event, 0, time + age, sample);
        for (const island of location.islands)
          for (const dx of [-20, 0, 20])
            for (const dz of [-20, 0, 20])
              terrain = Math.max(terrain, islandHeight(sample.x + dx, sample.z + dz, island));
      }
      const base =
        formation === 'soaring' ? 32 : species.id === 'tern' ? 11 : formation === 'v' ? 25 : 18;
      event.altitude = Math.max(base + random() * 6, terrain > 0 ? terrain + 30 : 0);
      if (event.altitude > (species.id === 'eagle' ? 160 : 85)) continue;
      slot.intro = null;
      return event;
    }
    return null;
  }
  return {
    slots,
    update(state, time) {
      if (
        !previous ||
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        Math.hypot(state.x - previous.x, state.z - previous.z) > 250
      ) {
        slots.forEach((slot, index) => {
          slot.event = null;
          slot.intro = index ? 'gull' : 'eagle';
          slot.due = time + (index ? 13 : 4) + random() * 6;
        });
        speciesBag = [];
      }
      if (!previous || time !== previous.time)
        for (const slot of slots) {
          if (slot.event && time - slot.event.start >= slot.event.duration) {
            slot.event = null;
            slot.due = time + 14 + random() * 28;
          }
          if (!slot.event && time >= slot.due) {
            slot.event = spawn(slot, state, time);
            if (!slot.event) slot.due = time + 8 + random() * 8;
          }
        }
      previous = { x: state.x, z: state.z, elapsed: state.elapsed, time };
      return slots;
    },
  };
}
