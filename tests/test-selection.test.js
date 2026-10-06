import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { selectTests, inventory } from '../scripts/test-selection.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const select = (files) => selectTests({ root, files });

test('documentation-only edits select no runtime tests', () => {
  const plan = select(['README.md', 'docs/TESTING.md']);
  assert.deepEqual(plan.unit, []);
  assert.deepEqual(plan.browser, []);
});

test('cover CSS selects layout regressions without unrelated audio browsers', () => {
  const plan = select(['src/activity/world-atlas.css']);
  assert.ok(plan.browser.includes('tests/browser/world-destinations.spec.js'));
  assert.ok(plan.browser.includes('tests/browser/vessel-picker.spec.js'));
  assert.ok(!plan.browser.includes('tests/browser/audio.spec.js'));
});

test('physics edits include indirect training consumers', () => {
  const plan = select(['src/physics.js']);
  assert.ok(plan.unit.includes('tests/physics.test.js'));
  assert.ok(plan.unit.includes('tests/practice-assessment.test.js'));
});

test('locale assets include readers that construct file names dynamically', () => {
  assert.ok(select(['public/locales/he.json']).unit.includes('tests/localization.test.js'));
});

test('unknown runtime and tooling paths fall back to full coverage', () => {
  for (const file of ['src/new-feature.js', 'package-lock.json']) {
    assert.deepEqual(select([file]).unit, inventory(root).unit);
    assert.deepEqual(select([file]).browser, inventory(root).browser);
  }
});

test('changed tests run directly; invalid profiles fail explicitly', () => {
  assert.ok(
    select(['tests/browser/radio.spec.js']).browser.includes('tests/browser/radio.spec.js'),
  );
  assert.throws(() => selectTests({ root, profile: 'area', area: 'typo' }), /Choose an area/);
});
