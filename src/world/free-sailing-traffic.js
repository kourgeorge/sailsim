import { createRigidBody } from '../collisions.js';
import { getLocation } from '../locations.js';
import { depthAt } from '../water-depth.js';
import { yachtHullShape } from './bodies.js';
import { getVessel, catamaranHullShape, vesselYawInertia } from '../vessels.js';

const RAD = Math.PI / 180;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// A small permanent fleet, rather than vessels popping into view near the camera.
// Each cruising circuit and its turning room are checked against charted depths.
export function addFreeSailingTraffic(state) {
  if (state.worldBodies.some((body) => body.traffic)) return;
  const location = getLocation(state.locationId);
  const sites = [];
  for (const distance of [160, 360, 610, 880, 1200]) {
    for (const side of [-1, 1]) {
      const center = { x: location.start.x + side * 140, z: location.start.z - distance };
      const route = Array.from({ length: 32 }, (_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        return { x: center.x + Math.cos(angle) * 48, z: center.z + Math.sin(angle) * 72 };
      });
      const clear = route.every((point) =>
        [-14, 0, 14].every((dx) =>
          [-14, 0, 14].every((dz) => depthAt(point.x + dx, point.z + dz, location.id) > 4),
        ),
      );
      if (
        !clear ||
        state.worldBodies.some(
          (body) =>
            body.visual?.type !== 'rock' &&
            route.some((p) => Math.hypot(p.x - body.x, p.z - body.z) < 32),
        )
      )
        continue;
      sites.push({ center, route });
      if (sites.length === 4) break;
    }
    if (sites.length === 4) break;
  }
  for (const [index, { center, route }] of sites.entries()) {
    const vessel = getVessel(index % 2 ? 'catamaran' : 'monohull');
    const anchored = index === 3;
    const point = anchored ? center : route[0];
    const heading = anchored ? location.conditions.windDirection : 180;
    state.worldBodies.push(
      createRigidBody({
        id: `${location.id}:traffic:${index}`,
        kind: anchored ? 'moored' : 'free',
        x: point.x,
        z: point.z,
        heading,
        mass: vessel.mass,
        inertia: vesselYawInertia(vessel),
        shape: vessel.type === 'catamaran' ? catamaranHullShape() : yachtHullShape(),
        linearDamping: anchored ? 0.08 : 0.025,
        angularDamping: 0.35,
        ...(anchored
          ? { mooring: { ...point, slack: 3, stiffness: 1100, damping: 1800, maxRadius: 9 } }
          : {}),
        visual: {
          type: 'yacht',
          vesselId: vessel.id,
          scale: 1,
          index,
          traffic: true,
          sailing: !anchored && index !== 1,
        },
        traffic: {
          route: anchored ? null : route,
          waypoint: 1,
          speed: 0.9 + index * 0.15,
          draft: vessel.draft,
        },
      }),
    );
  }
}

// Apply modest propulsion/steering forces. The contact solver owns positions,
// momentum and yaw, including after a collision; navigation never snaps a hull.
export function advanceFreeSailingTraffic(state, dt) {
  for (const body of state.worldBodies) {
    const navigation = body.traffic;
    if (!navigation?.route || body.grounded) continue;
    if (body.lastImpact && state.elapsed - body.lastImpact.time < 5) continue;
    let target = navigation.route[navigation.waypoint];
    if (Math.hypot(target.x - body.x, target.z - body.z) < 18) {
      navigation.waypoint = (navigation.waypoint + 1) % navigation.route.length;
      target = navigation.route[navigation.waypoint];
    }
    const desired = Math.atan2(target.x - body.x, body.z - target.z) / RAD;
    const error = ((desired - body.heading + 540) % 360) - 180;
    body.yawRate += clamp(error * 0.035 - body.yawRate * 0.8, -1.2, 1.2) * dt;
    body.yawRate = clamp(body.yawRate, -4, 4);
    const heading = body.heading * RAD;
    const safe =
      depthAt(body.x + Math.sin(heading) * 22, body.z - Math.cos(heading) * 22, state.locationId) >
      navigation.draft + 2;
    const close = state.worldBodies.some(
      (other) =>
        other !== body &&
        other.visual?.type !== 'rock' &&
        Math.hypot(other.x - body.x, other.z - body.z) < 22,
    );
    const nearPlayer = Math.hypot(state.x - body.x, state.z - body.z) < 20;
    const speed =
      safe && !close && !nearPlayer
        ? navigation.speed * Math.max(0.25, 1 - Math.abs(error) / 150)
        : 0;
    body.vx += clamp((Math.sin(heading) * speed - body.vx) * 0.25, -0.12, 0.12) * dt;
    body.vz += clamp((-Math.cos(heading) * speed - body.vz) * 0.25, -0.12, 0.12) * dt;
  }
}
