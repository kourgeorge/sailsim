# Development and rollback

This project has its own Git repository at `sail/.git`. No remote hosting or public publication is configured.

The first commit, `cc541da`, preserves the in-progress simulator, collected reference archive, and initial curriculum before the integrated training/controls release. It is a recovery checkpoint, not a claim that the intermediate code was fully verified.

## Review changes

```sh
git status --short
git log --oneline --decorate
git diff
```

Before a risky change, make a focused commit after checking the diff. Keep generated screenshots with the change they validate. Cached dependencies and the production build are ignored.

## Safely inspect an older version

Use a separate worktree so local work remains intact:

```sh
git worktree add ../sail-review <commit-id>
cd ../sail-review
npm ci
npm run dev -- --port 5188
```

Use a different port from the active development server. Review the earlier version before deciding what to restore. A port conflict does not indicate a broken application.

## Roll back a change

For a committed change that should be undone while preserving history, inspect it and use `git revert <commit-id>`. For a particular file, inspect `git show <commit-id>:<path>` first, then selectively restore it from that commit. Do not use a blanket hard reset when there may be uncommitted work worth preserving.

## Validation

```sh
npm test
npm run build
node scripts/browser-check.mjs
node scripts/check-locales.mjs
node scripts/check-training-scenarios.mjs
node scripts/check-keyboard-controls.mjs
node scripts/check-decision-training.mjs --assessment-fixes
node scripts/check-rig-visuals.mjs
node scripts/check-activity-status.mjs
node scripts/check-live-practice.mjs # Real UI beam reach, shared targets, paused pixel stability and automatic finish
node scripts/check-live-practice.mjs --layout # Desktop mission rail, mobile 200%, Helm/Cockpit views, end/reset and chart assessment
node scripts/check-live-practice.mjs --dashboard # Compact sharp-text readouts in every camera, RTL, 200%, enlarged view and water wind
node scripts/check-cockpit-visuals.mjs # Dry cockpit, one display, RTL and frozen scene
node scripts/check-anchor-visuals.mjs
node scripts/check-anchor-monitor.mjs
node scripts/check-anchor-monitor.mjs --training-sog
node scripts/check-anchor-monitor.mjs --training-layout # Visible live rode feedback, English/Arabic
```

The development server must be running on port 5187 for browser checks. Software-rendered browser tests are intentionally allowed longer startup and frame times than hardware-accelerated interactive browsers. A passing numerical test is evidence about the implementation, not validation against a real yacht or safety certification.

The physics contract and its limits are in `PHYSICS.md`; the teaching and assessment contract is in `CURRICULUM.md`. Changes to physics or controls must be checked against actual training scenarios, not only isolated equations.

Run browser suites sequentially on machines using software WebGL. Keep the source unchanged while testing the development server: Vite hot reload can restart a practice or invalidate a page operation. Utility dialogs pause physics while open and restore the prior state when closed. Practice briefings and the lesson reader leave boat handling paused on dismissal; starting or resuming is explicit; hiding the browser tab pauses sailing and requires explicit resume.

Useful historical checkpoints:

- `cc541da`: original in-progress simulator and reference archive.
- `ce783ee`: assessed curriculum, vessel systems, and detailed scene.
- `7e331db`: stricter trim/reef/anchor evidence, persistent grounding, and corrected paused anchor feedback.

The subsequent multilingual interface checkpoint includes all six course packs, RTL layouts, browser verification scripts, and screenshots. Use `git log --oneline` for its exact commit ID.

The 2026-10-01 instrument/rig/assessment audit passed **188 automated tests**, including all 19 physical scenarios through the production physics engine, and the production bundle built. The full controls/training/mobile/archive browser check passed. Targeted browser regressions verified keyboard focus/modifier isolation, north-bearing scoring at 360° and 359.5°, restored debriefs with missing action evidence, six sail/reef configurations, mirrored traveler/vane transforms and the actual yacht update at 10/60 Hz. Evidence is in `artifacts/browser-check.json`, `artifacts/keyboard/results.json`, `artifacts/training/assessment-fixes-result.json` and `artifacts/rig-visual-diagnostics.json`, with adjacent screenshots.

The subsequent anchoring increment passed **212 automated tests**, including all 19 physical exercises, and the production build. Browser checks covered stowed, pending, suspended, slack, taut, dragging, weighed and reset anchor states. Rendered cable endpoints match the visible bow and simulated anchor; deployment adds one draw call with all visible meshes submitted. The monitor passed lifecycle, chart, six-language and 200% text checks at 1440 and 390 px widths. The compact header activity control also passed study/running/paused/review transitions and Arabic mobile checks. Evidence is in `artifacts/anchor-visual-diagnostics.json`, `artifacts/anchoring/monitor-result.json` and `artifacts/activity/results.json`, with adjacent screenshots. Two later monitor wording corrections (rode length versus paid-out line, and taut geometry versus measured load) passed the translated-copy tests and a fresh production build.

