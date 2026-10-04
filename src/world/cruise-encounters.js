import { depthAt } from '../water-depth.js';
import { encounterPoint } from './encounter-view.js';

export const CRUISE_LENGTH = 170;
export const CRUISE_BEAM = 28;

// A distant sightseeing passage. Routes are fixed when selected and checked
// for the complete ship footprint; there is never more than one cruise ship.
export function createCruiseEncounters(locationId, { random = Math.random } = {}) {
  let event = null,
    due = 0,
    previous = null;
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
      if (clear) return candidate;
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
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        Math.hypot(state.x - previous.x, state.z - previous.z) > 250;
      if (reset || enabled !== previous.enabled) {
        event = null;
        due = time + 55 + random() * 75;
      } else if (enabled && time !== previous.time) {
        if (event) {
          const dt = Math.max(0, time - previous.time),
            age = Math.min(event.duration, event.age + dt);
          const x = event.x + event.vx * age,
            z = event.z + event.vz * age;
          // Give an approaching sailor room. No unpredictable turns across them.
          if (Math.hypot(x - state.x, z - state.z) > 130) event.age = age;
          if (event.age >= event.duration) {
            event = null;
            due = time + 220 + random() * 220;
          }
        }
        if (!event && time >= due) {
          event = spawn(state, time, view);
          if (!event) due = time + 25;
        }
      }
      previous = { x: state.x, z: state.z, time, elapsed: state.elapsed, enabled };
      return event;
    },
  };
}
