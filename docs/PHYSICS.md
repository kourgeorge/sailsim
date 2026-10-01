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
| `anchor` | boolean | Deploy or weigh anchor at the current position |
| `anchorRode` | 0…250 m | Reach to seabed and maximum geometric swing radius |
| `currentSpeed`, `currentDirection` | knots, compass TO | Uniform steady current; changes ground track and apparent wind |

The suggested sheet angles maximize the **current model's** forward-force coefficient over 0–85°, using apparent wind. They are teaching aids, not real sail-trim prescriptions. The `mainFlow` / `jibFlow` readouts distinguish lowered, luffing, stalled, and drawing states; they are simplified inferred airflow, not simulated fabric telltales.

Legacy `sails` is a combined raise/lower command, synchronized to the greatest individual hoist; use the individual hoists to assess whether *both* sails are down. Legacy `reef` maps to the first reef when toggled on. `applyControlPatch(state, patch)` applies either interface atomically and should be used by new UI and scenario setup code. Direct legacy writes are also reconciled on the next physics tick. Private `_controls` and `_anchor` fields must not be used as assessment targets or persisted between freshly reset scenarios.

## Anchor model

Deploying captures the anchor's seabed position and depth. Vertical distance is captured depth plus 1.2 m bow height. Scope is rode / vertical distance. Rode shorter than that distance cannot hold. Longer rode allows a horizontal swing circle of `sqrt(rode² − vertical²)`. Once taut, the constraint removes outward radial velocity; tangential motion remains possible. The yacht is therefore not stopped instantly merely because the anchor button is pressed.

For demonstration, the model progressively loses holding below 3:1 scope and moves the anchor's position under outward loading. **That threshold is a simulation coefficient, not anchoring advice or evidence that 3:1 is safe.** Real scope depends on seabed, rode, anchor, wind, current, tide, vessel, available room, and authoritative local guidance. Catenary, anchor setting, seabed friction, winch speed, elastic rode, breaking loads, gust loading, and actual tide-dependent depth are omitted. `anchorStatus`, `anchorScope`, and `anchorDragging` expose the modeled state. `anchorTension` is an approximate impulse-derived diagnostic, not usable equipment sizing information.

Changing rode while paused refreshes reach, scope, and slack/taut status for an existing deployment without moving the yacht or relocating the anchor. Paying out enough rode to create slack clears obsolete dragging warnings. Grounding tests cover contact in 20–250 ms frames and confirm that subsequent substeps cannot silently clear the contact.

## References checked during implementation

- [NASA Glenn: The Lift Equation](https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/lifteq.html): force scaling with air density, velocity squared, area, and coefficient. **NASA does not supply this model's sail coefficients.**
- [Apparent wind](https://en.wikipedia.org/wiki/Apparent_wind): relative-velocity construction, true wind minus observer velocity. The implemented vector arithmetic is additionally verified against exact headwind, tailwind, and crosswind cases.
- [Hull speed](https://en.wikipedia.org/wiki/Hull_speed): conventional `1.34 × sqrt(waterline in feet)` knots approximation and why it is not a universal speed limit. Used only as the wave-resistance scale.

The references establish the general relationships. All tuning constants, sail-coefficient curves, resistance coefficients, reef response, propwash, anchor holding threshold, and geometry are project assumptions.

## Validation

`node --test tests/physics.test.js` verifies acceleration and trim response; main/jib independence; reef effects; apparent-wind vectors with current and leeway; ahead/astern thrust; inertia and drag; rudder reversal and rotational decay; 10 ms versus 100 ms frame convergence; current-induced ground track; anchor rode reach, bounded swing, and short-scope dragging; grounding; invalid elapsed time; finite high-wind integration; and alias consistency. These are deterministic numerical and behavioral checks. On-water calibration and independent instructor review remain necessary before claims of training fidelity.
