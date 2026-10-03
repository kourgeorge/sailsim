import { depthAt } from '../water-depth.js';

const TAU = Math.PI * 2;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Cosmetic encounters have their own random source and clock. They never
// modify navigation, physics or the training state, and stop when time stops.
export function createMarineEncounters(locationId, { random = Math.random } = {}) {
  const slots = [
    { kind: 'dolphin', event: null, due: 0 },
    { kind: 'fish', event: null, due: 0 },
  ];
  let previous = null;
  function schedule(slot, time, first = false) {
    slot.due =
      time +
      (first
        ? 8 + random() * 14
        : slot.kind === 'dolphin'
          ? 35 + random() * 55
          : 16 + random() * 34);
  }
  function spawn(slot, state, time) {
    const dolphin = slot.kind === 'dolphin',
      duration = dolphin ? 16 : 7;
    for (let attempt = 0; attempt < 12; attempt++) {
      const bearing =
        (state.heading * Math.PI) / 180 + (random() < 0.5 ? -1 : 1) * (0.55 + random() * 1.05);
      const range = dolphin ? 24 + random() * 34 : 15 + random() * 28;
      const x = state.x + Math.sin(bearing) * range,
        z = state.z - Math.cos(bearing) * range;
      const heading = bearing + (random() - 0.5) * 1.7,
        speed = dolphin ? 2.4 : 1.3;
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
    update(state, time) {
      if (
        !previous ||
        time < previous.time ||
        state.elapsed < previous.elapsed ||
        distance(state, previous) > 250
      ) {
        for (const slot of slots) {
          slot.event = null;
          schedule(slot, time, true);
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
            slot.event = spawn(slot, state, time);
            if (!slot.event) slot.due = time + 8 + random() * 12;
          }
        }
      previous = { x: state.x, z: state.z, elapsed: state.elapsed, time };
      return slots;
    },
  };
}
