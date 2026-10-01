# Sailing dynamics and vessel controls

The simulator integrates a deterministic, empirical small cruising-yacht model. It is useful for exploring relationships between course, apparent wind, sail area, trim, momentum, and steering. It is **not calibrated against a specific yacht**, a velocity-prediction program, measured polars, an instructor's assessment, or sea trials. Passing numerical tests establishes code behavior, not real-world accuracy.

## Coordinates and units

- World `x` is east, `z` is south; position, distance, depth, and anchor rode are metres.
- Heading and bearings are degrees clockwise from north. `windDirection` is where the wind comes **from**. The wind velocity is relative to fixed ground, not moving water; `currentDirection` is where water travels **to**. Real marine instruments may use a water-referenced true-wind convention, so the reference frame matters.
- `speed` is signed forward speed through water, in knots (astern is negative). `speedOverGround` is the magnitude of the full ground velocity, in knots. Course over ground accounts for current and sideways motion.
- One knot is exactly 1,852 / 3,600 metres per second. `leeway` is signed starboard sideways velocity in metres per second, not an angle. `yawRate` is degrees per second.
- Positive rudder means a starboard helm command. It increases compass heading going ahead and decreases heading going astern. This is the wheel/helm command, not a statement about tiller displacement.
- Apparent wind angle is relative to the bow, positive from starboard, negative from port. Zero is ahead, ±180° astern.

A grounded hull has zero ground velocity, including when current flows past it. Apparent wind therefore equals the ground-referenced true wind in speed and bearing, with its angle measured relative to the bow. Instruments refresh on the grounding step, later simulation ticks and paused condition edits; current must not create fictitious observer motion. The same ground-velocity calculation supplies the collision adapter and derived instruments.

## Integrated model

The vessel has a nominal 5,600 kg mass, 9.5 m waterline, 1.8 m draft, 30 m² mainsail, and 22 m² headsail. These are design assumptions, not measurements of eSail's vessel.

1. Compute boat velocity from forward speed, lateral speed, heading, and current. Subtract it from the true air velocity to obtain apparent wind. This includes the distinction between speed through water and speed over ground.
2. Compute separate main and headsail lift/drag forces using `0.5 × air density × apparent wind speed² × exposed area × coefficient`. Lift is projected forward and sideways relative to the apparent-wind angle. Sail coefficients are deliberately smooth, empirical functions of sail incidence; they are not wind-tunnel data. The sail-drive gate decreases from 47° to zero at 38° true wind angle. Negative aerodynamic forward drive is clipped to zero, so detailed backed sails and aerodynamic braking are not represented.
3. Apply linear and quadratic hull drag plus progressively increasing wave resistance around the conventional waterline-based hull-speed estimate. Hull speed is a resistance scale, not a hard speed cap. Forward and reverse engine thrust add force; neutral removes thrust but preserves momentum.
4. Integrate surge and lateral acceleration. Lateral keel damping increases with forward speed. Heel approaches a limited equilibrium based on sail sideforce and reefing; this is a teaching response, not a hydrostatic stability calculation.
5. Rudder command produces a speed-dependent target yaw rate, with a 1.6-second rotational response. Signed speed reverses helm response astern. Forward engine propwash supplies a small amount of authority at rest. Rudder drag penalizes large angles. Prop walk, stern kick, weather helm, keel lift variation, and individual rudder hydrodynamics are not modeled.
6. Advance ground position and stop at the shared shoreline bathymetry's draft limit. Grounding is latched across substeps and subsequent frames until the boat is reset; grounding impact and damage are not simulated.

`step(state, dt)` accepts seconds and advances in substeps no larger than 20 ms, consuming the full ordinary frame interval. Negative/nonfinite intervals do nothing. An interval above two seconds is capped to prevent a suspended browser tab from making a huge unobserved passage; the application should pause during long suspensions. `refreshDerived(state)` recomputes apparent wind, trim/flow feedback, depth, ground velocity/course, and anchor scope after paused edits without advancing time, position, or dynamic velocity. It does not deploy/capture an anchor. No random forces enter the physics model. Visual waves do not exert forces on the hull.

## Controls with modeled effects

