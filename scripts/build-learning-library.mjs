import { readFileSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifests = ['manifest-training.json', 'manifest-seamanship.json'];
const string = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${label}`);
  return value.trim();
};
const within = (parent, child) => {
  const path = relative(parent, child);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
};

/** Only canonical Markdown notes inside reference/sailing can be published. */
export function readSourceNote(root, localFile) {
  string(localFile, 'source note path');
  if (isAbsolute(localFile) || localFile.includes('\\') || localFile.includes('\0') ||
      localFile.split('/').includes('..') || !localFile.startsWith('reference/sailing/') ||
      !localFile.endsWith('.md')) throw new Error(`Unsafe source note path: ${localFile}`);
  const notesRoot = realpathSync(resolve(root, 'reference/sailing'));
  const file = realpathSync(resolve(root, localFile));
  if (!within(notesRoot, file)) throw new Error(`Source note escapes reference directory: ${localFile}`);
  const note = readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  if (Buffer.byteLength(note, 'utf8') > 100_000 || !/^## Original (summary|research notes)$/m.test(note)) {
    throw new Error(`Not an original source note: ${localFile}`);
  }
  return note.trimEnd() + '\n';
}

function verified(source) {
  return source.httpStatus === 200 &&
    (source.status === 'verified-public-page' || (source.status == null && source.contentVerified === true));
}

function normalizeSource(root, source, collection) {
  const id = string(source.id, 'source id');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Invalid source id: ${id}`);
  const url = new URL(string(source.url, `${id} URL`));
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Unsafe source URL: ${id}`);
  const retrievedAt = string(source.retrievedAt, `${id} retrieval date`);
  if (!Number.isFinite(Date.parse(retrievedAt))) throw new Error(`Invalid retrieval date: ${id}`);
  if (!Array.isArray(source.topics) || source.topics.length === 0) throw new Error(`Unmapped source: ${id}`);
  const notes = readSourceNote(root, source.localFile ?? source.notePath);
  const summary = notes.match(/^## Original (?:summary|research notes)\n+([\s\S]*?)(?=\n## |$)/m)?.[1].trim();
  string(summary, `${id} original summary`);
  return {
    id,
    title: string(source.title, `${id} title`),
    org: string(source.org ?? source.publisher, `${id} organization`),
    url: url.href,
    topics: [...new Set(source.topics.map(topic => string(topic, `${id} topic`)))].sort(),
    level: source.level ?? 'All',
    status: 'verified-public-page',
    retrievedAt,
    summary,
    notes,
    notesFormat: 'text/markdown',
    // Bibliographic names and research notes retain their original language.
    titleLanguage: 'en',
    orgLanguage: 'en',
    notesLanguage: 'en',
    collection,
  };
}

/** No network access or build-time timestamp: identical inputs yield identical bytes. */
export function buildLearningLibrary(root = projectRoot) {
  const sources = [];
  for (const manifestName of manifests) {
    const manifest = JSON.parse(readFileSync(resolve(root, 'reference/sailing', manifestName), 'utf8'));
    if (!Array.isArray(manifest.sources)) throw new Error(`Invalid manifest: ${manifestName}`);
    for (const source of manifest.sources) {
      if (verified(source)) sources.push(normalizeSource(root, source, manifestName.includes('training') ? 'training' : 'seamanship'));
    }
  }
  sources.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  if (new Set(sources.map(source => source.id)).size !== sources.length) throw new Error('Duplicate source IDs');
  return { schemaVersion: 1, contentPolicy: 'original-summary-only', sources };
}

export function serializeLearningLibrary(library) {
  return JSON.stringify(library, null, 2) + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const library = buildLearningLibrary();
  mkdirSync(resolve(projectRoot, 'public'), { recursive: true });
  writeFileSync(resolve(projectRoot, 'public/learning-library.json'), serializeLearningLibrary(library));
  console.log(`Published ${library.sources.length} verified original research notes to public/learning-library.json`);
}
