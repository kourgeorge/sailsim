import { CATAMARAN, vesselYawInertia } from './vessels.js';

const RHO = 1025,
  G = 9.81,
  RAD = Math.PI / 180;
const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
const vessel = CATAMARAN,
  halfSpacing = vessel.hullSpacing / 2;
const yawInertia = vesselYawInertia(vessel) * 1.25; // Hydrodynamic added inertia.
const rollInertia = vessel.mass * (halfSpacing ** 2 + 2.5) * 1.4;
const buoyancyStiffness = 2 * RHO * G * vessel.waterplaneArea * halfSpacing ** 2;
const initialStiffness = buoyancyStiffness - vessel.mass * G * vessel.centerOfGravity;
const rollDamping = 2 * 0.55 * Math.sqrt(rollInertia * initialStiffness);

// ITTC-1957 turbulent skin friction plus a smooth empirical slender-hull wave term.
// No monohull hull-speed limiter: resistance rises continuously with Froude number.
export function catamaranResistance(speed) {
  const u = Math.abs(speed);
  if (u < 1e-9) return 0;
  const reynolds = Math.max(1e5, (u * vessel.waterline) / 1.19e-6);
  const friction = 0.075 / (Math.log10(reynolds) - 2) ** 2;
  const froude = u / Math.sqrt(G * vessel.waterline);
  return (
    Math.sign(speed) *
    (25 * u + 0.5 * RHO * u * u * vessel.wettedArea * friction * 1.18 + 950 * (froude / 0.45) ** 4)
  );
}

// Buoyancy transfers between separated hulls until the windward hull unloads.
// Beyond that point the righting lever falls; beam stability is not unlimited.
export function catamaranRightingMoment(heelDegrees) {
  const angle = heelDegrees * RAD;
  const transfer = clamp(
    buoyancyStiffness * Math.sin(angle),
    -vessel.mass * G * halfSpacing,
    vessel.mass * G * halfSpacing,
  );
  return transfer * Math.cos(angle) - vessel.mass * G * vessel.centerOfGravity * Math.sin(angle);
}

export function advanceCatamaran(s, { u, main, jib, aw }, dt) {
  const omega = s.yawRate * RAD,
    delta = s.rudder * RAD;
  const q = 0.5 * vessel.airDensity * ((aw.speed * 1852) / 3600) ** 2;
  const wind = aw.angle * RAD;
  const windSide =
    -q *
    vessel.windage.lateral *
    vessel.windage.coefficient *
    Math.sin(wind) *
    Math.abs(Math.sin(wind));
  let surge =
    -q *
    vessel.windage.frontal *
    vessel.windage.coefficient *
    Math.cos(wind) *
    Math.abs(Math.cos(wind));
  const sailSide = s.capsized ? 0 : main.side + jib.side;
  let sway = sailSide + windSide,
    yaw = -sailSide * 0.35 - windSide * 0.1;
  if (!s.capsized) surge += (main.drive + jib.drive) * Math.max(0, Math.cos(s.heel * RAD));

  for (const side of [-1, 1]) {
    const x = side * halfSpacing,
      localU = u - omega * x;
    const throttle = s.capsized ? 0 : side < 0 ? s.portThrottle : s.starboardThrottle;
    const thrust = throttle * (throttle < 0 ? vessel.engine.astern : vessel.engine.ahead);
    const drag = catamaranResistance(localU) * 0.5 * (s.capsized ? 4 : 1);
    surge += thrust - drag;
    yaw -= x * (thrust - drag);
    // Hull crossflow at five stations resists sway and rotation independently.
    for (const z of [-4.6, -2.3, 0, 2.3, 4.6]) {
      const flow = s.leeway - omega * z;
      const force =
        -0.5 * RHO * 1.1 * vessel.hullDraft * (vessel.waterline / 5) * flow * Math.abs(flow);
      sway += force;
      yaw -= z * force;
    }
    // Shallow fixed keels provide less lateral lift than a deep monohull fin.
    const keelZ = -0.6,
      keelFlow = s.leeway - omega * keelZ;
    const keelForce = -(250 + 850 * Math.abs(localU)) * keelFlow;
    sway += keelForce;
    yaw -= keelZ * keelForce;
    // Each rudder sees its own hull speed and propwash. Normal force always
    // opposes the local normal flow, so a centered blade cannot create energy.
    const rudderZ = 4.8,
      forward = localU + 0.6 * Math.max(0, throttle);
    // Keels straighten transverse flow before it reaches the aft rudders.
    const lateral = s.leeway * 0.15 - omega * rudderZ;
    const normal = lateral * Math.cos(delta) + forward * Math.sin(delta);
    const tangent = forward * Math.cos(delta) - lateral * Math.sin(delta);
    const lift =
      -0.5 *
      RHO *
      vessel.rudderArea *
      (forward ** 2 + lateral ** 2) *
      clamp(4 * Math.atan2(normal, Math.abs(tangent) + 0.01), -1.1, 1.1);
    const fx = lift * Math.cos(delta),
      fu = lift * Math.sin(delta);
    sway += fx;
    surge += fu;
    yaw -= rudderZ * fx + x * fu;
  }
  yaw -= 9000 * omega; // Skin/appendage rotational damping at very low speed.
  const oldLeeway = s.leeway;
  s.leeway += (sway / (vessel.mass * 1.5) - omega * u) * dt;
  s.yawRate += (yaw / yawInertia / RAD) * dt;

  const heelingMoment = -sailSide * vessel.sailEffortHeight - windSide * vessel.windage.height;
  s.stabilityLoad = Math.abs(heelingMoment) / (vessel.mass * G * halfSpacing);
  s.windwardHullLoad = Math.max(
    0,
    0.5 -
      Math.abs(buoyancyStiffness * Math.sin(s.heel * RAD)) / (2 * vessel.mass * G * halfSpacing),
  );
  if (s.capsized) {
    const target = Math.sign(s.heel || 1) * 175;
    s.rollRate += ((target - s.heel) * 0.8 - s.rollRate * 2) * dt;
  } else {
    s.rollRate +=
      ((heelingMoment - catamaranRightingMoment(s.heel) - rollDamping * s.rollRate * RAD) /
        rollInertia /
        RAD) *
      dt;
  }
  s.heel += s.rollRate * dt;
  if (Math.abs(s.heel) >= 60) s.capsized = true;
  return u + (surge / (vessel.mass * 1.1) + omega * oldLeeway) * dt;
}
