# Choosing test coverage

Use a small feedback loop while editing, then widen coverage according to the change. Tests stay in the standard Node and Playwright runners; the selection script chooses files and Playwright's `@smoke` tag selects four critical browser journeys. No tests were removed or weakened to make the suite faster.

| Command | When to use it |
| --- | --- |
| `npm run test:quick` | Fast state, launch rules, language preferences and persistence checks |
| `npm run test:changed` | Unit tests affected by staged, unstaged and untracked changes |
| `npm run test:plan` | Preview affected unit/browser files without building or executing them |
| `npm run test:changed -- --browser` | Affected unit tests and browser areas; builds first |
| `npm run test:area -- covers --browser` | An explicit feature area, including browser checks |
| `npm run test:quick -- --browser` | Quick units plus four essential browser journeys; builds first |
| `npm test` | All Node unit/integration tests; preserves the existing command |
| `npm run test:full` | All Node tests, production build, then all browser regressions |

Available areas: `covers`, `activity`, `physics`, `scenery`, `rendering`, `learning`, `localization`, `audio`, `racing`, `challenges`.

Examples:

```sh
# Compare a branch with master, including uncommitted edits.
npm run test:changed -- --base origin/master --list --browser

# Inspect the previous commit after a clean checkout.
npm run test:changed -- --base HEAD^ --browser

# Only the relevant browser group, reusing a build you just verified.
npm run test:area -- covers --browser-only --skip-build

# One regression through the native runner.
node --test tests/buoy-contacts.test.js
npx playwright test tests/browser/vessel-picker.spec.js
```

Use `--skip-build` only when `dist/` matches the current source. The default browser command builds once. Browser tests run sequentially because software WebGL makes parallel browser instances slow and unreliable. Native Node tests retain their normal file concurrency. Standalone screenshot and scenery scripts are manual visual review tools, not prerequisites for every edit.

## How change selection works

`scripts/test-selection.mjs` contains the feature-area map. The `changed` profile follows literal local imports transitively for unit tests (including JSON assets), selects edited tests directly, and uses explicit browser groups for each changed feature. Asset and generated-content edits also include the area's unit suite because their readers may construct filenames dynamically. Documentation and screenshot changes alone do not run application tests. Test/build configuration changes and unmapped runtime paths conservatively select the full suite. Renames are treated as removal plus addition, so former importers are included.

Without `--base`, selection examines local changes against `HEAD`. With `--base REF`, it compares the merge base of that reference and `HEAD` against the working tree. A clean checkout with no base has nothing to test; it does not pretend to validate the last commit. Invalid revisions/options fail rather than skipping silently.

The map is an approximation of behavioral dependencies, not a proof that other features cannot break. Add new feature patterns and browser specs to it as the app grows. A global refactor, dependency upgrade, or change that crosses feature boundaries warrants `test:full`. Physics changes warrant the relevant training/assessment checks as well as numeric checks. Rendering changes warrant an actual WebGL check and visual inspection; fallback tests alone cannot detect shader errors.

## Deployment checks

Pushes to `master` run **affected unit tests, a production build, formatting, and four browser smoke journeys**. The four journeys cover the desktop section/launch lifecycle, desktop sailing setup visibility, mobile world-map sailing without WebGL, and deferred graphics loading. They reuse the production build at the Pages base path.

The deployment workflow's manual `coverage` choice offers `smoke`, `changed`, or `full`. Choose `full` for a broad release/refactor; choose `changed` for affected browser areas. Existing explicit test-skip controls remain available for deployments whose checks were already completed. The workflow prints the selected profile and reasons in its job summary. Focused local checks supplement the mandatory smoke gate; the expensive full browser matrix no longer runs on every push.

Failures retain Playwright screenshots and traces in `test-results/`. No automatic retry is configured, so a failure cannot become a pass merely by rerunning until it succeeds.
