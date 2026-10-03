# Haven 40 Cat

A fictional 12 m cruising sailing catamaran, selectable only under **Free sailing → Choose your boat**. The selection survives a reload and changing sailing grounds. Restart retains the current vessel; leaving Free sailing restores the monohull for lessons, assessments and every challenge type so their setups and scoring remain comparable. Port and starboard throttle controls share one compact row on desktop and mobile.

## Geometry and units

Shared dimensions live in `src/vessels.js`. Distances are metres, forces newtons, mass kilograms, internal angular dynamics radians/second, and public heading/heel readings degrees. Public speed remains knots; hydrodynamics use metres/second.

| Property | Value |
| --- | --- |
| Length / waterline | 12 / 11.6 m |
| Overall beam / hull-center spacing | 6.6 / 5 m |
| Maximum hull beam | 1.6 m each |
| Cruising displacement | 9,500 kg |
| Hull / keel draft | 0.7 / 1.2 m |
| Bridge-deck clearance | 0.8 m |
| Main / jib area | 50 / 28 m² |
| Effective waterplane area | 10.9 m² per hull |
| Engines | Two, each 1,500 N ahead / 1,000 N astern at full command |

The visible hull sections also define the collision outlines and water exclusion. Numerical integration of the immersed shells supports the declared displacement within 5%, before appendage volume. Rendered triangular sail dimensions match the force model's areas within 0.1 m². Transoms have lowered swim steps; hulls are closed at the ends and have separate deck surfaces. The bridge deck, saloon, wraparound glazing, forward crossbeam, twin trampoline nets, cockpit seating, hardtop, solar panels, raised helm, running rigging, independent propellers, twin keels and rudders are modeled separately. Two wakes follow the hull centerlines.

## Dynamics

- **Surge:** ITTC-1957 turbulent skin friction, a form factor, and a smooth empirical Froude-dependent wave-resistance term. No hard monohull hull-speed ceiling. Each hull sees its own longitudinal speed during rotation, producing differential drag and yaw damping.
- **Sway and yaw:** distributed quadratic crossflow at five stations per hull, shallow-keel resistance, rudder normal forces, and body-frame velocity rotation. Effective mass and yaw inertia include hydrodynamic added mass. Empirical transverse-flow straightening represents the rudders operating aft of the keels.
- **Twin engines:** independent thrust at ±2.5 m generates translation and a yaw moment. The common throttle commands both engines; Neutral stops both even when they were opposed. Reverse thrust is weaker: approximately two-thirds ahead against full astern balances thrust for a pivot. Propwash contributes limited rudder authority while stationary. Centered, unpowered rudders cannot turn a motionless vessel.
- **Wind and sails:** the existing vector apparent-wind model drives the declared main and jib areas, with independent hoists, reefing and sheet trim. The cruising catamaran has an empirical 43° no-go threshold. The saloon/hulls add aerodynamic windage even with sails down. Windage is relative to the air, while current separately transports the boat over ground.
- **Roll and stability:** dynamic roll inertia and damping oppose aerodynamic heeling. Waterplane buoyancy transfers load between the hulls until the windward hull unloads. The restoring moment then decreases with heel; a catamaran is not treated as a monohull with a smaller arbitrary heel clamp. A high-load indication appears before loss of stability. A heel of 60° latches capsize, disables sail drive/engine thrust, and requires restart.
- **Contacts:** two convex hull fixtures use a shared rigid body and inertia. Contacts with either hull impart linear and angular momentum; the gap between the bows does not become a solid rectangular collider. Fixed appendages and hulls are sampled for grounding on both sides. Grounding remains latched until reset.
- **Anchoring:** the existing timed windlass and ideal rode constraint use the catamaran's centerline bow fitting, mass and yaw inertia. Rope rendering and instrument geometry use the same fitting.

## Scope and calibration

This is a deterministic real-time handling model, not a measured production-vessel polar, CFD simulation, stability certification, or navigation/training authority. The resistance, aerodynamic, windage, damping and added-mass coefficients are plausible empirical choices, with behavior and conservation checks. Hull geometry and waterplane are checked numerically, but tank tests or sea-trial measurements have not validated performance.

The engine does not solve wave excitation, heave, hydroelasticity, slamming, planing, pitchpole, flooding, damage, or sail failure. Small visual heave/pitch remain decorative. Capsize is a simplified terminal handling state, not a prediction of real-world safe operating limits. The planar collision solver cannot distinguish overhead bridge-deck clearance from the height of an obstacle. Anchoring uses an ideal centerline load and does not solve an independently loaded two-leg bridle or a physical catenary.

## Verification

`tests/catamaran.test.js` checks geometry/displacement, center-channel clearance, hull contacts, linked and independent throttle behavior, mirrored pivots, reverse rudders, passive energy dissipation, current and windage, reef response, finite righting reserve, grounding, anchoring, frame-step convergence and finite extreme-wind integration. Existing monohull tests continue to cover their original behavior.

Run `npm test` and `npm run build`. For visual/application checks, start Vite on port 5214 and run `node scripts/check-catamaran.mjs` (or pass a different server URL). It captures all four camera views and checks selection, compact engines, neutral, restart, mobile use, Hebrew with 200% text, saved preferences and monohull-only lessons, races, maneuvers, adventures and the buoy course. Use `--app-only` against a production preview to skip the source-import camera harness. Captures are written to `artifacts/catamaran/`.
