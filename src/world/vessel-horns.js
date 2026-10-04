import { groundVelocity } from '../physics.js';

const hash = (text) =>
  [...text].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 7);

// Warnings are driven by closing motion and collision evidence. Greetings are
// infrequent, nearby, and never stand in for navigation or right-of-way signals.
export function createVesselHorns() {
  let world,
    nextSound = 0,
    nextWarning = 0;
  const vessels = new Map();
  return {
    update(state, enabled) {
      if (!enabled) return null;
      const time = state.elapsed || 0;
      if (world !== state.worldBodies) {
        world = state.worldBodies;
        vessels.clear();
        nextSound = time + 4;
        nextWarning = time + 4;
      }
      const heading = (state.heading * Math.PI) / 180;
      const { x: vx, z: vz } = groundVelocity(state);
      const present = new Set();
      const candidates = [];
      for (const body of world || []) {
        if (!['yacht', 'cruise'].includes(body.visual?.type)) continue;
        present.add(body.id);
        const ship = body.visual.type === 'cruise';
        if (!vessels.has(body.id))
          vessels.set(body.id, { warning: -Infinity, greeting: time + 25 + (hash(body.id) % 55) });
        const record = vessels.get(body.id);
        const dx = body.x - state.x,
          dz = body.z - state.z,
          distance = Math.hypot(dx, dz);
        const rvx = body.vx - vx,
          rvz = body.vz - vz,
          squareSpeed = rvx * rvx + rvz * rvz;
        const approach = squareSpeed > 0.04 ? -(dx * rvx + dz * rvz) / squareSpeed : -1;
        const closest = Math.hypot(dx + rvx * approach, dz + rvz * approach);
        const collision = state.collision?.bodyId === body.id && time - state.collision.time < 2;
        const warning =
          collision ||
          (approach > 0 &&
            approach < 16 &&
            closest < (ship ? 100 : 15) &&
            distance < (ship ? 200 : 65));
        if (warning && time - record.warning > 35)
          candidates.unshift({ body, record, ship, distance, dx, dz, signal: 'warning' });
        else if (!warning && time >= record.greeting) {
          record.greeting = time + 130 + (hash(body.id) % 90);
          if (distance > (ship ? 140 : 35) && distance < (ship ? 420 : 180))
            candidates.push({ body, record, ship, distance, dx, dz, signal: 'greeting' });
        }
      }
      for (const id of vessels.keys()) if (!present.has(id)) vessels.delete(id);
      if (!candidates.length) return null;
      const { body, record, ship, distance, dx, dz, signal } = candidates[0];
      if (time < (signal === 'warning' ? nextWarning : nextSound)) return null;
      nextSound = time + (signal === 'warning' ? 10 : 18);
      nextWarning = time + (signal === 'warning' ? 10 : 2);
      if (signal === 'warning') {
        record.warning = time;
        record.greeting = time + 130 + (hash(body.id) % 90);
      }
      return {
        vesselId: body.id,
        voice: ship ? 'ship' : 'boat',
        signal,
        gain: Math.min(1, (ship ? 110 : 28) / Math.max(1, distance)),
        pan: Math.max(
          -0.8,
          Math.min(0.8, (dx * Math.cos(heading) + dz * Math.sin(heading)) / Math.max(1, distance)),
        ),
      };
    },
  };
}
