import { sailDynamics, windOverWater, KNOT } from '../physics.js';

export const HEAVE_TO = {
  id: 'heave-to',
  name: 'Heave To',
  kind: 'heave-to',
  symbol: '⇌',
  difficulty: 'Medium',
  lessonId: 'sail-71',
  description: 'Tack with the jib held, balance the sails and helm, and drift quietly under sail.',
  instructions:
    'Hold the headsail sheet before tacking through the wind. Leave the jib backed, ease the main and turn the helm toward the wind. Hold for 30 continuous seconds at 40–70° to the wind, below 1.5 kn through the water and 0.2°/s turn rate. Keep both sails raised, the anchor up and engine neutral.',
  tips: [
    'Press Hold headsail sheet on the starting tack. Steer starboard through north toward 050°.',
    'After crossing the wind, reverse the helm toward port (about −30°) and ease the mainsheet to about 40°. Let the yacht slow and settle; adjust gently.',
    'The backed jib pushes the bow away from the wind. The main and rudder oppose it. Release the headsail sheet and centre the helm to sail away.',
  ],
  locationId: 'haven',
  engine: false,
  conditions: { windDirection: 0, windSpeed: 12, currentDirection: 90, currentSpeed: 0 },
  start: { x: 0, z: 1200, heading: 310, speed: 3, sailBalance: true },
  targets: [],
  hold: 30,
  goldTime: 180,
  silverTime: 300,
  timeLimit: 600,
  chart: { center: { x: 0, z: 1200 }, span: 650 },
  debrief:
    'The backed jib supplied braking and a bow-off moment. The mainsail and rudder balanced that moment while the hull resisted sideways motion. You slowed to a leeward drift using the same sail, hull and rudder forces as free sailing.',
};

// Recompute the airflow from velocities, rather than trusting cached readings.
export function heaveToRequirements(run) {
  const s = run.state,
    wind = windOverWater(s),
    angle = wind.angle === null ? null : Math.abs(wind.angle);
  const speed = Math.hypot(s.speed * KNOT, s.leeway || 0) / KNOT;
  return [
    {
      label: 'Tacked with the headsail held',
      met: Boolean(run.heaveTack) && s.jibSide === run.heaveHeldSide,
    },
    { label: 'Headsail backed', met: sailDynamics(s).jib.flow === 'Backed' },
    {
      label: 'Wind angle over water',
      value: angle,
      unit: '°',
      target: '40–70°',
      met: angle !== null && angle >= 40 && angle <= 70,
    },
    {
      label: 'Speed through water',
      value: speed,
      unit: 'kn',
      target: '≤ 1.5 kn',
      met: speed <= 1.5,
    },
    {
      label: 'Turn rate',
      value: Math.abs(s.yawRate),
      unit: '°/s',
      target: '≤ 0.2°/s',
      met: Math.abs(s.yawRate) <= 0.2,
    },
    {
      label: 'Helm toward the wind',
      met: wind.angle !== null && s.rudder * wind.angle > 0 && Math.abs(s.rudder) >= 5,
    },
    { label: 'Both sails raised', met: s.mainHoist >= 0.95 && s.jibHoist >= 0.95 },
    { label: 'Anchor raised', met: !s.anchor },
    { label: 'Engine neutral', met: Math.abs(s.throttle) < 0.01 },
  ];
}

export function observeHeaveToTack(run) {
  const s = run.state,
    angle = windOverWater(s).angle;
  if (angle === null) {
    run.heaveTack = false;
    run.heavePreviousAngle = null;
    return;
  }
  const prior = run.heavePreviousAngle;
  // Zero on north must not conceal the bow crossing; a stern crossing never counts.
  if (prior !== null && angle * prior < 0 && Math.abs(angle - prior) < 180) {
    run.heaveTack =
      s.jibHoist >= 0.95 &&
      s.mainHoist >= 0.95 &&
      s.jibSide !== 0 &&
      s.jibSide === run.heavePreviousSheet &&
      s.jibSide === -Math.sign(prior);
    run.heaveHeldSide = s.jibSide;
  }
  if (s.jibSide !== run.heaveHeldSide) run.heaveTack = false;
  if (angle !== 0) run.heavePreviousAngle = angle;
  run.heavePreviousSheet = s.jibSide;
}
