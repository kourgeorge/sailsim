import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLearningLibrary, serializeLearningLibrary, readSourceNote } from '../scripts/build-learning-library.mjs';
import { guides, guideLanguages, guideSources, guideFor } from '../src/learning/instrument-guides.js';
import { lessons } from '../src/learning/curriculum.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const readManifest = name => JSON.parse(readFileSync(resolve(root, 'reference/sailing', name), 'utf8'));

test('every contextual guide has six complete direct translations and valid lesson/source links', () => {
  assert.deepEqual([...guideLanguages].sort(), ['ar', 'en', 'es', 'fr', 'he', 'ru']);
  assert.equal(guides.length, 13);
  assert.equal(new Set(guides.map(guide => guide.id)).size, guides.length);
  const lessonIds = new Set(lessons.map(lesson => lesson.id));
  const mappedSources = new Set();
  for (const guide of guides) {
    assert.ok(guide.lessonIds.length, guide.id);
    for (const id of guide.lessonIds) assert.ok(lessonIds.has(id), `${guide.id}: ${id}`);
    for (const id of guide.sourceIds) {
      assert.ok(guideSources[id], `${guide.id}: ${id}`);
      mappedSources.add(id);
    }
    for (const lang of guideLanguages) {
      const localized = guideFor(guide.id, lang);
      for (const field of ['title', 'body', 'tryIt', 'pitfall']) {
        assert.ok(localized[field]?.trim(), `${guide.id}/${lang}/${field}`);
        if (lang !== 'en') assert.notEqual(localized[field], guide[field], `${guide.id}/${lang}/${field} is untranslated`);
      }
      assert.deepEqual(localized.sources.map(source => source.id), guide.sourceIds);
    }
  }
  assert.deepEqual([...mappedSources].sort(), Object.keys(guideSources).sort(), 'no unused guide references');
  for (const source of readManifest('manifest-seamanship.json').sources) {
    assert.ok(guideSources[source.id], source.id);
    assert.equal(guideSources[source.id].url, source.url);
    assert.deepEqual([...source.topics].sort(), guides.filter(guide => guide.sourceIds.includes(source.id)).map(guide => guide.id).sort());
  }
  assert.equal(guideFor('unknown'), null);
  assert.deepEqual(guideFor('wind', 'unsupported'), guideFor('wind', 'en'));
});

test('public library is deterministic, current, and includes only verified original notes', () => {
  const library = buildLearningLibrary(root);
  assert.deepEqual(buildLearningLibrary(root), library);
  assert.equal(readFileSync(resolve(root, 'public/learning-library.json'), 'utf8'), serializeLearningLibrary(library), 'run node scripts/build-learning-library.mjs after editing canonical notes');
  const expected = [...readManifest('manifest-training.json').sources, ...readManifest('manifest-seamanship.json').sources]
    .filter(source => source.httpStatus === 200 && (source.status === 'verified-public-page' || source.contentVerified === true));
  assert.deepEqual(library.sources.map(source => source.id), expected.map(source => source.id).sort());
  assert.ok(library.sources.length >= 25);
  for (const source of library.sources) {
    assert.equal(source.status, 'verified-public-page');
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.equal(source.titleLanguage, 'en');
    assert.equal(source.orgLanguage, 'en');
    assert.equal(source.notesLanguage, 'en');
    assert.ok(source.topics.length && source.summary.length && source.org.length && source.level.length);
    assert.ok(source.notes.includes(source.summary));
    assert.equal(source.localFile, undefined);
    assert.equal(source.notePath, undefined);
    assert.ok(!source.notes.includes('<script'), source.id);
    const original = expected.find(item => item.id === source.id);
    assert.equal(source.notes, readSourceNote(root, original.localFile ?? original.notePath));
  }
  assert.ok(!library.sources.some(source => source.id === 'asa-access' || source.id === 'unece-access'));
});

test('source publication refuses traversal, external symlinks, non-note files, unsafe URLs, and duplicates', t => {
  const fixture = mkdtempSync(resolve(tmpdir(), 'sail-library-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const directory = resolve(fixture, 'reference/sailing');
  mkdirSync(directory, { recursive: true });
  const note = '# Example\n\n## Original summary\n\nAn original note.\n';
  writeFileSync(resolve(directory, 'note.md'), note);
  writeFileSync(resolve(fixture, 'outside.md'), note);
  symlinkSync(resolve(fixture, 'outside.md'), resolve(directory, 'escape.md'));
  writeFileSync(resolve(directory, 'raw.md'), '<html>Not original notes</html>');
  for (const path of ['../outside.md', '/etc/passwd', 'reference/sailing/../../outside.md', 'reference/sailing/raw.html', 'reference\\sailing\\note.md']) {
    assert.throws(() => readSourceNote(fixture, path), /Unsafe/);
  }
  assert.throws(() => readSourceNote(fixture, 'reference/sailing/escape.md'), /escapes/);
  assert.throws(() => readSourceNote(fixture, 'reference/sailing/raw.md'), /Not an original/);
  const source = { id: 'example', title: 'Example', org: 'Publisher', url: 'https://example.org/', topics: ['safety'], level: 'Basic', status: 'verified-public-page', httpStatus: 200, retrievedAt: '2026-10-01T00:00:00Z', localFile: 'reference/sailing/note.md' };
  const manifest = (name, sources) => writeFileSync(resolve(directory, name), JSON.stringify({ sources }));
  manifest('manifest-seamanship.json', []);
  manifest('manifest-training.json', [{ ...source, url: 'javascript:alert(1)' }]);
  assert.throws(() => buildLearningLibrary(fixture), /Unsafe source URL/);
  manifest('manifest-training.json', [source, source]);
  assert.throws(() => buildLearningLibrary(fixture), /Duplicate/);
  manifest('manifest-training.json', [{ ...source, topics: [] }]);
  assert.throws(() => buildLearningLibrary(fixture), /Unmapped/);
  manifest('manifest-training.json', [{ ...source, httpStatus: 403, localFile: '/must-not-be-read' }]);
  assert.deepEqual(buildLearningLibrary(fixture).sources, []);
  manifest('manifest-training.json', [{ ...source, status: 'unavailable-not-used-as-evidence', httpStatus: 200 }]);
  assert.deepEqual(buildLearningLibrary(fixture).sources, []);
});
