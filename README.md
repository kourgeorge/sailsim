# SAIL — browser sailing simulator

An original Three.js sailing simulator with a structured school, independently controlled yacht systems, and a fictional island practice area. Inspired by the educational themes of eSail's public website.

## Run

```sh
npm install
npm run dev
```

Open **http://localhost:5187**. Port 5187 is reserved in the Vite configuration to avoid other local applications.

```sh
npm run build                  # Production bundle in dist/
npm run preview               # Serve the production build
npm test                      # Physics, assessment, scenario, and locale tests
node scripts/browser-check.mjs # Browser checks with the dev server running
node scripts/check-locales.mjs # Six-language desktop/mobile browser checks
node scripts/check-training-scenarios.mjs # All 19 practices through real simulation inputs
```

The browser checks use Playwright Chromium. If necessary install it with `npx playwright install chromium`. Screenshots are saved in `artifacts/`.

## Implemented

- Detailed yacht with shaped hull and sails, teak deck, winches, clutches, lines, lifelines, fenders, and live cockpit instruments. Reflective water, irregular islands, village, lighthouse, marina, and navigation marks.
- 36 lessons across nine modules, 72 explained knowledge questions, and 19 ordered practical exercises. The course covers preparation, handling, trim, maneuvers, conditions, navigation, rules, arrival/departure, and emergency decisions.
- Full course and interface in **English, Spanish, Arabic, Hebrew, Russian, and French**. Arabic and Hebrew use right-to-left layouts while physical helm direction and charts retain their orientation. Use the header selector or `?lang=es` (also `en`, `ar`, `he`, `ru`, `fr`).
- Independent main/jib hoists and sheets, two reefs, traveler, vang, outhaul, ahead/neutral/astern engine, anchor, and rode length. Sail hoist sliders represent exposed area rather than physical rope handling.
- Apparent wind from vector velocities, empirical sail forces, inertia and drag, speed-dependent steering with astern reversal, leeway, steady current, heel, shoreline grounding, and an anchor swing constraint with scope feedback.
- Explicit assessed attempts, continuous performance checks, explained quiz feedback, sequential mastery, saved progress, and an exportable learner record. Language changes preserve completed evidence and restart active practice.
- Free sailing and an ordered three-buoy course.
- Chase, Helm, Cockpit, and Aerial cameras; drag to orbit and scroll to zoom.
- Live chart, true/apparent wind, heading, speed through water, speed/course over ground, depth, and adjustable wind/current.
- Responsive touch controls and keyboard shortcuts: arrows to steer/trim, Space to pause, C to center helm, M for the chart.

The physics is an empirical training model, **not calibrated against a real yacht or sea trials**. Visual waves do not apply hull forces. Prop walk, loaded line handling, spring lines, dock/vessel collision, changing tides, backing sails, and physical casualty recovery are not modeled. Docking and emergencies are taught as planning and decision-making; they do not award practical handling competence. Anchor lessons assess sequence and settling, not real seabed holding. Grounding requires reset. The chart is fictional.

Translations were authored and checked by coding agents; nautical instructor/native-speaker review is still needed. Browser checks use software WebGL and can be slow; native GPU frame rates have not been verified. Google Fonts is optional, with system fallbacks. The simulator is preparation for supervised sailing instruction.

See [curriculum and assessment](docs/CURRICULUM.md), [physics contract](docs/PHYSICS.md), [localization](docs/LOCALIZATION.md), and [Git rollback workflow](docs/DEVELOPMENT.md).

## Reference archive

The requested page is included alongside every public URL in the site's WordPress sitemap:

- `reference/esail/index.html` — searchable local page and image browser.
- `reference/esail/all-text.md` — combined text, with original source URLs.
- `reference/esail/pages/` — original HTML and extracted text for each page.
- `reference/esail/images/` — downloaded image assets including responsive sizes.
- `reference/esail/manifest.json` — provenance, per-page images, local filenames, retrieval time, and failed downloads.
- `reference/esail/sitemaps/`, `styles/`, `robots.txt` — discovery sources.

Collected **69 pages**, **234 images** (~15.7 MB), and **228,997 text characters**. Two image references return HTTP 404: `chris-colour-100x100.jpg` and `eSail-guiding-star.png`. They are recorded as failures, not silently omitted.

Scope: sitemap-listed public pages and their same-host image references, including inline/CSS images, posters, and responsive variants. This is not a guarantee of every unlinked server asset. Translated mirrors absent from the sitemap, third-party embeds, tracking pixels, video files, and dynamically loaded third-party content are excluded. The extraction preserves page text including navigation and footer repetitions; it does not transcribe images or videos. Source HTML is archived as evidence, not incorporated into the simulator.

Refresh/resume the archive:

```sh
npm run scrape
python3 scripts/build_archive_index.py
```

The scraper uses Python's standard library and curl, caches successful downloads, and uses up to three concurrent page requests and four asset downloads. Delete a particular cached file to re-fetch it. Text/image ownership remains with the original rights holders. The app has original branding, lesson prose, and generated 3D geometry, and is not affiliated with eSail.

## Code

- `src/physics.js` — simulation state and dynamics.
- `src/scene.js`, `src/rendering/` — Three.js world, yacht, materials, and cameras.
- `src/main.js` — integration, modes, and chart.
- `src/controls.js`, `src/vessel-controls.js` — vessel panel and synchronized commands.
- `src/learning/` — authored curriculum, assessment engine, and learner interface.
- `src/i18n/`, `public/locales/` — language runtime, interface dictionaries, and course packs.
- `src/style.css`, `src/systems.css` — responsive interface.
- `scripts/scrape_esail.py` — resumable reference collection.
