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
```

The development server must be running on port 5187 for browser checks. Software-rendered browser tests are intentionally allowed longer startup and frame times than hardware-accelerated interactive browsers. A passing numerical test is evidence about the implementation, not validation against a real yacht or safety certification.

The physics contract and its limits are in `PHYSICS.md`; the teaching and assessment contract is in `CURRICULUM.md`. Changes to physics or controls must be checked against actual training scenarios, not only isolated equations.

Run browser suites sequentially on machines using software WebGL. Keep the source unchanged while testing the development server: Vite hot reload can restart a practice or invalidate a page operation. Dialogs pause physics while open; closing one restores the prior sailing state; hiding the browser tab pauses sailing and requires explicit resume.

Useful historical checkpoints:

- `cc541da`: original in-progress simulator and reference archive.
- `ce783ee`: assessed curriculum, vessel systems, and detailed scene.
- `7e331db`: stricter trim/reef/anchor evidence, persistent grounding, and corrected paused anchor feedback.

The subsequent multilingual interface checkpoint includes all six course packs, RTL layouts, browser verification scripts, and screenshots. Use `git log --oneline` for its exact commit ID.

Verified on 2026-10-01: 53 automated tests passed, all 19 practical scenarios passed through the production physics engine, the production bundle built, the full controls/training/mobile/archive browser check passed, and all six locale browser checks passed with no uncaught page errors. Browser results are recorded in `artifacts/browser-check.json` and `artifacts/locales/results.json`. These runs used software WebGL; hardware GPU performance and independent instructor/native-language review remain unverified.
