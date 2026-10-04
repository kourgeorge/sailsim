import { getLocation } from '../locations.js';
import { islandHeight, shoreScale } from '../rendering/geography.js';
import { encounterPoint, inEncounterView } from './encounter-view.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from './coastal-features.js';
import { wildlifeRates, weightedWildlife, wildlifeDelay } from './wildlife-probability.js';

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
    formationWeights: { soaring: 90, pair: 10 },
    closeChance: 0.015,
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
    formationWeights: { soaring: 20, pair: 30, loose: 50 },
    closeChance: 0.14,
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
    formationWeights: { pair: 20, v: 25, loose: 55 },
    closeChance: 0.04,
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
    formationWeights: { pair: 30, loose: 70 },
    closeChance: 0.1,
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
  target.perched = 0;
  if (event.landing) {
    const landing = event.landing;
    const progress =
      age < 12 ? smooth(0, 12, age) : age < 27 ? 1 : 1 - smooth(27, event.duration, age);
    const segment = progress * (landing.heights.length - 1);
    const i = Math.min(landing.heights.length - 2, Math.floor(segment));
    target.x = landing.fromX + (landing.x - landing.fromX) * progress;
    target.z = landing.fromZ + (landing.z - landing.fromZ) * progress;
    target.y = landing.heights[i] + (landing.heights[i + 1] - landing.heights[i]) * (segment - i);
    target.heading = landing.heading + Math.PI * smooth(26, 28, age);
    target.bank = 0;
    target.perched = smooth(10.8, 12, age) * (1 - smooth(27, 28.2, age));
    return target;
  }
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
    rates = wildlifeRates(locationId).birds,
    slots = [
      { event: null, due: 0 },
      { event: null, due: 0 },
    ];
  const slotRate = Object.values(rates).reduce((sum, rate) => sum + rate, 0) / slots.length;
  const clearings = getCoastalFeatures(locationId),
    landingSites = [];
  // Sparse coastal meadow sites, below the tree line's first plantings. Check
  // the terrain once; flying birds never query terrain in the render loop.
  for (const island of location.islands)
    for (let i = 0; i < 96; i++) {
      const angle = (i / 96) * TAU,
        r = 0.915 * shoreScale(angle);
      const x = island.x + Math.cos(angle) * island.rx * r;
      const z = island.z + Math.sin(angle) * island.rz * r;
      const y = islandHeight(x, z, island);
      if (y < 0.15 || y > 3.5 || !clearOfCoastalBuildings(x, z, clearings)) continue;
      const slope = Math.hypot(
        islandHeight(x + 1, z, island) - y,
        islandHeight(x, z + 1, island) - y,
      );
      if (slope > 0.3) continue;
      const fromX = x + Math.cos(angle) * 100,
        fromZ = z + Math.sin(angle) * 100;
      const heights = Array.from({ length: 65 }, (_, j) => {
        const t = j / 64,
          px = fromX + (x - fromX) * t,
          pz = fromZ + (z - fromZ) * t;
        const terrain = Math.max(0, ...location.islands.map((land) => islandHeight(px, pz, land)));
        return Math.max(y + (1 - t) * 14, terrain) + 0.23;
      });
      landingSites.push({
        x,
        y,
        z,
        fromX,
        fromZ,
        heights,
        heading: Math.atan2(x - fromX, fromZ - z),
      });
    }
  let previous = null;
  const pickSpecies = () => {
    const id = weightedWildlife(rates, random);
    return BIRD_SPECIES.find((bird) => bird.id === id);
  };
  function schedule(slot, time) {
    slot.due = time + wildlifeDelay(slotRate, random, 20);
  }
  function spawn(state, time, view) {
    const species = pickSpecies();
    const close = random() < species.closeChance;
    const landing =
      ['eagle', 'gull'].includes(species.id) && random() < 0.2
        ? landingSites.filter(
            (site) =>
              Math.hypot(site.x - state.x, site.z - state.z) < 360 &&
              inEncounterView(site, view, 1.1),
          )
        : [];
    if (landing.length) {
      return {
        species: species.id,
        formation: 'soaring',
        count: 1,
        start: time,
        duration: 40,
        seed: random() * TAU,
        landing: landing[Math.floor(random() * landing.length)],
      };
    }
    const formation = close
      ? species.id === 'eagle'
        ? 'soaring'
        : 'pair'
      : weightedWildlife(species.formationWeights, random);
    const count =
      formation === 'soaring'
        ? 1
        : formation === 'pair'
          ? 2
          : formation === 'v'
            ? 9
            : 10 + Math.floor(random() * 3);
    for (let attempt = 0; attempt < 8; attempt++) {
      const center = encounterPoint(
        state,
        view,
        random,
        close ? 22 : 55,
        close ? 40 : 110,
        close ? 12 : 25,
      );
      if (!center) continue;
      const bearing = Math.atan2(center.x - state.x, state.z - center.z);
      const event = {
        species: species.id,
        formation,
        count,
        start: time,
        duration: close ? 20 : formation === 'soaring' ? 44 : 36 + random() * 8,
        x: center.x,
        z: center.z,
        close,
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
      const base = close
        ? 10
        : formation === 'soaring'
          ? 32
          : species.id === 'tern'
            ? 11
            : formation === 'v'
              ? 25
              : 18;
      event.altitude = Math.max(base + random() * 6, terrain > 0 ? terrain + 30 : 0);
      if (
        close &&
        (event.altitude > 19 || !inEncounterView({ ...center, y: event.altitude }, view, 0.9))
      )
        continue;
      if (event.altitude > (species.id === 'eagle' ? 160 : 85)) continue;
      return event;
    }
    return null;
  }
  return {
    slots,
    summon(state, time, view) {
      const species = pickSpecies();
      const direction = view?.direction || { x: 0, y: 0, z: -1 },
        position = view?.position || { x: state.x, y: 10, z: state.z };
      const x = position.x + direction.x * 32,
        z = position.z + direction.z * 32;
      const terrain = Math.max(0, ...location.islands.map((island) => islandHeight(x, z, island)));
      slots[0].event = {
        species: species.id,
        formation: 'pair',
        count: 2,
        start: time - 12,
        duration: 24,
        x,
        z,
        heading: Math.atan2(direction.x, -direction.z) + Math.PI / 2,
        speed: 5,
        radius: 26,
        altitude: Math.max(terrain + 12, position.y + direction.y * 32),
        seed: random() * TAU,
        close: true,
      };
    },
    update(state, time, view) {
      if (
        !previous ||
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        Math.hypot(state.x - previous.x, state.z - previous.z) > 250
      ) {
        slots.forEach((slot) => {
          slot.event = null;
          schedule(slot, time);
        });
      }
      if (!previous || time !== previous.time)
        for (const slot of slots) {
          if (slot.event && time - slot.event.start >= slot.event.duration) {
            slot.event = null;
            schedule(slot, time);
          }
          if (!slot.event && time >= slot.due) {
            slot.event = spawn(state, time, view);
            if (!slot.event) schedule(slot, time);
          }
        }
      previous = { x: state.x, z: state.z, elapsed: state.elapsed, time };
      return slots;
    },
  };
}
