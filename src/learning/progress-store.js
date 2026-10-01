import { recordFor, restoreProgress, STORAGE_KEY } from './engine.js';

const counters = ['attempts', 'decisionAttempts', 'hints', 'wrongAnswers'];
const reportKey = (report) => report.id || JSON.stringify(report);

function mergeReports(saved = [], baseline = [], local = []) {
  const known = new Set(baseline.map(reportKey));
  const reports = new Map(saved.map((report) => [reportKey(report), report]));
  for (const report of local) {
    const key = reportKey(report);
    if (!known.has(key)) reports.set(key, report);
  }
  return [...reports.values()].slice(-5);
}

// Apply only this tab's changes to the latest stored record. Counters use deltas
// so two tabs answering the same lesson both contribute, without double-counting
// repeated saves. Achievement flags never regress when another tab is behind.
export function mergeProgress(saved, baseline, local) {
  const merged = structuredClone(saved);
  merged.selected = local.selected;
  for (const [id, incoming] of Object.entries(local.records)) {
    const previous = baseline.records[id] || {};
    const record = recordFor(merged, id);
    for (const key of ['knowledge', 'practice', 'decision']) {
      record[key] = record[key] === true || incoming[key] === true;
    }
    for (const key of counters) {
      const delta = Math.max(0, (incoming[key] || 0) - (previous[key] || 0));
      record[key] = Math.min(100000, Math.max(incoming[key] || 0, (record[key] || 0) + delta));
    }
    if (incoming.lastResult !== previous.lastResult) record.lastResult = incoming.lastResult;
    record.passedAt ||= incoming.passedAt;
    for (const kind of ['Practice', 'Decision']) {
      const history = `${kind.toLowerCase()}Results`;
      const last = `last${kind}Result`;
      record[history] = mergeReports(record[history], previous[history], incoming[history]);
      if (
        incoming[last] &&
        reportKey(incoming[last]) !== (previous[last] && reportKey(previous[last]))
      ) {
        record[last] = incoming[last];
      }
      record[last] ||= record[history].at(-1) || null;
    }
  }
  return merged;
}

export function createProgressStore({
  getStorage = () => localStorage,
  locks = globalThis.navigator?.locks,
  events = globalThis.window,
  onChange = () => {},
  onError = () => {},
} = {}) {
  let storage;
  let baseline = restoreProgress(null);
  try {
    storage = getStorage();
    baseline = restoreProgress(storage.getItem(STORAGE_KEY));
  } catch {
    // Keep an in-memory record; report unavailable storage on the first save.
  }
  const progress = structuredClone(baseline);
  let pending = Promise.resolve();

  function commit() {
    if (!storage) throw new Error('Browser storage is unavailable');
    const saved = restoreProgress(storage.getItem(STORAGE_KEY));
    const merged = mergeProgress(saved, baseline, progress);
    storage.setItem(STORAGE_KEY, JSON.stringify(merged));
    const changed = JSON.stringify(progress.records) !== JSON.stringify(merged.records);
    Object.assign(progress, merged);
    baseline = structuredClone(merged);
    if (changed) onChange();
  }

  function save() {
    if (locks) {
      // Read, merge and write under one origin-wide lock. Read the live local
      // record inside the transaction, including edits made while it was queued.
      pending = pending.then(() => locks.request(STORAGE_KEY, commit)).catch(onError);
    } else {
      try {
        commit();
      } catch (error) {
        onError(error);
      }
    }
    return pending;
  }

  function synchronize(event) {
    if (event.key !== STORAGE_KEY || event.storageArea !== storage) return;
    try {
      const saved = restoreProgress(storage.getItem(STORAGE_KEY));
      const merged = mergeProgress(saved, baseline, progress);
      const changed = JSON.stringify(progress.records) !== JSON.stringify(merged.records);
      Object.assign(progress, merged);
      baseline = saved;
      if (changed) onChange();
      // Preserve pending local evidence, including on browsers without Web Locks.
      if (JSON.stringify(merged.records) !== JSON.stringify(saved.records)) save();
    } catch (error) {
      onError(error);
    }
  }

  events?.addEventListener('storage', synchronize);
  return {
    progress,
    save,
    flush: () => pending,
    destroy: () => events?.removeEventListener('storage', synchronize),
  };
}
