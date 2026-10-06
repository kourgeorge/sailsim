import { getLocation } from '../locations.js';
import { islandHeight, shoreScale } from '../rendering/geography.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from './coastal-features.js';
import { inEncounterView } from './encounter-view.js';
import { wildlifeRates, weightedWildlife, wildlifeDelay } from './wildlife-probability.js';

const TAU = Math.PI * 2;
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};

export const LAND_SPECIES = Object.freeze(
  [
    { id: 'deer', name: 'Deer', range: 240, solo: 0.28, maxGroup: 5, radius: 1.05, slope: 0.42 },
    { id: 'goat', name: 'Goats', range: 220, solo: 0.25, maxGroup: 6, radius: 0.8, slope: 0.65 },
    { id: 'fox', name: 'Foxes', range: 110, solo: 0.8, maxGroup: 2, radius: 0.7, slope: 0.42 },
    { id: 'rabbit', name: 'Rabbits', range: 75, solo: 0.4, maxGroup: 6, radius: 0.4, slope: 0.3 },
    {
      id: 'boar',
      name: 'Wild boar',
      range: 140,
      solo: 0.35,
      maxGroup: 5,
      radius: 0.95,
      slope: 0.38,
    },
  ].map(Object.freeze),
);
export const MAX_LAND_ANIMALS = 12;
export function landAnimalLimit(quality) {
  return ['minimum', 'compatibility'].includes(quality.name)
    ? 6
    : quality.name === 'low'
      ? 8
      : MAX_LAND_ANIMALS;
}

// Short walks separated by grazing/resting. Sampling is deterministic and has
// no terrain queries or random draws in the animation loop.
export function sampleLandAnimal(event, index, time, target = {}) {
  const member = event.members[index],
    age = Math.max(0, Math.min(event.duration, time - event.start));
  const clock = age + member.phase,
    cycle = Math.floor(clock / member.period);
  const fraction = (clock % member.period) / member.walkTime;
  const initial =
    Math.floor(member.phase / member.period) +
    smooth((member.phase % member.period) / member.walkTime);
  const steps = cycle + smooth(fraction) - initial;
  const progress = clamp(steps / member.steps),
    segment = progress * (member.path.length - 1);
  const k = Math.min(member.path.length - 2, Math.floor(segment)),
    blend = segment - k;
  const a = member.path[k],
    b = member.path[k + 1];
  for (const key of ['x', 'y', 'z', 'dx', 'dz']) target[key] = a[key] + (b[key] - a[key]) * blend;
  target.heading = member.heading;
  target.scale = member.scale;
  target.walk = fraction < 1 ? Math.sin(Math.PI * fraction) : 0;
  target.stride = steps * TAU * (event.species === 'rabbit' ? 2 : 1.6);
  target.graze = (1 - target.walk) * (0.45 + 0.35 * Math.sin(clock * 0.28));
  target.fade = smooth(age / 3) * smooth((event.duration - age) / 5);
  return target;
}

