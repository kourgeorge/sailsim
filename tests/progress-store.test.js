import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore } from '../src/learning/progress-store.js';
import { beginAttempt, invalidateAttempt, recordFor, restoreProgress, STORAGE_KEY } from '../src/learning/engine.js';
import { lessons } from '../src/learning/curriculum.js';
import { createPracticeState } from '../src/learning/scenario-state.js';

function fixture({ useLocks = true } = {}) {
  const data = new Map();
  const storage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  let pending = Promise.resolve();
  const locks = useLocks ? { request: (_, callback) => {
    const next = pending.then(callback);
    pending = next.catch(() => {});
    return next;
  } } : null;
  const tabs = [];
  return {
    storage,
    tab(onChange = () => {}) {
      const events = new EventTarget();
      const store = createProgressStore({ getStorage: () => storage, locks, events, onChange });
      tabs.push({ events, store });
      return store;
    },
    notify() {
      for (const { events } of tabs) {
        events.dispatchEvent(Object.assign(new Event('storage'), { key: STORAGE_KEY, storageArea: storage }));
      }
    },
    read: () => restoreProgress(storage.getItem(STORAGE_KEY)),
  };
}

test('a stale tab changing lessons preserves another tab’s completed quiz', async () => {
  const f = fixture(), first = f.tab(), second = f.tab();
  recordFor(first.progress, 'sail-01').knowledge = true;
  await first.save();
  second.progress.selected = 'sail-02';
  await second.save();
  assert.equal(f.read().records['sail-01'].knowledge, true);
  assert.equal(second.progress.records['sail-01'].knowledge, true);
  assert.equal(second.progress.selected, 'sail-02');
});

test('simultaneous same-lesson edits add counter deltas once and preserve both reports', async () => {
  const f = fixture(), first = f.tab(), second = f.tab();
  const lesson = lessons.find(l => l.practice);
  for (const tab of [first, second]) {
    const attempt = beginAttempt(lesson, createPracticeState(lesson.practice.setup), tab.progress);
    invalidateAttempt(attempt, tab.progress, 'Ended by learner');
    recordFor(tab.progress, lesson.id).wrongAnswers++;
  }
  await Promise.all([first.save(), second.save()]);
  f.notify();
  await Promise.all([first.flush(), second.flush()]);
  await Promise.all([first.save(), second.save()]);
  const saved = f.read().records[lesson.id];
  assert.equal(saved.attempts, 2);
  assert.equal(saved.wrongAnswers, 2);
  assert.equal(saved.practiceResults.length, 2);
  assert.equal(new Set(saved.practiceResults.map(report => report.id)).size, 2);
});

test('storage synchronization keeps local unsaved edits and the current lesson', async () => {
  const f = fixture();
  let changes = 0;
  const first = f.tab(), second = f.tab(() => changes++);
  second.progress.selected = 'sail-09';
  recordFor(second.progress, 'sail-01').wrongAnswers = 2;
  recordFor(first.progress, 'sail-01').wrongAnswers = 3;
  recordFor(first.progress, 'sail-02').knowledge = true;
  await first.save();
  f.notify();
  await second.flush();
  f.notify();
  await Promise.all([first.flush(), second.flush()]);
  assert.equal(second.progress.selected, 'sail-09');
  assert.equal(second.progress.records['sail-01'].wrongAnswers, 5);
  assert.equal(f.read().records['sail-01'].wrongAnswers, 5);
  assert.equal(second.progress.records['sail-02'].knowledge, true);
  assert.ok(changes > 0);
});

test('synchronous fallback merges stale records when Web Locks are unavailable', async () => {
  const f = fixture({ useLocks: false }), first = f.tab(), second = f.tab();
  recordFor(first.progress, 'sail-01').knowledge = true;
  recordFor(second.progress, 'sail-02').knowledge = true;
  await first.save();
  await second.save();
  f.notify();
  assert.equal(first.progress.records['sail-02'].knowledge, true);
  assert.equal(f.read().records['sail-01'].knowledge, true);
});

test('failed saves retain edits for export and a later successful retry', async () => {
  const data = new Map();
  let unavailable = true, errors = 0;
  const store = createProgressStore({
    locks: null,
    getStorage: () => ({
      getItem: key => data.get(key) || null,
      setItem: (key, value) => { if (unavailable) throw new Error('Quota exceeded'); data.set(key, value); },
    }),
    onError: () => errors++,
  });
  recordFor(store.progress, 'sail-01').wrongAnswers = 1;
  await store.save();
  assert.equal(errors, 1);
  assert.equal(store.progress.records['sail-01'].wrongAnswers, 1);
  unavailable = false;
  await store.save();
  assert.equal(restoreProgress(data.get(STORAGE_KEY)).records['sail-01'].wrongAnswers, 1);
});
