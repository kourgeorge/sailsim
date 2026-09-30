# SAIL — browser sailing simulator

An original, playable Three.js prototype inspired by the sailing education themes on eSail's public website.

## Run

```sh
npm install
npm run dev
```

Open **http://localhost:5187**. Port 5187 is reserved in the Vite configuration to avoid other local applications.

```sh
npm run build                  # Production bundle in dist/
npm run preview               # Serve the production build
npm test                      # Sailing physics tests
node scripts/browser-check.mjs # Browser checks with the dev server running
```

The browser checks use Playwright Chromium. If necessary install it with `npx playwright install chromium`. Screenshots are saved in `artifacts/`.

## Implemented

- Original 3D yacht, animated water, four islands, lighthouse, small marina, and navigation marks.
- Wind-dependent speed, point of sail, no-go zone, mainsheet trim, reefing, steerage, heeling, shallow-water grounding, and simplified anchoring.
- Six guided exercises with browser-local completion history.
- Free sailing and an ordered three-buoy course.
- Chase, helm, and aerial cameras; drag to orbit and scroll to zoom.
- Live chart, compass/wind instrument, speed, heading, depth, and adjustable wind.
- Responsive touch controls and keyboard shortcuts: arrows to steer/trim, Space to pause, C to center helm, M for the chart.

This is a foundation, not a full eSail replacement. Mooring lines, winches, sail deformation, currents/tides, engine handling, collision with docks/other vessels, and man-overboard exercises are not implemented. Sailing dynamics use a simplified polar curve, not a validated hydrodynamic model. Anchoring is a brake; the chart and geography are fictional. Grounding currently requires resetting the boat. Google Fonts is optional; system font fallbacks work offline.

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
- `src/scene.js` — Three.js world, yacht, water, and cameras.
- `src/main.js` — controls, lessons, modes, and chart.
- `src/style.css` — responsive interface.
- `scripts/scrape_esail.py` — resumable reference collection.