| Field | Range | Effect |
|---|---|---|
| `rudder` | −35…35° | Port/starboard helm, inertial yaw, extra drag |
| `mainSheet` / `trim` | 0…90° | Main angle out from centerline |
| `jibSheet` | 0…90° | Independent headsail angle |
| `mainHoist` | 0…1 | Exposed mainsail area |
| `jibHoist` | 0…1 | Exposed headsail area / furler |
| `reefLevel` | 0, 1, 2 | Main area factors 1, .72, .48 and reduced heel response |
| `traveler` | −20…20° | Relative adjustment to main angle; positive eases, negative brings in, normalized for either tack |
| `vang` | 0…1 | Modest efficiency adjustment representing twist control; target increases with apparent wind angle |
| `outhaul` | 0…1 | Modest efficiency adjustment representing sail flattening; target increases with wind speed |
| `throttle` | −1…1 | Reverse, neutral, ahead; reverse thrust is lower than ahead |
| `anchor` command | boolean | Start deployment (`true`) or request powered recovery to zero (`false`) |
| `anchorRode` | 0…250 m | Selected target rode; does not directly change physical paid length |
| `anchorWinchRunning` | boolean | Start/stop powered rode travel without pausing the vessel |
| `anchorPaidRode` | 0…250 m, read-only to controls | Actual integrated rode; supplies scope and restraint geometry |
| `currentSpeed`, `currentDirection` | knots, compass TO | Uniform steady current; changes ground track and apparent wind |

The suggested sheet angles maximize the **current model's** forward-force coefficient over 0–85°, using apparent wind. They are teaching aids, not real sail-trim prescriptions. The `mainFlow` / `jibFlow` readouts distinguish lowered, luffing, stalled, and drawing states; they are simplified inferred airflow, not simulated fabric telltales.

Legacy `sails` is a combined raise/lower command, synchronized to the greatest individual hoist; use the individual hoists to assess whether *both* sails are down. Legacy `reef` maps to the first reef when toggled on. `applyControlPatch(state, patch)` applies either interface atomically and should be used by new UI and scenario setup code. Direct legacy writes are also reconciled on the next physics tick. Private `_controls` and `_anchor` fields must not be used as assessment targets or persisted between freshly reset scenarios.

## Anchor model

The anchor attaches at the shared bow fairlead, local `(0, 1.2, -6.6)` metres. Its horizontal position rotates with compass heading; the physics excludes decorative wave bob, pitch and heel. Anchor depth comes from the same location bathymetry as the chart, sampled at the persistent anchor endpoint when it contacts bottom; the endpoint may trail the moving bow. Authored predeployment samples directly beneath the fairlead rather than beneath the vessel centre.

A deployment command is **pending** until a running physics tick. `anchorRode` is the requested target; `anchorPaidRode` is the actual paid length. Powered lowering runs at 0.4 m/s (24 m/min), recovery at 0.25 m/s (15 m/min), and the motor stops at its target. These are fictional operating assumptions, not loaded equipment calibration. A 45 m deployment therefore needs 112.5 simulated seconds of powered travel; recovering 45 m needs at least 180 seconds, plus any time spent unloading the rode. Repeated identical commands do not restart a deployment or move its bottom point.

The airborne anchor has a persistent world-space endpoint. Every running substep lets it settle downward at 0.4 m/s and constrains its distance from the moving fairlead to the actual paid length. It captures the bottom only when that endpoint physically touches the shared bathymetry. Its horizontal position is not teleported beneath the bow. While suspended it supplies no seabed restraint. Stopping the windlass preserves paid length but does not pause vessel motion or prevent a slack suspended anchor from settling within the available rode.

Recovery first takes in slack. A taut rode blocks further recovery until the boat moves toward the anchor and unloads it; shortening the target cannot shrink the swing circle through the vessel and tow it with a constraint projection. The geometric breakout convention requires the fairlead to come within 0.5 m horizontally of the anchor, actual paid length within 0.1 m of the vertical span, and a target below that span. The endpoint then leaves the bottom continuously and reels toward the bow. These distances are model tolerances, not real breakout mechanics. Requesting recovery does not immediately set `anchor` false: only fully recovering actual rode to zero clears the anchor and stows it.

Vertical distance is captured depth plus the 1.2 m bow allowance. Scope is rode / vertical distance. Rode that reaches bottom allows a horizontal **fairlead** swing radius of `sqrt(rode² − vertical²)`; the vessel centre is not the circle's constrained point. Slack rode exerts no force. Beyond the radius, a position-only projection removes excess extension and an inward impulse opposes outward fairlead velocity. That velocity includes hull translation and yaw at the bow. Effective mass includes yaw inertia, so bow tension can rotate the yacht as well as slow its translation. Tangential movement remains possible, and deploying the anchor does not stop the boat instantly.

For demonstration, the model progressively loses holding below 3:1 scope and moves the bottom anchor under outward loading. **That threshold is a simulation coefficient, not anchoring advice or evidence that 3:1 is safe.** Real scope depends on seabed, rode, anchor, wind, current, tide, vessel, available room, and authoritative local guidance. Catenary, anchor setting and breakout force, seabed friction, equipment-specific loaded windlass performance, elastic rode, breaking loads, gust loading, and actual tide-dependent depth are omitted. Captured depth remains the reference datum during modeled dragging. `anchorTension` is an approximate impulse / substep diagnostic, not usable equipment sizing information. None of the states proves that a real anchor is set.

