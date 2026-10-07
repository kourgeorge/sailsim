# Mini-labs plan: interactive physics inside the lessons

Status: plan only, not implemented. Written October 2026, after the lesson text rewrite (see `docs/LESSON_REVIEW.md`).

## Goal

Today every lesson diagram is a still SVG picture. A mini-lab replaces the picture on chosen lesson pages with a small, focused simulation: the learner changes **one or two things** (the wind, the sheet, the boat speed, the helm) and immediately **sees one physical effect** (the sail force, the heel, the track, the anchor pull). The aim is understanding the basic seamanship physics behind each rule, not sailing the full simulator.

## Design rules

1. **One idea per lab view.** At most two controls and one main effect. If a lab needs a third control, it is two labs.
2. **Same physics as the simulator.** Labs call the real model in `src/physics.js` (and `src/anchor.js`, `src/catamaran-physics.js`), so what a learner sees in a lesson matches how the boat behaves when they sail it. Do not write separate "teaching physics".
3. **Plain-English readout.** Every lab shows a one-line sentence that says what is happening right now, e.g. "Sail is stalling: pulled in too far" or "Anchor pulled flat: it holds". The words are not just numbers.
4. **"Try this" prompts.** Each lab page has 1–3 short tasks ("Make the sail luff", "Find the angle with the most forward force"). They tick when done. They are for study only and **award no course credit**, the same as reading.
5. **2D, top-down or side view, simple shapes.** No 3D. Fast on phones, clear in both themes, easy to read.
6. **Still works without interaction.** The lab opens in a sensible starting state that teaches on its own, as the current static figure does. The static SVG stays as the fallback (no JavaScript, print, thumbnails, tests).
7. **Accessible and international.** Keyboard-operable sliders with labels, a text readout announced politely to screen readers, respects `prefers-reduced-motion`, works right-to-left for Hebrew and Arabic without mirroring the physics (the same rule as the helm and charts today), and all labels in six languages.

## How it fits the current code

- **Where it shows:** the reader already shows one figure per page in `.reader-figure` (`src/learning/reader.js`), chosen by `lesson.conceptFigures[index]` or `quiz[i].figure`, then `renderTeachingFigure()`. Add a parallel `lesson.conceptLabs = {pageIndex: labId}` (and `quiz[i].lab`). When a page has a lab, the reader mounts it into `.reader-figure` instead of the static SVG, and unmounts it when the page changes. **Enlarge diagram** opens the same lab bigger in the modal (`tools-ui.js` `figure()`).
- **Lab module shape:** `src/learning/labs/<lab-id>.js` exports `{id, mount(container, {lang, initial}) → {destroy()}}` plus `staticFigure(lang)` for the fallback. A shared `src/learning/labs/kit.js` gives: an SVG stage with theme tokens, slider and toggle controls, a readout line, the "Try this" checklist, a play/pause/step bar for time-based labs, and the reduced-motion switch.
- **Physics access:**
  - *Steady-state labs* (sail force, heel, anchor pull) call pure functions. `coefficients()` in `src/physics.js:86` is private today; export it (or a small `sailForceAt(apparentAngle, sheet, windSpeed)` wrapper) so the lab and the boat use one formula.
  - *Time-based labs* (acceleration, tack, current track, docking) create a state with `initialState()`, apply the lab's settings, and run `step(state, dt)` in a `requestAnimationFrame` loop with a fixed time step. They need no 3D scene. Pause the loop when the page or tab is hidden, and when the reader closes.
