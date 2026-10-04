import test from 'node:test';
import assert from 'node:assert/strict';
import { preferredInterfaceLanguage } from '../src/i18n/language-preference.js';

const supported = ['en', 'es', 'ar', 'he', 'ru', 'fr'];
function choose({ query = '', saved = null, languages = [], language } = {}) {
  return preferredInterfaceLanguage(supported, {
    location: { href: `https://sail.example/${query}` },
    localStorage: { getItem: () => saved },
    navigator: { languages, language },
  });
}

test('first visits use the first supported browser preference', () => {
  assert.equal(choose({ languages: ['nb-NO', 'fr-CA', 'en-US'] }), 'fr');
  assert.equal(choose({ languages: ['en-GB', 'es-ES'] }), 'en');
});
test('regional tags and older Hebrew codes resolve to installed languages', () => {
  for (const [tag, expected] of [
    ['es-MX', 'es'],
    ['ar-SA', 'ar'],
    ['he-IL', 'he'],
    ['iw-IL', 'he'],
    ['RU_ru', 'ru'],
    [' FR-ca ', 'fr'],
  ])
    assert.equal(choose({ languages: [tag] }), expected);
});
test('explicit language links take priority over saved and browser preferences', () => {
  assert.equal(choose({ query: '?lang=he', saved: 'es', languages: ['fr-FR'] }), 'he');
});
test('saved manual choices take priority over automatic detection', () => {
  assert.equal(choose({ saved: 'ru', languages: ['he-IL'] }), 'ru');
});
test('unsupported explicit choices do not mask a usable lower-priority preference', () => {
  assert.equal(choose({ query: '?lang=zz', saved: 'es', languages: ['fr-FR'] }), 'es');
  assert.equal(choose({ query: '?lang=zz', saved: 'unknown', languages: ['ar-EG'] }), 'ar');
});
test('single browser language works when the preference list is unavailable', () => {
  assert.equal(choose({ language: 'es-AR' }), 'es');
});
test('blocked storage still allows browser detection', () => {
  assert.equal(
    preferredInterfaceLanguage(supported, {
      location: { href: 'https://sail.example/' },
      get localStorage() {
        throw new Error('Storage blocked');
      },
      navigator: { languages: ['he-IL'] },
    }),
    'he',
  );
});
test('unknown or missing browser preferences fall back to English', () => {
  assert.equal(choose({ languages: ['de-DE', null, 42, 'ja-JP'] }), 'en');
  assert.equal(preferredInterfaceLanguage(supported, {}), 'en');
});
