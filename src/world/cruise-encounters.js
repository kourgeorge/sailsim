import { depthAt } from '../water-depth.js';
import { encounterPoint } from './encounter-view.js';
import { createRigidBody } from '../collisions.js';

export const CRUISE_LENGTH = 170;
export const CRUISE_BEAM = 28;

// Use the same rounded bow and stern for the visible hull and contact solver.
export function cruiseHullShape() {
  const starboard = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10,
      u = 1 - t;
    starboard.push([
      33 * u * u * t + 42 * u * t * t + 14 * t * t * t,
      -89 * u * u * u - 228 * u * u * t - 174 * u * t * t - 40 * t * t * t,
    ]);
  }
  starboard.push([14, 71]);
  for (let i = 1; i <= 10; i++) {
    const t = i / 10,
      u = 1 - t;
    starboard.push([14 * u * u + 28 * u * t + 7 * t * t, 71 * u * u + 162 * u * t + 81 * t * t]);
  }
  return {
    type: 'hull',
    length: CRUISE_LENGTH,
    beam: CRUISE_BEAM,
    vertices: [
      ...starboard,
      ...starboard
        .slice(1)
        .reverse()
        .map(([x, z]) => [-x, z]),
    ],
  };
}

export function createCruiseBody(event, locationId) {
  return createRigidBody({
    id: `${locationId}:cruise:0`,
    kind: 'free',
    x: event.x,
    z: event.z,
    heading: (event.heading * 180) / Math.PI,
    vx: event.vx,
    vz: event.vz,
    mass: 40000000,
    shape: cruiseHullShape(),
    restitution: 0.015,
    friction: 0.3,
    // The powered ship maintains its passage speed; contacts still exchange momentum.
    linearDamping: 0,
    angularDamping: 0.3,
    visual: { type: 'cruise' },
  });
}

// A distant sightseeing passage. Routes are fixed when selected and checked
// for the complete ship footprint; there is never more than one cruise ship.
export function createCruiseEncounters(locationId, { random = Math.random } = {}) {
  let event = null,
    due = 0,
    previous = null,
    bodies = null;
  function clear(state) {
    if (event)
      for (const world of new Set([bodies, state?.worldBodies])) {
        const index = world?.findIndex((body) => body.id === event.body.id) ?? -1;
        if (index >= 0) world.splice(index, 1);
      }
    event = null;
    bodies = null;
  }
  function spawn(state, time, view) {
    for (let attempt = 0; attempt < 36; attempt++) {
      const center = encounterPoint(state, view, random, 150, 480, 22);
      if (!center) continue;
      const heading =
        attempt % 3 === 0
          ? random() * Math.PI * 2
          : (random() < 0.5 ? 0 : Math.PI) + (random() - 0.5) * 0.2;
      const length = 1300,
        duration = length / 4.6,
        vx = Math.sin(heading) * 4.6,
        vz = -Math.cos(heading) * 4.6;
      const candidate = {
        x: center.x - (vx * duration) / 2,
        z: center.z - (vz * duration) / 2,
        vx,
        vz,
        heading,
        duration,
        start: time,
        age: 0,
        decks: 5 + Math.floor(random() * 6),
      };
      let clear = true;
      for (
        let distance = -length / 2 - CRUISE_LENGTH / 2;
        distance <= length / 2 + CRUISE_LENGTH / 2;
        distance += 16
      ) {
        const x = center.x + Math.sin(heading) * distance,
          z = center.z - Math.cos(heading) * distance;
        if (Math.hypot(x - state.x, z - state.z) < 145) {
          clear = false;
          break;
        }
        for (const side of [-26, 0, 26]) {
          const px = x + Math.cos(heading) * side,
            pz = z + Math.sin(heading) * side;
          if (depthAt(px, pz, locationId) < 8) {
            clear = false;
            break;
          }
        }
        if (
          (state.worldBodies || []).some(
            (body) => body.visual?.type !== 'rock' && Math.hypot(body.x - x, body.z - z) < 50,
          )
        )
          clear = false;
        if (!clear) break;
      }
      if (clear) return { ...candidate, body: createCruiseBody(candidate, locationId) };
    }
    return null;
  }
  return {
    get event() {
      return event;
    },
    update(state, time, view, enabled = false) {
      const reset =
        !previous ||
        (bodies && (bodies !== state.worldBodies || !bodies.includes(event.body))) ||
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        Math.hypot(state.x - previous.x, state.z - previous.z) > 250;
      if (reset || enabled !== previous.enabled) {
        clear(state);
        due = time + 55 + random() * 75;
      } else if (enabled && time !== previous.time) {
        if (event) {
          // Physics advances the ship, including contact response. Rendering only
          // tracks the encounter lifetime and must never overwrite its solved pose.
          const dt = Math.max(0, time - previous.time);
          event.age = Math.min(event.duration, event.age + dt);
          if (event.age >= event.duration) {
            clear(state);
            due = time + 220 + random() * 220;
          }
        }
        if (!event && time >= due) {
          event = spawn(state, time, view);
          if (event) {
            bodies = state.worldBodies ??= [];
            bodies.push(event.body);
          } else due = time + 25;
        }
      }
      previous = { x: state.x, z: state.z, time, elapsed: state.elapsed, enabled };
      return event;
    },
    dispose() {
      clear();
      previous = null;
    },
  };
}
