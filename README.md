# SAIL — browser sailing simulator

An original Three.js sailing simulator with a multilingual sailing school, independent yacht controls and three fictional practice areas. Inspired by the educational themes of eSail’s public website; not affiliated with eSail.

**Play online:** https://kourgeorge.github.io/sailsim/ · [עברית](https://kourgeorge.github.io/sailsim/?lang=he)

GitHub Actions tests, builds, and deploys GitHub Pages on every push to `master`. The production build uses `/sailsim/` as its base path; local development stays at `/`.

## Run and check

```sh
npm install
npm run dev
```

Open **http://localhost:5187**. The development server reserves port 5187.

```sh
npm test                                  # Physics, assessment, content and state tests
npm run build                             # Refresh reference library; build dist/
npm run test:browser                      # Production-build regressions; starts/stops its own preview server
npm run format:check                      # Check formatting of the refactored application modules
npm run preview                           # Serve the production build
node scripts/browser-check.mjs            # Core browser checks
node scripts/mobile-check.mjs             # Full-screen mobile scene, overlay sheets and touch controls
node scripts/check-locales.mjs            # Six-language desktop/mobile checks
node scripts/check-new-features.mjs        # Text sizing, engine drills and replay
node scripts/check-training-scenarios.mjs  # All 19 assessed sailing practices
node scripts/check-decision-training.mjs --locales  # Scenarios, direct launch, scoring and six languages
node scripts/check-activity-status.mjs  # Explicit study/ready/running/paused states
node scripts/check-collision-visuals.mjs  # Real contacts and both-body visual response
node scripts/check-keyboard-controls.mjs # Browser shortcuts, focus and sailing-key isolation
node scripts/check-decision-training.mjs --assessment-fixes # North bearings and restored reports
node scripts/check-rig-visuals.mjs        # Traveler, masthead wind pointer, reef/hoist and boom timing
node scripts/check-anchor-visuals.mjs     # Actual anchor/rode deployment and rendered attachments
node scripts/check-anchor-closeup.mjs    # Live underwater inset, rendering states and responsive placement
node scripts/check-scene-layout.mjs      # Lesson spacing, grouped cameras and default text sizing
node scripts/check-practice-panel.mjs    # Stable live requirements across six languages and text sizes
node scripts/check-anchor-monitor.mjs    # Anchor controls/chart and six-language large-text monitor
node scripts/check-anchor-monitor.mjs --training-sog # Natural stopping/anchoring and saved ground-speed evidence
node scripts/check-anchor-monitor.mjs --training-layout # Visible live rode feedback, English/Arabic
```

Browser scripts require the development server and Playwright Chromium (`npx playwright install chromium` if missing). Run browser suites sequentially, especially with software WebGL. Results and screenshots go in `artifacts/`.

`npm run test:browser` uses the production build and owns port 5198. It covers multi-tab progress, language changes, desktop/mobile training, music muting and exclusive source switching, rendered audio signals, and real WebGL pause/resume rendering. UI state tests use the supported WebGL fallback; the rendering test uses Chromium's software GPU. Failures retain screenshots and traces in `test-results/`. GitHub Pages deployment runs this suite before uploading the site.

## Free-sailing ambience

