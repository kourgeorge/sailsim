# Collision physics

The contact solver in `src/collisions.js` operates on finite, convex hull footprints. Shared definitions in `src/world/bodies.js` supply both rendered object placement and collision geometry. The player's outline extends 6.6 m forward and 5.25 m aft of its render origin, with a maximum beam of 4.12 m; this is distinct from the sailing model's waterline length.

## Coordinates and supported objects

- Positions and geometry: metres; velocities: ground-frame m/s; mass: kg; inertia: kg m²; contact impulse: N s.
- +X is east, +Z south. Heading and yaw rate are clockwise from north, in degrees and degrees/s. Angular impulse calculations convert to radians internally.
- Player and free yachts receive translation and yaw impulses. Fixed marina spines, fingers and coastal rocks have zero inverse mass/inertia and remain immobile.
- Moored yachts and buoys receive impulses, then experience a damped radial spring outside their mooring slack. A maximum radius removes outward velocity at the line limit. Berthed yachts also have damped heading restraint; buoy heading is unrestricted.
- Boxes and convex hull polygons are supported. Circular buoys use 16-sided polygons. Each world reset creates independent body state.

## Contact and integration

Bounding circles, cached world bounds and a 40 m static spatial grid reject distant pairs. The narrow phase uses the separating-axis theorem. Clipping the polygon overlap supplies a representative contact point; equal and opposite impulses include both bodies' mass, inertia and velocity at that point. Off-centre strikes therefore rotate both movable bodies.

Four deterministic sequential-impulse iterations apply normal restitution and Coulomb friction. Restitution defaults to 0.06 and is limited to 0.2; friction defaults to 0.3. Separating bodies receive no normal impulse. Position-only correction removes 75% of overlap beyond a 2 mm allowance per iteration without adding velocity. Free bodies also experience simple exponential water drag toward the ambient current and angular damping. Momentum conservation tests isolate contacts from these external forces and mooring constraints.

The existing sailing forces advance the player, followed by world-body integration and contact resolution. Player velocities convert from through-water knots and leeway to ground-frame m/s for collision response, then back again for sailing and instruments. Grounded yachts become immovable. World-yacht grounding currently uses depth at the hull origin and scaled draft.

Substeps are at most 0.02 s and shrink near bodies according to translational speed, rotational tip speed and the thinnest nearby collision feature. An incoming frame interval is capped at 2 s; invalid/nonpositive intervals are ignored. Paused instrument refresh advances neither bodies nor collision time. Fixed geometry must remain immutable during a run; location resets replace it and invalidate the spatial cache.

## Events and training evidence

`collisionCount` increases once per player contact episode. `collision` retains the latest event, including body ID/kind, point, player-to-other normal, impulse, closing speed, simulation time and sequence. `collisionEvents` retains the latest 16 episodes. Both bodies receive `lastImpact` for impulses above 1 N s, including simulation time and contact point for rendering.

An episode ends only when a separating axis has more than 0.15 m clearance. `contactActive` includes this clearance hysteresis, so resting-contact jitter or a small rebound does not spam warnings or allow restarting an assessment mid-contact. A later encounter after clearing the object creates a new episode. Assessments compare their starting collision count and reject ongoing contact; old latched incidents alone do not fail a new attempt. Contacts solely between world objects do not increment the player's count.

## Validation and limits

Automated tests cover finite bow and rotated-footprint contacts; unequal-mass momentum and restitution; off-centre mirror symmetry; reactions of both moving bodies; fixed piers; friction; no extra impulse during separation; moving-frame invariance; mooring translation and heading recovery; deterministic repeated runs; frame-partition convergence; and an 80 m/s hull approaching a 0.2 m pier. Integration tests cover current conversion, both-body impact records, episode deduplication/re-entry, reset isolation and paused state. Existing sailing and all physical lesson scenarios are also exercised against the integrated solver.

This is a horizontal rigid-body training approximation, not CFD or a validated vessel-specific collision model. It uses one representative contact per pair, simplified mass/inertia and water resistance, and discrete adaptive stepping rather than exact continuous collision detection. The high-speed test is a regression fixture, not a guarantee for arbitrary speeds, shapes or dense piles. Moorings approximate combined line restraint; they do not resolve individual ropes, fender compression or line breaking. Hull damage, flooding, capsize, vertical contact/overhangs and post-impact structural behaviour are not simulated. Grounding is a simplified persistent constraint until reset. These limits preclude treating the simulation as a predictor of real collision loads or safe contact speeds.
