import test from 'node:test';
import assert from 'node:assert/strict';
import { ANCHOR_UI_KEYS, anchoringUI } from '../src/i18n/anchoring.js';

test('anchor monitor has complete display-only copy for all six interface languages', () => {
  assert.deepEqual(Object.keys(anchoringUI).sort(), ['ar', 'en', 'es', 'fr', 'he', 'ru']);
  assert.equal(ANCHOR_UI_KEYS.length, 32);
  const placeholders = text => [...text.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
  for (const [language, dictionary] of Object.entries(anchoringUI)) {
    assert.deepEqual(Object.keys(dictionary), ANCHOR_UI_KEYS);
    for (const key of ANCHOR_UI_KEYS) {
      const value = dictionary[key];
      assert.equal(typeof value, 'string', `${language}: ${key}`);
      assert.ok(value.trim(), `${language}: ${key}`);
      assert.doesNotMatch(value, /<\/?[a-z][^>]*>/i, `${language}: text, not markup`);
      assert.deepEqual(placeholders(value), placeholders(key));
      if (language === 'en') assert.equal(value, key);
      else assert.notEqual(value, key, `${language}: missing translation for ${key}`);
    }
  }
});

test('anchor states and measurement labels preserve distinct deployment and restraint concepts', () => {
  const states = ['Awaiting deployment', 'Anchor suspended', 'Rode slack', 'Rode taut', 'Anchor dragging'];
  const measurements = ['Rode length', 'Depth at anchor', 'Bow height', 'Scope', 'Distance from anchor', 'Maximum bow radius', 'Ground speed'];
  const explanations = [
    'Resume simulation to deploy the anchor.',
    'The rode is too short to reach the seabed.',
    'The rode is slack. Low speed alone does not show that the anchor is holding.',
    'The rode is at the modeled swing limit. This does not prove a real anchor is set.',
    'The anchor is moving along the seabed. Reassess rode and holding.',
    'The model gives reduced restraint at short scope. This is not a recommended scope.',
  ];
  for (const [language, dictionary] of Object.entries(anchoringUI)) {
    assert.equal(new Set(states.map(key => dictionary[key])).size, states.length, language);
    assert.equal(new Set(measurements.map(key => dictionary[key])).size, measurements.length, language);
    for (const key of explanations) assert.ok(dictionary[key], `${language}: ${key}`);
  }
  for (const value of Object.values(anchoringUI.he)) assert.match(value, /[\u0590-\u05ff]/u);
  for (const value of Object.values(anchoringUI.ar)) assert.match(value, /[\u0600-\u06ff]/u);
});
