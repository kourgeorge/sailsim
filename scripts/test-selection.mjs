import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, posix } from 'node:path';

// Browser behavior crosses module boundaries. Keep these explicit; unit selection
// additionally follows transitive local imports, including JSON and CSS assets.
export const areas = {
  covers: {
    source:
      /^src\/activity\/(?:section-covers|world-atlas|cover-|vessel-picker)|^public\/(?:section-backgrounds|destination-previews)/,
    unit: /activity-|locations|world-destinations/,
    browser: /section-covers|cover-pager|destination-preload|world-destinations|vessel-picker/,
  },
  activity: {
    source:
      /^src\/activity\/(?!section-covers|world-atlas|cover-|vessel-picker)|^src\/(?:ui|accessibility)\/|^src\/(?:app-shell|main|mobile|style|systems|controls)\./,
    unit: /activity-|progress-store|maneuver-records/,
    browser: /activity|session|scene-loading|dropdowns|mobile-gestures|ipad-swipes/,
  },
  physics: {
    source:
      /^src\/(?:physics|catamaran-physics|collisions|anchor|vessel-controls|vessels|water-depth|weather)\.|^src\/cockpit\//,
    unit: /physics|wind-reference|anchor|collision|buoy-contacts|catamaran|rig-state|practice|maneuvers|weather|labs/,
    browser: /apparent-wind|weather|catamaran-learning|marina/,
  },
  scenery: {
    source:
      /^src\/(?:locations\.|world\/|navigation\/)|^scripts\/(?:build-world|terrain-|research-world)|^public\/(?:destination-previews|terrain-sources)/,
    unit: /locations|world-|coastal|bird-life|land-animals|wildlife|scenic|traffic|cruise|night-navigation/,
    browser: /world-destinations|destination-preload/,
  },
  rendering: {
    source: /^src\/rendering\/|^src\/scene\./,
    unit: /render|rig-state|camera|hull-water|night-navigation/,
    browser: /rendering|capture|world-destinations/,
  },
  learning: {
    source:
      /^src\/learning\/|^reference\/sailing\/|^public\/learning-library|^scripts\/build-learning-library/,
    unit: /learning|practice|decision|scenario|teaching|maneuver|marina|colregs|progress|night-navigation|labs/,
    browser: /activity|debrief-track|colregs|catamaran-learning|marina|labs/,
  },
  localization: {
    source: /^src\/i18n\/|^public\/locales\//,
    unit: /locales|localization|language-preference|learning-library|labs/,
    browser: /language-picker|language-preference/,
  },
  audio: {
    source: /^src\/audio\/|^src\/world\/vessel-horns/,
    unit: /audio|radio|vessel-horns/,
    browser: /audio|radio|horns|player-horn/,
  },
  racing: {
    source: /^src\/racing\//,
    unit: /racing|weather/,
    browser: /racing|weather/,
  },
  challenges: {
    source: /^src\/challenges\//,
    unit: /challenges|collision-assessment/,
    browser: /challenges/,
  },
};

export const smokeUnit = [
  'tests/activity-controller.test.js',
  'tests/activity-state.test.js',
  'tests/language-preference.test.js',
  'tests/progress-store.test.js',
  'tests/test-selection.test.js',
];

const tooling =
  /^(?:package(?:-lock)?\.json|(?:vite|playwright)\.config\.|scripts\/test(?:-selection)?\.mjs|\.github\/workflows\/)/;
const nonRuntime = /^(?:docs\/|artifacts\/|reference\/esail\/)|\.(?:md|txt)$|^\.gitignore$/;

export function inventory(root) {
  return {
    unit: readdirSync(`${root}/tests`)
      .filter((p) => p.endsWith('.test.js'))
      .map((p) => `tests/${p}`)
      .sort(),
    browser: readdirSync(`${root}/tests/browser`)
      .filter((p) => p.endsWith('.spec.js'))
      .map((p) => `tests/browser/${p}`)
      .sort(),
  };
}

