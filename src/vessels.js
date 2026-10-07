// Fictional cruising vessels. SI units except the public simulator's degrees/knots.
// Keep dimensions shared by rendering, hydrostatics, grounding and collision geometry.
const freeze = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
export const MONOHULL = freeze({
  id: 'monohull',
  name: 'Haven 39',
  type: 'monohull',
  length: 11.85,
  beam: 4.12,
  mass: 5600,
  waterline: 9.5,
  draft: 1.8,
  mainArea: 30,
  jibArea: 22,
  airDensity: 1.225,
  bowHeight: 1.2,
  fairlead: { x: 0, y: 1.2, z: -6.6 },
  helmEye: [0, 3.65, 6.7],
  helmTargetHeight: 1.7,
  // Right-handed propeller: in reverse it walks the stern to port. Yaw rate in
  // degrees per second at full astern from rest, fading out by fadeSpeed (m/s).
  propWalk: { astern: 2.2, fadeSpeed: 1.6 },
  // Hull, deck and rig above water (m²). At low speed the high, light bow blows
  // off first: bowOff is the yaw rate in °/s per newton of side force from rest.
  // Used only when a state opts in with hullWindage (the docking lab).
  windage: { frontal: 7, lateral: 15, height: 1.4, coefficient: 0.9, bowOff: 0.0025, fadeSpeed: 1.6 },
});
export const CATAMARAN = freeze({
  id: 'catamaran',
  name: 'Haven 40 Cat',
  type: 'catamaran',
  length: 12,
  beam: 6.6,
  mass: 9500,
  waterline: 11.6,
  draft: 1.2,
  mainArea: 50,
  jibArea: 28,
  airDensity: 1.225,
  bowHeight: 1.35,
  fairlead: { x: 0, y: 1.35, z: -5.5 },
  hullSpacing: 5,
  hullBeam: 1.6,
  hullDraft: 0.7,
  bridgeClearance: 0.8,
  waterplaneArea: 10.9,
  wettedArea: 48,
  centerOfGravity: 1.4,
  sailEffortHeight: 7.5,
  windage: { frontal: 12, lateral: 24, height: 1.8, coefficient: 0.9 },
  engine: { ahead: 1500, astern: 1000 },
  rudderArea: 0.55,
  helmEye: [2.15, 4.15, 3.7],
  helmTargetHeight: 3.5,
  sections: [
    [-6, 0.018],
    [-5.5, 0.22],
    [-4.5, 0.48],
    [-3, 0.67],
    [-1, 0.79],
    [1, 0.8],
    [3.6, 0.72],
    [5.4, 0.6],
    [6, 0.53],
  ],
});
export const VESSELS = Object.freeze([MONOHULL, CATAMARAN]);
export function getVessel(value) {
  const id = typeof value === 'string' ? value : value?.vesselId;
  return VESSELS.find((vessel) => vessel.id === id) || MONOHULL;
}
export function vesselYawInertia(vessel) {
  return vessel.type === 'catamaran'
    ? vessel.mass *
        (vessel.length ** 2 / 12 + (vessel.hullSpacing / 2) ** 2 + vessel.hullBeam ** 2 / 12)
    : (vessel.mass * (vessel.length ** 2 + vessel.beam ** 2)) / 12;
}
export function catamaranHullShape() {
  const parts = [-1, 1].map((side) => {
    const x = (side * CATAMARAN.hullSpacing) / 2;
    return {
      vertices: [
        ...CATAMARAN.sections.map(([z, w]) => [x + w, z]),
        ...[...CATAMARAN.sections].reverse().map(([z, w]) => [x - w, z]),
      ],
    };
  });
  return { type: 'compound', length: CATAMARAN.length, beam: CATAMARAN.beam, parts };
}
