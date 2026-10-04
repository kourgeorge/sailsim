import { depthAt } from '../water-depth.js';
import { encounterPoint } from './encounter-view.js';
import { wildlifeRates, weightedWildlife, wildlifeDelay } from './wildlife-probability.js';

const TAU = Math.PI * 2;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const CLOSE_CHANCE = { fish: 0.14, dolphin: 0.2, turtle: 0.04 };
const MINIMUM_GAP = { fish: 30, dolphin: 120, turtle: 240 };

// Cosmetic encounters have their own random source and clock. They never
// modify navigation, physics or the training state, and stop when time stops.
export function createMarineEncounters(locationId, { random = Math.random } = {}) {
  const rates = wildlifeRates(locationId).marine;
  const slots = [
    { kind: 'dolphin', event: null, due: 0 },
    { kind: 'fish', event: null, due: 0 },
    { kind: 'turtle', event: null, due: 0 },
  ];
  let previous = null;
  function schedule(slot, time) {
    slot.due = time + wildlifeDelay(rates[slot.kind], random, MINIMUM_GAP[slot.kind]);
  }
  function spawn(slot, state, time, view, forced = false) {
    const dolphin = slot.kind === 'dolphin',
      turtle = slot.kind === 'turtle',
      duration = dolphin ? 16 : turtle ? 22 : 7;
    const close = forced || random() < CLOSE_CHANCE[slot.kind];
    for (let attempt = 0; attempt < 12; attempt++) {
      const range = dolphin ? 24 + random() * 34 : 15 + random() * 28;
      const point = encounterPoint(
        state,
        view,
        random,
        forced ? 15 : close ? 17 : range,
        forced ? 24 : close ? 30 : range + 18,
      );
      if (!point) continue;
      const { x, z } = point;
      const heading = Math.atan2(x - state.x, state.z - z) + (random() - 0.5) * 1.7,
        speed = dolphin ? 2.4 : turtle ? 0.48 : 1.3;
      const vx = Math.sin(heading) * speed,
        vz = -Math.cos(heading) * speed;
      const fixtures = (state.worldBodies || []).filter((body) =>
        ['pier', 'yacht', 'buoy', 'rock'].includes(body.visual?.type),
      );
      let clear = true;
      // Validate the complete swim path and the width of the pod/shoal.
      for (let t = 0; t <= duration; t += 2) {
        const point = { x: x + vx * t, z: z + vz * t };
        if (
          distance(point, state) < 13 ||
          fixtures.some(
            (body) =>
              distance(point, body) < 8 + (body.shape.length || body.shape.radius || 2) * 0.55,
          )
        ) {
          clear = false;
          break;
        }
        for (const dx of [-5, 0, 5])
          for (const dz of [-5, 0, 5]) {
            if (depthAt(point.x + dx, point.z + dz, locationId) < (dolphin ? 4 : 2.5))
              clear = false;
          }
        if (!clear) break;
      }
      if (clear)
        return {
          kind: slot.kind,
          close,
          x,
          z,
          heading,
          vx,
          vz,
          start: time,
          duration,
          seed: random() * TAU,
        };
    }
    return null;
  }
  return {
    slots,
    summon(state, time, view) {
      const kind = weightedWildlife(rates, random);
      const slot = slots.find((slot) => slot.kind === kind);
      const event = spawn(slot, state, time, view, true);
      if (event) {
        event.secret = true;
        event.start = time - (slot.kind === 'fish' ? 0.55 : 1.2);
        slot.event = event;
      }
      return Boolean(event);
    },
    update(state, time, view) {
      if (
        !previous ||
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        distance(state, previous) > 250
      ) {
        for (const slot of slots) {
          slot.event = null;
          schedule(slot, time);
        }
      }
      // Repainting a paused camera must not reschedule or create new sightings.
      if (!previous || time !== previous.time)
        for (const slot of slots) {
          if (slot.event && time - slot.event.start > slot.event.duration) {
            slot.event = null;
            schedule(slot, time);
          }
          if (!slot.event && time >= slot.due) {
            slot.event = spawn(slot, state, time, view);
            if (!slot.event) schedule(slot, time);
          }
        }
      previous = { x: state.x, z: state.z, elapsed: state.elapsed, time };
      return slots;
    },
  };
}
