# SAIL — browser sailing simulator

An original Three.js sailing simulator with a multilingual sailing school, independent yacht controls and three fictional practice areas. Inspired by the educational themes of eSail’s public website; not affiliated with eSail.

## Run and check

```sh
npm install
npm run dev
```

Open **http://localhost:5187**. The development server reserves port 5187.

```sh
npm test                                  # Physics, assessment, content and state tests
npm run build                             # Refresh reference library; build dist/
npm run preview                           # Serve the production build
node scripts/browser-check.mjs            # Core browser checks
node scripts/check-locales.mjs            # Six-language desktop/mobile checks
node scripts/check-new-features.mjs        # Text sizing, engine drills and replay
node scripts/check-training-scenarios.mjs  # All 19 assessed sailing practices
```

Browser scripts require the development server and Playwright Chromium (`npx playwright install chromium` if missing). Run browser suites sequentially, especially with software WebGL. Results and screenshots go in `artifacts/`.

## Sailing school

**42 lessons, 10 modules, 84 explained questions and 19 assessed sailing practices.** All lessons remain open for study; saved evidence supports sequential mastery.

| Level | Lessons | Focus |
|---|---|---|
| Basic | 01–16 | Crew safety, wind, helm, trim and fundamental maneuvers |
| Intermediate | 17–36 | Sail power, navigation, harbor planning and emergency decisions |
| Advanced | 37–42 | Coastal planning, tidal clearance, current/time, weather, collision risk and night pilotage; **theory only** |

The full-page illustrated reader presents concepts, observations, questions and takeaways in steps. Reading a page does not award assessment credit. The interface, lessons and **13 contextual guides** support **English, Spanish, Arabic, Hebrew, Russian and French**, with RTL reading layouts for Arabic and Hebrew. Text size is adjustable from **100–200%**, defaults to **125%**, and is saved in the browser. Select a language in the header or use `?lang=es` (`en`, `ar`, `he`, `ru`, `fr` also work).

The searchable learning library contains **25 verified official-source records** with original English research notes, retrieval provenance and source links. Source documents retain their published language. Emergency lessons 33–34 can be studied immediately; level labels are learning stages, not qualifications.

## Simulator

- Detailed yacht, working cockpit displays, reflective water, islands, navigation marks and location-specific coastal scenery. Chase, Helm, Cockpit and Aerial cameras support scene inspection and zoom.
- Three fictional maps: **Haven Islands**, **Shelter Bay** and **Windward Strait**. Chart, cockpit plotter, coastlines and depth model share location data.
- Independent main/headsail hoists and sheets, two reefs, traveler, vang, outhaul, engine ahead/neutral/astern, anchor and rode length.
- Apparent-wind vectors, empirical sail forces, inertia, drag, speed-dependent steering and astern reversal, leeway, steady current, heel, grounding and a simplified anchor constraint.
- A separate **three-drill maneuvering lab**: controlled ahead stop, astern steering corridor and precision approach/stop. Debriefs use the **actual recorded track**, control/speed history, measured results and replay. Lab records are separate from the 19 course practices.
- Free sailing, a three-buoy route, live chart and wind/current controls. Touch controls and keyboard shortcuts: arrows to steer/trim, Space to pause, C to center the helm, M for the chart.

The physics is **not calibrated against a real yacht or sea trials**. Visual waves do not apply hull forces. Prop walk, loaded line handling, spring lines, dock/vessel collision, changing tides, detailed backed sails and physical casualty recovery are not modeled. Engine drills assess open-water model control, not docking competence. Anchor exercises assess modeled sequence and settling, not real seabed holding. All maps are fictional. Course completion is a study record, not certification or permission to skipper.

Translations still need nautical instructor/native-speaker review; hardware-GPU performance needs independent measurement. The app supports preparation for supervised on-water instruction.

## Source and documentation

| Location | Purpose |
|---|---|
| `src/physics.js` | State, forces and integration |
| `src/scene.js`, `src/rendering/`, `src/locations.js` | Yacht, environment, cameras and maps |
| `src/learning/` | Curriculum, reader, figures, guides, assessment and maneuvering lab |
| `src/accessibility/`, `src/i18n/`, `public/locales/` | Text sizing, language runtime and translated content |
| `reference/sailing/` | Official-source manifests and original research notes |
| `scripts/build-learning-library.mjs` | Builds `public/learning-library.json`; also runs during production builds |

See [curriculum](docs/CURRICULUM.md), [physics](docs/PHYSICS.md), [localization](docs/LOCALIZATION.md), [course-level research](docs/COURSE_LEVELS_RESEARCH.md), [prioritized roadmap](docs/ROADMAP.md) and [Git checkpoints/rollback](docs/DEVELOPMENT.md).

## eSail reference archive

`reference/esail/index.html` browses the collected **69 public sitemap pages and 234 images**. `all-text.md`, `pages/`, `images/` and `manifest.json` retain source text, files and provenance. Two unavailable images are recorded as HTTP 404 failures. Scope is sitemap-listed public pages and their same-host image references, not every unlinked asset, embedded service or video.

Refresh with `npm run scrape`, then `python3 scripts/build_archive_index.py`. The scraper caches successful files. Source ownership remains with the original rights holders; archived HTML and images are reference material, while the app uses original branding, lesson prose and generated 3D geometry.