function directImports(root, file, cache) {
  if (cache.has(file)) return cache.get(file);
  const dependencies = new Set();
  cache.set(file, dependencies);
  if (!/\.[cm]?js$/.test(file) || !existsSync(`${root}/${file}`)) return dependencies;
  const code = readFileSync(`${root}/${file}`, 'utf8');
  // Literal imports/exports/dynamic imports and URL assets. A broad match can
  // overselect commented imports, which is safer than silently omitting a test.
  const imports = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\bnew\s+URL\(\s*)['"]([^'"]+)['"]/g;
  for (const match of code.matchAll(imports)) {
    if (!match[1].startsWith('.')) continue;
    const path = posix.normalize(posix.join(dirname(file), match[1].split('?')[0]));
    dependencies.add(path);
  }
  return dependencies;
}

export function importedFiles(root, file, cache = new Map()) {
  const visited = new Set(),
    pending = [file];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    for (const dependency of directImports(root, current, cache)) pending.push(dependency);
  }
  visited.delete(file);
  return visited;
}

export function selectTests({
  root,
  files = [],
  profile = 'changed',
  area,
  catalog = inventory(root),
}) {
  const unit = new Set(),
    browser = new Set(),
    reasons = [];
  const add = (target, items) => items.forEach((item) => target.add(item));
  const full = (reason) => {
    add(unit, catalog.unit);
    add(browser, catalog.browser);
    reasons.push(reason);
  };
  const addArea = (name) => {
    const group = areas[name];
    add(
      unit,
      catalog.unit.filter((file) => group.unit.test(posix.basename(file))),
    );
    add(
      browser,
      catalog.browser.filter((file) => group.browser.test(posix.basename(file))),
    );
    reasons.push(`Area: ${name}`);
  };
  if (profile === 'full') full('Full regression suite');
  else if (profile === 'smoke') {
    add(
      unit,
      smokeUnit.filter((file) => catalog.unit.includes(file)),
    );
    // Native Playwright tags select individual critical journeys, not entire files.
    add(
      browser,
      catalog.browser.filter((file) => readFileSync(`${root}/${file}`, 'utf8').includes('@smoke')),
    );
    reasons.push('Quick state/persistence checks and tagged browser journeys');
  } else if (profile === 'area') {
    if (!areas[area]) throw new Error(`Choose an area: ${Object.keys(areas).join(', ')}`);
    addArea(area);
  } else if (profile === 'changed') {
    const changed = new Set(files),
      cache = new Map();
    for (const file of files) {
      if (catalog.unit.includes(file)) unit.add(file);
      else if (catalog.browser.includes(file)) browser.add(file);
      else if (tooling.test(file)) {
        full(`Shared test/build configuration: ${file}`);
        break;
      } else if (nonRuntime.test(file)) continue;
      else {
        const matches = Object.keys(areas).filter((name) => areas[name].source.test(file));
        if (!matches.length && /^(?:src\/|public\/|tests\/|index\.html$)/.test(file)) {
          full(`Unmapped runtime path: ${file}`);
          break;
        }
        for (const name of matches) {
          // Exact import impact is more selective for code-only unit edits;
          // asset readers and generated content need the area's explicit suite.
          if (!/^src\/.*\.[cm]?js$/.test(file)) addArea(name);
          else {
            add(
              browser,
              catalog.browser.filter((path) => areas[name].browser.test(posix.basename(path))),
            );
            reasons.push(`Browser area: ${name}`);
          }
        }
      }
    }
    for (const test of catalog.unit) {
      if ([...importedFiles(root, test, cache)].some((file) => changed.has(file))) unit.add(test);
    }
    if (unit.size || browser.size)
      add(
        unit,
        smokeUnit.filter((file) => catalog.unit.includes(file)),
      );
    reasons.push(`${files.length} changed paths; transitive imports included`);
  } else throw new Error(`Unknown profile: ${profile}`);
  return {
    unit: [...unit].sort(),
    browser: [...browser].sort(),
    grep: profile === 'smoke' ? '@smoke' : null,
    reasons: [...new Set(reasons)],
  };
}