`src/anchor.js` provides the shared geometry and command API:

- `BOW_FAIRLEAD`: frozen local attachment coordinates.
- `bowFairlead(state)`: a fresh world `{x, y, z}` attachment point.
- `anchorSnapshot(state)`: a fresh derived snapshot; never captures or moves a deployment.
- `ANCHOR_RATES`: frozen powered lowering/retrieving rates in metres per second.
- `applyAnchorControlPatch(state, patch)`: idempotent target/motor requests, normally called through `applyControlPatch`; actual paid length cannot be edited through this control API.
- `initializeAnchoredScenario(state, {rode})`: reset/setup-only initializer for a genuinely deployed, stationary windlass with valid depth and sufficient rode. It is not an in-session control.

The snapshot supplies `status` (`stowed`, `pending`, `suspended`, `slack`, `taut`, `dragging`), `deployed`, `captured`/`seabedContact`, `fairlead`, `anchorPoint`, `seabedPoint`, `anchorDepth`, `rode` (actual paid length), `targetRode`, `operation` (`stopped`, `lowering`, `retrieving`, `blocked`), `reason` (`rode-loaded` or null), `vertical`, `scope`, `swingRadius`, `distance`, `shortScope`, `reachesBottom`, `tension` and `adjustmentPending`. Lengths are metres and tension is newtons. `anchorPoint` is the actual hanging or bottom anchor, or null before deployment and when stowed. `seabedPoint` exists only for bottom contact. `distance` measures horizontal fairlead-to-bottom-anchor distance, not paid rode or distance from the vessel centre. `captured` means simulated seabed contact, not verified anchor holding. Legacy internal deployment records without `onBottom` are interpreted as bottom records.

Paused commands change only target and motor requests. Scope, swing radius, and rendered rode use actual paid length; no target-length geometry is previewed as physical deployment. A pending initial command has no anchor point or swing circle to render. `adjustmentPending` means the motor is requested to run and actual length differs from target; it can remain true during blocked recovery. Resuming the windlass does not itself resume a paused simulation. Consumers should read the snapshot instead of accessing private `_anchor` fields.

Regression tests cover compass-transformed fairlead coordinates, pending/suspended/bottom transitions, finite lowering and retrieval rates, stop/resume and mid-travel reversal, no progress on paused edits, continuous endpoint motion, loading that blocks recovery without towing the boat, bottom release and recapture, snapshot purity, independent returned objects, fairlead-based swing radius, yaw/translation impulse symmetry, no outward velocity after taut restraint, legacy records, selected-location bow depth, and 20 ms versus 100 ms convergence. Grounding tests cover contact in 20–250 ms frames and confirm that subsequent substeps cannot silently clear the contact.

## References checked during implementation

- [NASA Glenn: The Lift Equation](https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/lifteq.html): force scaling with air density, velocity squared, area, and coefficient. **NASA does not supply this model's sail coefficients.**
- [Apparent wind](https://en.wikipedia.org/wiki/Apparent_wind): relative-velocity construction, true wind minus observer velocity. The implemented vector arithmetic is additionally verified against exact headwind, tailwind, and crosswind cases.
- [Lewmar V1–V6 windlass manual, 65001201 issue 11](https://www.lewmar.com/mst_attachment/attachment/click/attachment_id/276/): operating sequence and maximum equipment line-speed examples. The model's 24 m/min lowering and 15 m/min recovery are assumptions, not manufacturer-validated loaded speeds. See the [original research note](../reference/sailing/seamanship/lewmar-windlass.md).
- [Hull speed](https://en.wikipedia.org/wiki/Hull_speed): conventional `1.34 × sqrt(waterline in feet)` knots approximation and why it is not a universal speed limit. Used only as the wave-resistance scale.

The references establish the general relationships. All tuning constants, sail-coefficient curves, resistance coefficients, reef response, propwash, anchor holding threshold, and geometry are project assumptions.

## Validation

`node --test tests/physics.test.js` verifies acceleration and trim response; main/jib independence; reef effects; apparent-wind vectors with current and leeway; ahead/astern thrust; inertia and drag; rudder reversal and rotational decay; 10 ms versus 100 ms frame convergence; current-induced ground track; anchor rode reach, bounded swing, and short-scope dragging; grounding; invalid elapsed time; finite high-wind integration; and alias consistency. These are deterministic numerical and behavioral checks. On-water calibration and independent instructor review remain necessary before claims of training fidelity.