- **Translations:** lab labels and readout sentences live in a new `src/i18n/labs.js` (same six-column row format as `src/i18n/learning-tools.js`). The locale tests should check that every lab string exists in all six languages.
- **Progress:** "Try this" ticks are saved in `sessionStorage` per lesson (like the reader's page memory), never in the course record.

## The labs

Each entry lists: what the learner controls, what they see, the readout sentences, "Try this" tasks, the physics source, and the lesson pages it goes on.

### Lab 1: Sail force *(highest value)*
- **Controls:** wind angle to the bow (0–180°, or drag the boat), sheet angle (how far the sail is let out).
- **Shows:** top view of the boat and sail; streamlines bending around the sail; two telltales on each side; the sail's total force arrow split into **forward drive** (green) and **sideways push** (orange); the keel's resisting arrow; the no-go zone shaded.
- **Readout:** "Luffing: sail too far out" / "Working well" / "Stalling: sail pulled in too far" / "In the no-go zone: no drive possible".
- **Try this:** make the sail luff; make it stall; find the setting with the most forward drive at 45° and at 90°; point into the no-go zone and watch the drive go to zero.
- **Physics:** exported `coefficients()` (lift, drag, angle of attack) and the no-go factor from `step()`.
- **Lessons:** 05 (no-go page), 09 (sail at about half the wind angle), 10 (how a boat sails upwind; telltales), 11 (downwind "parachute"), 12 (luff vs stall), 13 (sheet in when heading up).

### Lab 2: Live compass and wind
- **Controls:** turn the boat (drag or ±5° buttons), turn the wind direction.
- **Shows:** the app's compass dial (reuse `compass-figure.js` drawing), the gold wind-from arrow, the shaded no-go sector, the white boat, plus labels for the **point of sail** and **port/starboard tack**.
- **Readout:** "Heading 045°, wind from 315°: beam reach on starboard tack."
- **Try this:** put the boat on a beam reach on both tacks; find the edge of the no-go zone; change the wind and notice the point of sail changes while the heading does not.
- **Physics:** `pointOfSail()` and the tack sign from `src/physics.js`.
- **Lessons:** 04 (instrument dial), 05 (wind from vs toward), 09 (points of sail), 13 (head up vs bear away), 26 and 46 (which tack is each boat on).

### Lab 3: Tack and gybe player
- **Controls:** maneuver (tack / gybe), turn rate (slow / normal / sharp), play, pause, scrub.
- **Shows:** top view through the turn: bow or stern crossing the wind, sails flapping in the no-go zone, the boom swinging, a speed graph under the picture. On a slow tack the boat stops in irons; on a sharp turn the speed graph shows the rudder braking. On a gybe, the boom crosses with the sail still full; a "sheet in first" toggle shortens the swing.
- **Readout:** "Bow passing the wind: sails give no drive, momentum carries you" / "Stopped head to wind: in irons".
- **Try this:** complete a tack; get stuck in irons by turning too slowly; gybe with and without pulling the boom in first.
- **Physics:** `step()` with a scripted helm, starting from a set speed.
- **Lessons:** 11 (sailing by the lee), 14, 15, 16.

### Lab 4: Heel and reef
- **Controls:** wind speed (5–30 knots), reef (none / 1 / 2).
- **Shows:** stern view of the boat heeling; the sail force arrow and its height (center of effort); a bar showing force growing with the **square** of wind speed (10 → 20 knots shows four times the bar); a small helm-pull indicator for weather helm.
- **Readout:** "20 knots pushes four times as hard as 10 knots" / "Heeling too far: reef now".
- **Try this:** double the wind and compare the force bar; find the wind speed where you would reef; reef and compare the heel at the same wind.
- **Physics:** pressure `0.5·ρ·v²` and the heel response from `step()`; the catamaran view uses `catamaranRightingMoment()`.
- **Lessons:** 08 (weather helm), 18, 52 (catamaran: little heel, high loads).

### Lab 5: Rudder and momentum
- **Controls:** boat speed (including astern), helm angle; a toggle for wheel or tiller.
- **Shows:** top view with water flow past the rudder; the turning rate; the boat still turning after the helm is centered; under sternway the turn reverses. Tiller mode shows the tiller pushed the opposite way to the turn.
- **Readout:** "Little flow: rudder has little grip" / "Going backward: steering is reversed".
- **Try this:** steer at 0, 1 and 4 knots and compare; center the helm early enough to stop on a heading; reverse and see the bow go the other way.
- **Physics:** `step()` with engine thrust and helm; propwash effect already in the model.
- **Lessons:** 02 (rudder as an underwater wing), 07, 08, 43, 45.

### Lab 6: Apparent wind triangle
- **Controls:** boat speed, true wind speed (and angle).
- **Shows:** the three arrows (true wind, "boat motion" wind, apparent wind) adding up as a triangle; the sail turning to follow the apparent wind.
- **Readout:** "Apparent wind: 14 knots from 62° — further forward than the true wind."
- **Try this:** speed up on a beam reach and watch the wind move forward; bear away and watch it weaken.
- **Physics:** `apparentWind()`. Can replace the current static figure in `apparent-wind-figure.js`.
- **Lessons:** 09, 17.

### Lab 7: Current and track
- **Controls:** heading, current speed and direction.
- **Shows:** chart-style top view: the bow direction, the actual ground track, and a target mark; elapsed time to reach it.
- **Readout:** "Bow points 090°, boat goes 076°: aim up-current to reach the mark."
- **Try this:** reach the mark with a cross-current; compare passage time with the current ahead and behind; set zero water speed and see the boat still move with the current.
- **Physics:** `groundVelocity()` / `step()` with sails down and engine on.
- **Lessons:** 04, 22, 39, 49 (cross a traffic lane on a heading at right angles, not a track).

### Lab 8: Anchor scope
- **Controls:** water depth, rode length (and chain or rope).
- **Shows:** side view: the bow, the rode's curve, the anchor on the seabed, and the angle of pull at the anchor; a swing circle from above.
- **Readout:** "Pull is flat: anchor digs in" / "Pull is steep: anchor may break out".
- **Try this:** find the shortest rode that keeps the pull flat at 5 m; double the depth and fix it; see the swing circle grow.
- **Physics:** `src/anchor.js` geometry (bow fairlead height, rode length).
- **Lessons:** 30, 31, 32 (rode up and down breaks the anchor out).

### Lab 9: Collision bearing
- **Controls:** play two boats on converging straight courses; change your own course or speed.
- **Shows:** a top view plus a line of sight drawn every few seconds; when the line keeps the same direction while the boats get closer, it turns red.
- **Readout:** "Bearing steady, range closing: risk of collision."
- **Try this:** spot the collision course; make one big, early turn and see the bearing start to change; compare it with many small turns.
- **Physics:** simple kinematics (no sail model needed); reuse the geometry in `colregs-figures.js`.
- **Lessons:** 25, 41, 48.

### Lab 10: Lights and leading line
- **Controls:** (a) rotate the other vessel around you; (b) slide your boat sideways across a leading line; (c) play a light's flash cycle.
- **Shows:** (a) which lights you can see from that angle (red, green, white sectors); (b) front and rear leading lights moving apart and lining up; (c) a lighthouse flashing with a timer.
- **Readout:** "You see red and green: it is heading straight at you" / "Rear light to the right: you are right of the line, move left."
- **Try this:** find the angle where you see only the sternlight; get back onto the leading line; time the light and name it from the light list.
- **Physics:** light sector angles from the rules; leading-line parallax is plain geometry.
- **Lessons:** 27, 42, 50, 53.

### Lab 11: Docking forces
- **Controls:** wind across the berth, short bursts ahead or astern.
- **Shows:** top view: the bow blowing off at low speed, prop walk swinging the stern in reverse, the stern swinging out in a turn.
- **Readout:** "In reverse, prop walk pulls the stern to port."
- **Try this:** stop beside the dock with wind blowing off it; compare an approach into the wind with one downwind.
- **Physics:** windage and engine from `step()`. **Prop walk is not modeled today**; this lab needs a small, documented prop-walk force first (also useful for the marina exercises).
- **Lessons:** 29, 44.

## Order of work

1. **Kit + Lab 1 (sail force) + Lab 2 (compass).** Build the shared kit, the reader integration (`conceptLabs`), the static fallback and the six-language labels. These two labs cover Lessons 04–13, the core of the course.
2. **Lab 3 (tack/gybe) and Lab 5 (rudder).** These are the first time-based labs; they prove the `step()` loop, pause handling and reduced motion. Lessons 07–08, 11, 14–16, 43, 45.
3. **Lab 4 (heel/reef), Lab 6 (apparent wind), Lab 8 (anchor).** Steady-state labs; quick once the kit exists.
4. **Lab 7 (current), Lab 9 (bearing), Lab 10 (lights).** Navigation and rules.
5. **Lab 11 (docking)**, after a prop-walk force is added to the model.

Each step: update the lesson text where it says "the diagram shows" to match the lab, and keep the page count of each lesson the same.

## Testing

- **Unit (`node --test`):** each lab's pure function returns the expected readout for set inputs (e.g. Lab 1: sheet far out at 90° gives "luffing"; any angle inside the no-go zone gives zero drive; Lab 4: force at 20 kn is four times the force at 10 kn). Every lab id used in `conceptLabs` exists; every lab string exists in all six languages; the static fallback renders.
- **Browser (Playwright):** open a lesson page with a lab, move each slider with the keyboard, check the readout text changes, check "Try this" ticks, check the lab stops its animation loop when the page changes, on desktop and phone width, in English and Hebrew (right-to-left).
- **Consistency:** one test per lab that runs the same inputs through the lab and through the full `step()` and checks they agree, so a future physics change cannot quietly make the lessons wrong.

## Risks and open decisions

- **Model accuracy.** The sail coefficients are empirical (see `docs/PHYSICS.md`). A lab makes them very visible, so each lab caption should say it shows *this simulator's model*, in one short line, not repeated warnings.
- **Phone space.** On a phone the figure sits above the text; a lab with sliders needs a compact layout (controls under the drawing, max ~45% of screen height).
- **Scope creep.** A lab that grows into a mini sailing game loses the point. Keep to the "two controls, one effect" rule.
- **Prop walk** (Lab 11) needs a model change first; decide whether to add it before building that lab.
- **Translation load.** Each lab adds roughly 15–30 strings in six languages.