export function createLandEncounters(locationId, { random = Math.random, obstacles = [] } = {}) {
  const location = getLocation(locationId),
    features = getCoastalFeatures(location.id);
  const rates = wildlifeRates(location.id).land,
    slots = [
      { event: null, due: 0 },
      { event: null, due: 0 },
    ];
  const slotRate = Object.values(rates).reduce((sum, rate) => sum + rate, 0) / slots.length;
  const height = (x, z) =>
    Math.max(...location.islands.map((island) => islandHeight(x, z, island)));
  const obstacleCells = new Map();
  for (const obstacle of obstacles) {
    const radius = obstacle.radius + 1.1;
    for (
      let x = Math.floor((obstacle.x - radius) / 12);
      x <= Math.floor((obstacle.x + radius) / 12);
      x++
    )
      for (
        let z = Math.floor((obstacle.z - radius) / 12);
        z <= Math.floor((obstacle.z + radius) / 12);
        z++
      ) {
        const key = `${x}:${z}`;
        if (!obstacleCells.has(key)) obstacleCells.set(key, []);
        obstacleCells.get(key).push(obstacle);
      }
  }
  const clear = (x, z, radius) =>
    clearOfCoastalBuildings(x, z, features) &&
    (!location.lighthouse ||
      Math.hypot(x - location.lighthouse.x, z - location.lighthouse.z) > 13 + radius) &&
    (obstacleCells.get(`${Math.floor(x / 12)}:${Math.floor(z / 12)}`) || []).every(
      (obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z) > obstacle.radius + radius,
    );
  const sites = [];
  function addSite(x, z, heading) {
    const y = height(x, z);
    if (y <= 1.7 || y >= 32) return;
    const dx = height(x + 1, z) - y,
      dz = height(x, z + 1) - y,
      slope = Math.hypot(dx, dz);
    if (slope < 0.65 && clear(x, z, 1))
      sites.push({ x, y, z, slope, heading: heading ?? Math.atan2(dz, dx) });
  }
  // Candidate meadows follow the actual coastline. Expensive footprint checks
  // happen only when an encounter is due, never on each rendered frame.
  for (const island of slotRate > 0 ? location.islands : []) {
    if (island.raster) {
      // A survey covers many separate islands; its bounding ellipse is not a
      // coastline. Sample its low ground and interpolate coastal contours so
      // narrow shore meadows between widely spaced grid nodes are included.
      const r = island.raster,
        stepX = r.width / (r.cols - 1),
        stepZ = r.length / (r.rows - 1);
      for (let row = 0; row < r.rows; row++)
        for (let col = 0; col < r.cols; col++) {
          const x = island.x - r.width / 2 + col * stepX,
            z = island.z - r.length / 2 + row * stepZ,
            y = islandHeight(x, z, island);
          if (y > 1.7 && y < 32) addSite(x, z);
          for (const [ox, oz] of [
            [col < r.cols - 1 ? stepX : 0, 0],
            [0, row < r.rows - 1 ? stepZ : 0],
          ]) {
            if (!ox && !oz) continue;
            const next = islandHeight(x + ox, z + oz, island);
            if ((y < 4 && next >= 4) || (next < 4 && y >= 4)) {
              const t = (4 - y) / (next - y);
              addSite(x + ox * t, z + oz * t);
            }
          }
        }
      continue;
    }
    for (let i = 0; i < 192; i++) {
      const angle = (i / 192) * TAU;
      for (const radius of [0.86, 0.89, 0.92, 0.95, 0.97]) {
        const r = radius * shoreScale(angle),
          x = island.x + Math.cos(angle) * island.rx * r;
        const z = island.z + Math.sin(angle) * island.rz * r;
        addSite(x, z, Math.atan2(-Math.sin(angle) * island.rx, -Math.cos(angle) * island.rz));
      }
    }
  }
  function schedule(slot, time, phase = 'repeat') {
    const delay =
      slotRate <= 0
        ? Infinity
        : phase === 'initial'
          ? 6 + random() * 8
          : phase === 'retry'
            ? 5 + random() * 7
            : Math.min(90, wildlifeDelay(slotRate * 3, random, 12));
    slot.due = time + delay;
  }
  function spawn(state, time, view) {
    const visible = sites.filter(
      (site) =>
        Math.hypot(site.x - state.x, site.z - state.z) < 240 && inEncounterView(site, view, 1.05),
    );
    const eligible = new Map(),
      weights = {};
    for (const species of LAND_SPECIES) {
      if (!(rates[species.id] > 0)) continue;
      const nearby = visible.filter(
        (site) =>
          site.slope < species.slope &&
          Math.hypot(site.x - state.x, site.z - state.z) < species.range,
      );
      if (nearby.length) {
        eligible.set(species.id, nearby);
        weights[species.id] = rates[species.id];
      }
    }
    const id = weightedWildlife(weights, random);
    if (!id) return null;
    const species = LAND_SPECIES.find((animal) => animal.id === id),
      nearby = eligible.get(id);
    const count = random() < species.solo ? 1 : 2 + Math.floor(random() * (species.maxGroup - 1));
    const duration = 70 + random() * 40;
    for (let attempt = 0; attempt < 12; attempt++) {
      const site = nearby[Math.floor(random() * nearby.length)];
      // Keep separate groups out of one another's small foraging patch.
      if (slots.some(({ event }) => event && Math.hypot(event.x - site.x, event.z - site.z) < 22))
        continue;
      const heading = site.heading + (random() < 0.5 ? 0 : Math.PI),
        members = [];
      for (let i = 0; i < count; i++) {
        const ring = i === 0 ? 0 : 3.7 + random() * 0.5,
          angle = ((i - 1) / 5) * TAU;
        const x = site.x + Math.cos(angle) * ring,
          z = site.z + Math.sin(angle) * ring;
        const travel = 4 + random() * 3,
          direction = heading + (random() - 0.5) * 0.28;
        const path = [];
        for (let j = 0; j <= 20; j++) {
          const px = x + (Math.sin(direction) * travel * j) / 20,
            pz = z - (Math.cos(direction) * travel * j) / 20;
          const y = height(px, pz),
            dx = height(px + 0.5, pz) - height(px - 0.5, pz);
          const dz = height(px, pz + 0.5) - height(px, pz - 0.5);
          let valid =
            y < 35 && Math.hypot(dx, dz) <= species.slope && clear(px, pz, species.radius);
          for (const ox of [-species.radius, 0, species.radius])
            for (const oz of [-species.radius, 0, species.radius])
              if (height(px + ox, pz + oz) < 1.5 || !clear(px + ox, pz + oz, 0)) valid = false;
          if (!valid) break;
          path.push({ x: px, y: y + 0.035, z: pz, dx, dz });
        }
        if (path.length !== 21) break;
        const period = 17 + random() * 7,
          walkTime = 4 + random() * 2,
          phase = random() * period;
        const end = duration + phase;
        const steps =
          Math.floor(end / period) +
          smooth((end % period) / walkTime) -
          (Math.floor(phase / period) + smooth((phase % period) / walkTime));
        members.push({
          path,
          heading: direction,
          period,
          walkTime,
          phase,
          steps,
          scale: 0.82 + random() * 0.22,
        });
      }
      if (members.length === count) {
        const event = {
          species: species.id,
          count,
          x: site.x,
          z: site.z,
          start: time,
          duration,
          members,
        };
        let separated = true;
        for (let age = 0; age <= duration && separated; age += 1) {
          const poses = members.map((_, i) => sampleLandAnimal(event, i, time + age));
          for (let i = 0; i < count; i++)
            for (let j = i + 1; j < count; j++)
              if (
                Math.hypot(poses[i].x - poses[j].x, poses[i].z - poses[j].z) <
                species.radius * 2 + 0.3
              )
                separated = false;
        }
        if (separated) return event;
      }
    }
    return null;
  }
  let previous = null;
  return {
    slots,
    update(state, time, view) {
      if (
        !previous ||
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        Math.hypot(state.x - previous.x, state.z - previous.z) > 250
      ) {
        for (const slot of slots) {
          slot.event = null;
          schedule(slot, time, 'initial');
        }
      }
      if (!previous || time !== previous.time)
        for (const slot of slots) {
          if (slot.event && time - slot.event.start >= slot.event.duration) {
            slot.event = null;
            schedule(slot, time);
          }
          if (!slot.event && time >= slot.due) {
            slot.event = spawn(state, time, view);
            if (!slot.event) schedule(slot, time, 'retry');
          }
        }
      previous = { x: state.x, z: state.z, elapsed: state.elapsed, time };
      return slots;
    },
  };
}