Free sailing plays one source at a time: Sail relaxing, waves, a live Radio Paradise mix, or **radio classical** from [Radio Swiss Classic](https://www.radioswissclassic.ch/en/reception/internet). The sound menu links to the selected station's provider. Music and waves are original, looping MP3 assets shipped with the app. Local files decode once and loop on the audio thread; radio uses a native media player. A Web Audio context configured for playback handles volume, avoiding live synthesis, convolution reverb, and main-thread loop restarts while the phone renders the scene. Only the last local file is retained in the decoded cache. Radio requires internet; built-in files are loaded from the same site and can use the browser cache.

The sound button cycles through **High (100%) → Medium (50%) → Mute**. Open its arrow in the scene toolbar (in the mobile menu) for the source dropdown, volume slider and mute button. Both controls share the same background volume: slider values above 50% show High, lower audible values show Medium, and zero shows Mute. Raising the slider unmutes; the menu's mute button restores the previous volume. These controls affect only background music, waves, and radio. The helm horn (button or **B**) and other vessels' horn signals keep their own volume and remain audible while background audio is muted. Source, mute, and volume preferences survive reloads. Switching sources stops the previous audio before the replacement becomes audible. Playback stops on pause or when leaving Free sailing, suspends in hidden tabs, and never starts in lessons or challenges. The audio context is created from a user gesture and stays ready for horns during active sailing; browsers that block sound offer an explicit retry.

Regenerate the original audio files with `node scripts/generate-sailing-audio.mjs` (requires Playwright Chromium and ffmpeg). The score and wave generator live in `src/audio/soundscape.js` and are not bundled into the app. Committed assets make normal builds independent of those generation tools.

## Changing weather and wildlife

Free sailing and fleet races default to **Changing weather**. Choose **Fixed weather** in free-sailing Conditions or the race briefing to hold the settings steady. Wind speed and direction make a gradual, bounded random walk around the starting preset; current changes more slowly, and zero-current presets stay still. Pausing also pauses the weather. Assessed lessons, missions and maneuvering drills retain their authored conditions.

Each race course uses a repeatable weather sequence shared by every competitor. Fixed and changing-weather personal bests are stored separately. Free sails get a fresh sequence; restarting a voyage restores the selected starting preset.

Near shore, deer, goats, foxes, rabbits and wild boar appear alone or in small groups, using irregular wildlife sighting intervals. Their foraging paths avoid water, buildings, trees, rocks and other group members. Cruise ships now share their visible hull outline with the collision solver, so contact blocks and pushes the yacht.

## Scene capture

The camera button stays in the active simulation toolbar on desktop, tablet and mobile, including while paused. It captures the current 3D view as a PNG without menus or controls, then offers a preview and **Save image**. Browsers that support sharing image files also offer **Share image** using the device's share sheet. Images stay on the device until the user saves or shares them. Captures are limited to 2048 pixels on the longer edge; the normal renderer does not retain an extra drawing buffer between frames.

## Sailing school

**52 lessons, 13 modules, 104 explained questions, 23 assessed boat-handling practices and 29 interactive seamanship scenarios (87 stages).** Start training opens the lesson’s practice briefing; Study material opens the separate illustrated reader. Every lesson requires its training evidence and knowledge check for sequential mastery. Study pauses and resumes the current task.

| Level | Lessons | Focus |
|---|---|---|
| Basic | 01–16 | Crew safety, wind, helm, trim and fundamental maneuvers |
| Intermediate | 17–36 | Sail power, navigation, harbor planning and emergency decisions |
| Advanced | 37–52 | Coastal decisions, marina handling, collision avoidance, and twin-engine catamarans |

Lessons **46–51**, **Give way and avoid collisions** (פינוי דרך ומניעת התנגשויות), cover tack and overtaking, powered and mixed encounters, give-way and stand-on actions, special vessel status, channels and traffic lanes, lights and signals, and restricted visibility. The six illustrated lessons include 18 decision stages and direct references to the International COLREGs. All six languages are supported; existing lesson IDs and progress records stay intact. These are core encounter lessons, not the complete lights syllabus, local navigation law or a sailing qualification.

The full-page illustrated reader presents concepts, observations, questions and takeaways in steps. Reading a page does not award assessment credit. The interface, lessons and **13 contextual guides** support **English, Spanish, Arabic, Hebrew, Russian and French**, with RTL reading layouts for Arabic and Hebrew. Text size is adjustable from **100–200%**, defaults to **100%**, and is saved in the browser. Select a language in the header or use `?lang=es` (`en`, `ar`, `he`, `ru`, `fr` also work).

The searchable learning library contains **26 verified official-source records** with original English research notes, retrieval provenance and source links. Source documents retain their published language. Emergency lessons 33–34 can be studied immediately; level labels are learning stages, not qualifications.

## Simulator

Learn to sail, Free sailing and Challenges each have a cover page outside the
immersive session, on desktop and mobile. Browse lessons from the learning cover;
choose waters, conditions and sound before starting a free sail; or pick a mission,
race or engine drill from the Challenges cover. Exit returns directly to that
section's cover. Completed and ended attempts remain available through View debrief
or Review last attempt. Pause and utility dialogs preserve the current session.

**Challenges** now includes five scored missions alongside the fleet races:

| Challenge | Objective |
|---|---|
| Rescue Run | Return to a drifting person-overboard marker and hold safely alongside in neutral. |
| Treasure Chart | Solve three sequential bearing clues; optional target reveals cost 10 points each. |
| Anchor Bullseye | Settle inside a target circle with actual bottom contact, completed payout and at least 4:1 scope. |
| The Shallow Shortcut | Choose an inner or outer passage around Pine Island, keeping at least 1 m beneath the keel across the hull. |
| One-Tack Wonder | Reach an upwind finish with one established tack; a second tack or a gybe ends the attempt. |

Each mission has authored conditions, a briefing, live requirements, a time limit,
Gold/Silver/Bronze medals, a recorded sailing path and a saved personal best.
Grounding or hull contact ends the attempt. Treasure Chart and One-Tack Wonder
disable the engine; the other missions start with sails lowered and allow it.
Pause, utility dialogs, Exit and Restart use the shared simulation lifecycle.
All six interface languages and mobile layouts are supported. These missions
assess the existing simulator model, including a visual rescue marker rather
than physical casualty recovery. Best scores are stored separately from course
progress under `sail-challenge-best-v1:<id>`.

**Challenges → Race the fleet** offers three races against Skye, Amber and Coral:
Harbor Sprint (a short triangular course), Windward Duel (tacking and downwind
sailing), and Channel Chase (a passage with cross-current). Choose Relaxed, Club
or Expert difficulty, choose changing or fixed weather, then start the
five-second countdown. Sail through the numbered rings in order; the final ring
is the finish. Colored bot yachts and chart markers, live position, course
progress and finish results share the same race state. Personal best times are
saved separately for each course, difficulty and weather mode. Pausing freezes the whole fleet.

Rivals steer and trim using the same yacht physics as the player; difficulty
changes their trim and steering rather than adding a speed boost. Engines are
disabled and all boats share the same wind/current conditions. These are informal
checkpoint races, without formal racing-rule adjudication. Each race has a
15-minute limit. The original engine drills and solo buoy course remain available
from **Engine drills & buoy course** in Challenges.

- Detailed yacht with a live multifunction screen behind the wheel: chart, speed through water/over ground, heading/course, depth, wind, helm and throttle. Larger translated labels and a higher-resolution texture improve the onboard screen; a compact strip below the controls repeats the readings as sharp, scalable text in every camera view. The ↗ control opens enlarged readings. Practice starts at the helm; the dashboard’s ↗ control enlarges the instrument readings. Pausing freezes water, cloud and vessel animation while camera movement remains available. The cockpit sole is continuous and the ocean is excluded from the hull interior.
- Three fictional maps: **Haven Islands**, **Shelter Bay** and **Windward Strait**. Chart, cockpit plotter, coastlines and depth model share location data.
- Weather settings describe wind over ground. Instruments and points of sail use wind over water (weather air velocity minus current); apparent wind describes the airflow aboard. The model's no-go and sail-shape rules now preserve force consistency under uniform changes of reference frame. These numerical checks do not calibrate the empirical sail coefficients to a real yacht.
- Independent main/headsail hoists and sheets, two reefs, traveler, vang, outhaul, engine ahead/neutral/astern, anchor and rode length.
- Compact cockpit control groups expose steering, both sheets, engine/neutral, independent hoists, reef selection and anchor target/payout directly below the scene. Systems keeps the finer rig adjustments. Early acceleration practice starts with sails lowered; navigation starts require steering before credit, with untouched-start regressions across all 19 physical lessons.
- On mobile, the sea fills the viewport. Floating Menu and Lesson buttons open navigation/settings and the numbered lesson picker without reserving screen space. The active goal appears as a compact overlay; its lesson sheet contains progress and practice actions. Play/pause and folding Boat controls float at the bottom. Speed, heading and depth overlays are optional via Show instruments. Menu and lesson sheets pause the simulation while open and preserve its previous playback state when dismissed.
- Timed powered windlass with separate rode target and actual paid length, stop/resume controls, and recovery that waits for unloaded rode. Bow-based 3D anchor/rode, a six-language illustrated monitor and the chart share physical geometry. Assessments require actual payout or full stowage; stopping includes current and sideways drift.
- Apparent-wind vectors, empirical sail forces, inertia, drag, speed-dependent steering and astern reversal, leeway, steady current, heel, grounding and a simplified anchor constraint.
- A separate **three-drill maneuvering lab**: controlled ahead stop, astern steering corridor and precision approach/stop. Debriefs use the **actual recorded track**, control/speed history, measured results and replay. Lab records are separate from the 23 course practices.
- Free sailing, a three-buoy route, live chart and wind/current controls. Touch controls and keyboard shortcuts, labelled next to each control: ← → steer, ↑ ↓ mainsheet, Q/A headsail sheet, W/S engine ahead/astern, C center the helm, N engine neutral, B sound the horn in Free sailing, H raise/lower sails, R reef, L anchor, Space start/pause, M chart, K help. Start/pause, Conditions and Reset sit together in the top bar.

The physics is **not calibrated against a real yacht or sea trials**. Visual waves do not apply hull forces. Prop walk, loaded line handling, spring lines, collision damage, changing tides, detailed backed sails and physical casualty recovery are not modeled. Hull contact moves and rotates movable vessels and buoys, while fixed docks and rocks remain stationary. Engine drills assess open-water model control. Lessons 43–45 assess marina entry, berth positioning and departure in the model; they do not assess mooring-line handling or real-world docking competence. Anchor exercises assess modeled sequence and settling, not real seabed holding. All maps are fictional. Course completion is a study record, not certification or permission to skipper.

Translations still need nautical instructor/native-speaker review; hardware-GPU performance needs independent measurement. The app supports preparation for supervised on-water instruction.

## Source and documentation

| Location | Purpose |
|---|---|
| `src/physics.js` | State, forces and integration |
| `src/activity/controller.js`, `src/app-shell.js` | Playback/overlay rules and application shell |
| `src/learning/progress-store.js`, `src/learning/training-report.js` | Cross-tab course persistence and debrief rendering |
| `src/navigation/chart.js` | Shared chart drawing |
| `src/scene.js`, `src/rendering/`, `src/locations.js` | Yacht, environment, cameras and maps |
| `src/learning/` | Curriculum, reader, figures, guides, assessment and maneuvering lab |
| `src/accessibility/`, `src/i18n/`, `public/locales/` | Text sizing, language runtime and translated content |
| `reference/sailing/` | Official-source manifests and original research notes |
| `scripts/build-learning-library.mjs` | Builds `public/learning-library.json`; also runs during production builds |

See [curriculum](docs/CURRICULUM.md), [physics](docs/PHYSICS.md), [localization](docs/LOCALIZATION.md), [course-level research](docs/COURSE_LEVELS_RESEARCH.md), [prioritized roadmap](docs/ROADMAP.md) and [Git checkpoints/rollback](docs/DEVELOPMENT.md).

## eSail reference archive

`reference/esail/index.html` browses the collected **69 public sitemap pages and 234 images**. `all-text.md`, `pages/`, `images/` and `manifest.json` retain source text, files and provenance. Two unavailable images are recorded as HTTP 404 failures. Scope is sitemap-listed public pages and their same-host image references, not every unlinked asset, embedded service or video.

Refresh with `npm run scrape`, then `python3 scripts/build_archive_index.py`. The scraper caches successful files. Source ownership remains with the original rights holders; archived HTML and images are reference material, while the app uses original branding, lesson prose and generated 3D geometry.

Training scores, critical failures, saved debriefs and progress migration are documented in [PRACTICE_SCORING.md](docs/PRACTICE_SCORING.md). Scenarios assess their stated modeled tasks; course completion is not an on-water qualification.

Start training opens a short **practice briefing over the prepared boat**. The briefing identifies the lesson by number and title and lists its authored starting conditions: location, wind source and speed, current destination and speed, heading, boat speed, and sail setup. Its **Start simulation** button begins assessment; reading the illustrated lesson is optional. The lesson cover disappears during live practice. The lesson’s current goal, live requirement values and targets, continuous-hold timer, completed-goal count, live score, and pause/resume/end controls stay available. The feedback and judge share the same requirement evaluator; speed alone cannot pass a wind-angle task. Completing the final goal automatically pauses the boat and opens the scored debrief. Reopening the briefing or reading pauses the same attempt until explicit resume. End simulation saves the completed evidence and shows a debrief. The scene toolbar offers compact pause/resume controls only once a lesson is active. There is no separate Ready/Prepare panel. Custom weather and boat reset are available outside lesson mode; assessed lessons keep their authored conditions. On mobile, pause/resume stays beside the boat-controls drawer, while free-sailing conditions live in the menu.

Boat and object contacts now use shared finite hulls and rigid-body impulses. Free vessels move and turn when struck; moored vessels and buoys respond within their restraints, while piers and rocks remain fixed. See [COLLISION_PHYSICS.md](docs/COLLISION_PHYSICS.md) for units, validation and model limits.