The normal browser UI completed “Stop, then anchor” in 204.7 simulated seconds with 100/100, using ordinary controls and no injected state or elapsed-time shortcuts. Recorded ground speeds were 0.770 kn at the coasting checkpoint and 0.192 kn after settling, with real modeled seabed contact at the anchor checkpoint. The live target changed from 0.80 to 0.20 kn; sail stages hid the row, and weighing anchor showed ground speed without a stopping limit. Evidence and the rendered debrief are in `artifacts/anchoring/training-sog-result.json` and adjacent `training-*.png` screenshots.

After the final source edits, the full controls/training/cameras/mobile/archive browser regression passed again (`artifacts/browser-check.json`), including switching the exclusive vessel-system sections and the updated deployment labels. No uncaught browser or shader errors were recorded.

The earlier six-language desktop/mobile and 200% text checks remain in `artifacts/locales/`, `artifacts/training/` and `artifacts/maneuvers/`. The current unit suite revalidates all translated scenario grading metadata. These browser runs use software WebGL; hardware GPU performance, real-yacht calibration and independent instructor/native-language review remain unverified. Consult `ROADMAP.md` for the remaining capability gaps rather than treating green regression checks as completion of the overall simulator goal.

The timed-windlass increment passed **232 automated tests** and the production build. All 19 physical exercises complete under the production solver; anchoring/departure/capstone now take approximately 182.8/194.7/606.5 simulated seconds. The new anchorage tests sample the entire swing-plus-hull envelope and reject the former capstone site, despite its clear boat track. Powered rates remain explicit model assumptions; manufacturer maximum speeds are not treated as loaded operating calibration.

The compact header status regression passed again, including Arabic mobile at 200% text. The anchor rendering harness passed 13 states spanning actual lowering, stopping, paused target edits, recovery, breakout, final stowage, loaded recovery, dragging and reset. It measured continuous endpoint/orientation transitions and unchanged one-draw-call deployment overhead. Screenshots and geometry measurements are in `artifacts/activity/` and `artifacts/anchor-visual-diagnostics.json`.

The updated anchor monitor/browser lifecycle also passed progressive short payout and recovery, stopped motor behavior while sailing, unchanged physical geometry after a paused target edit, and prepared 45 m bottom geometry. All six languages passed control-label and overflow checks at desktop/mobile widths (1440/390 px) with 200% text. Evidence is in `artifacts/anchoring/monitor-result.json` and adjacent screenshots. An initial harness-only navigation error was corrected to switch from free sailing to learning before selecting the departure lesson.

The final timed training browser run passed both anchoring lessons at 100/100 through normal controls. Lesson 31 completed in **183.198 simulated seconds**, with 45 m actually paid, a 45 m target, stopped motor, bottom contact and 0.192 kn ground speed. Lesson 32 physically recovered all rode before its first checkpoint at **181.5 seconds**, then raised and trimmed both sails and completed departure at **198 seconds**. Both saved reports carry `windlassAssessmentVersion: 1`; debriefs show actual/target rode and motor evidence. See `artifacts/anchoring/training-sog-result.json`. Earlier harness-only errors (a stale mainsheet selector and omitted sail trim) were corrected before this passing run.

The live practice card now hides its generic introductory copy during an active attempt, making room for ground-speed and rode feedback without enlarging the panel. The focused `--training-layout` browser check passed English and Arabic at default desktop size and 200% mobile text, with screenshots in `artifacts/anchoring/training-layout-*`. The production build passed after this CSS adjustment.

The final general browser regression passed after all source changes: training and persistence, independent vessel controls, timed anchor handling, header Pause/Resume with the systems drawer open, cameras, mobile layout and reference archive. No uncaught browser or shader errors were recorded. Current evidence is in `artifacts/browser-check.json` and adjacent screenshots.

## Practice launch contract

`Start training` prepares the authored exercise and opens `#practice-briefing` over the simulator. Preparation must not create an attempt, run a timer or award evidence. `#practice-launch` begins scoring. Study material is a separate full-page reader; its practice buttons use the same preparation path. Reopened task briefings pause and preserve an active attempt. End simulation saves an interrupted result without awarding completion. The large lesson number/title is a cover and stays hidden while physical practice is active or paused.

`check-activity-status.mjs` covers the Hebrew beam-reach report, authored setup after changing preview weather, dismissal/resume, study return, explicit end, actual instrument checkpoints scoring 50 then 100, prerequisite preview behavior, decision scenarios, free sailing, and all six languages at 200% on mobile. Other browser helpers explicitly click Start simulation after preparing a new attempt.
