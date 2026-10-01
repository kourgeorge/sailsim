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
```

The development server must be running on port 5187 for browser checks. Software-rendered browser tests are intentionally allowed longer startup and frame times than hardware-accelerated interactive browsers. A passing numerical test is evidence about the implementation, not validation against a real yacht or safety certification.

The physics contract and its limits are in `PHYSICS.md`; the teaching and assessment contract is in `CURRICULUM.md`. Changes to physics or controls must be checked against actual training scenarios, not only isolated equations.

Run browser suites sequentially on machines using software WebGL. Keep the source unchanged while testing the development server: Vite hot reload can restart a practice or invalidate a page operation. Dialogs pause physics while open; closing one restores the prior sailing state; hiding the browser tab pauses sailing and requires explicit resume.

Useful historical checkpoints:

- `cc541da`: original in-progress simulator and reference archive.
- `ce783ee`: assessed curriculum, vessel systems, and detailed scene.
- `7e331db`: stricter trim/reef/anchor evidence, persistent grounding, and corrected paused anchor feedback.

The subsequent multilingual interface checkpoint includes all six course packs, RTL layouts, browser verification scripts, and screenshots. Use `git log --oneline` for its exact commit ID.

Verified on 2026-10-01 after the instrument/rig/assessment audit: **188 automated tests passed**, including all 19 physical scenarios through the production physics engine, and the production bundle built. The full controls/training/mobile/archive browser check passed. Targeted browser regressions verified keyboard focus/modifier isolation, north-bearing scoring at 360° and 359.5°, restored debriefs with missing action evidence, six sail/reef configurations, mirrored traveler/vane transforms and the actual yacht update at 10/60 Hz. Evidence is in `artifacts/browser-check.json`, `artifacts/keyboard/results.json`, `artifacts/training/assessment-fixes-result.json` and `artifacts/rig-visual-diagnostics.json`, with adjacent screenshots.

The earlier six-language desktop/mobile and 200% text checks remain in `artifacts/locales/`, `artifacts/training/` and `artifacts/maneuvers/`; this audit changed no display translations or layout. The current unit suite revalidates all translated scenario grading metadata. These browser runs use software WebGL; hardware GPU performance, real-yacht calibration and independent instructor/native-language review remain unverified. Consult `ROADMAP.md` for the remaining capability gaps rather than treating green regression checks as completion of the overall simulator goal.
