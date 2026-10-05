import { apparentWind, windOverWater, groundVelocity, KNOT } from '../physics.js';

export const APPARENT_WIND_LAB = {
  id: 'apparent-wind-lab',
  name: 'Apparent Wind Lab',
  kind: 'wind-lab',
  symbol: '↗',
  difficulty: 'Medium',
  description: 'Record how the wind felt aboard changes as you accelerate and change course.',
  instructions:
    'Record three observations: stopped with sails down, sailing across the wind, then on a broad reach. Follow the live targets and press Record wind reading after each continuous hold. The cruising yacht demonstrates apparent wind; the course explains how efficient racing boats can exceed true-wind speed.',
  locationId: 'haven',
  engine: false,
  conditions: { windDirection: 0, windSpeed: 10, currentDirection: 0, currentSpeed: 0 },
  start: { x: 0, z: 1150, heading: 90, speed: 0, sails: 0, mainHoist: 0, jibHoist: 0 },
  targets: [],
  stages: [
    {
      id: 'stopped',
      title: 'Stopped: compare the wind readings',
      hold: 2,
      instruction:
        'Leave both sails lowered. With almost no motion, apparent wind matches the 10-knot wind over water. Record the reading before hoisting.',
    },
    {
      id: 'reach',
      title: 'Beam reach: build apparent wind',
      hold: 5,
      instruction:
        'Hoist both sails. Hold about 090° and trim both sheets toward their suggested angles. Build at least 5 knots; watch apparent wind exceed 10 knots and move ahead of the beam, then record.',
    },
    {
      id: 'broad',
      title: 'Broad reach: compare again',
      hold: 5,
      instruction:
        'Bear away gently toward 155°, then centre the helm. Ease both sheets for the new airflow. Keep at least 2 knots with apparent wind below 9 knots, then record and compare all three readings.',
    },
  ],
  goldTime: 240,
  silverTime: 420,
  timeLimit: 900,
  chart: { center: { x: 200, z: 1250 }, span: 1200 },
  debrief:
    'Across the wind, boat motion strengthened the apparent airflow and brought it forward. Bearing away reduced it. A racing boat with efficient sails and lower resistance can keep accelerating beyond true-wind speed. These cruising-yacht observations demonstrate the airflow change, not a 30-knot racing performance.',
};

// Recompute from physical state so cached instrument text can never pass a goal.
export function windLabReadings(state) {
  const wind = windOverWater(state),
    apparent = apparentWind(state);
  const velocity = groundVelocity(state);
  return {
    boatSpeed: state.speed,
    groundSpeed: Math.hypot(velocity.x, velocity.z) / KNOT,
    trueSpeed: wind.speed,
    trueAngle: wind.angle === null ? null : Math.abs(wind.angle),
    apparentSpeed: apparent.speed,
    apparentAngle: Math.abs(apparent.angle),
  };
}

export function windLabRequirements(run) {
  const s = run.state,
    r = windLabReadings(s),
    stage = run.definition.stages[Math.min(run.stage, 2)];
  const stopped = stage.id === 'stopped',
    reach = stage.id === 'reach';
  return [
    {
      label: 'Wind over water',
      value: r.trueSpeed,
      unit: 'kn',
      target: '10 kn',
      met: Math.abs(r.trueSpeed - 10) < 0.01,
    },
    {
      label: stopped ? 'Speed over ground' : 'Speed through water',
      value: stopped ? r.groundSpeed : r.boatSpeed,
      unit: 'kn',
      target: stopped ? '≤ 0.2 kn' : reach ? '≥ 5 kn' : '≥ 2 kn',
      met: stopped ? r.groundSpeed <= 0.2 : r.boatSpeed >= (reach ? 5 : 2),
    },
    {
      label: 'Wind angle over water',
      value: r.trueAngle,
      unit: '°',
      target: stopped || reach ? '80–100°' : '145–165°',
      met:
        r.trueAngle !== null &&
        r.trueAngle >= (stopped || reach ? 80 : 145) &&
        r.trueAngle <= (stopped || reach ? 100 : 165),
    },
    {
      label: 'Apparent wind speed',
      value: r.apparentSpeed,
      unit: 'kn',
      target: stopped ? '9.8–10.2 kn' : reach ? '≥ 10.5 kn' : '≤ 9 kn',
      met: stopped
        ? Math.abs(r.apparentSpeed - r.trueSpeed) <= 0.2
        : reach
          ? r.apparentSpeed >= r.trueSpeed + 0.5
          : r.apparentSpeed <= r.trueSpeed - 1,
    },
    {
      label: 'Apparent wind angle',
      value: r.apparentAngle,
      unit: '°',
      target: stopped ? '80–100°' : reach ? '≤ 75°' : '> 90°',
      met: stopped
        ? r.apparentAngle >= 80 && r.apparentAngle <= 100
        : reach
          ? r.apparentAngle <= 75
          : r.apparentAngle > 90,
    },
    {
      label: stopped ? 'Both sails lowered' : 'Both sails drawing',
      met: stopped
        ? s.mainHoist === 0 && s.jibHoist === 0
        : s.mainHoist >= 0.95 &&
          s.jibHoist >= 0.95 &&
          s.mainFlow === 'Drawing' &&
          s.jibFlow === 'Drawing',
    },
    { label: 'Anchor raised', met: !s.anchor },
    { label: 'Engine neutral', met: s.throttle === 0 },
  ];
}
