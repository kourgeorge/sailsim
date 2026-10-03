import { getChallenge } from './catalog.js';

export const challengeRecordKey = (id) => `sail-challenge-best-v1:${getChallenge(id).id}`;

export function readChallengeBest(storage, id) {
  try {
    const value = JSON.parse(storage.getItem(challengeRecordKey(id)));
    const d = getChallenge(id);
    return value &&
      Number.isInteger(value.score) &&
      value.score > 0 &&
      value.score <= 100 &&
      Number.isFinite(value.elapsed) &&
      value.elapsed > 0 &&
      value.elapsed <= d.timeLimit
      ? value
      : null;
  } catch {
    return null;
  }
}

export function saveChallengeBest(storage, run) {
  if (run.status !== 'completed') return false;
  const previous = readChallengeBest(storage, run.definition.id);
  if (
    previous &&
    (previous.score > run.score ||
      (previous.score === run.score && previous.elapsed <= run.elapsed))
  )
    return false;
  try {
    storage.setItem(
      challengeRecordKey(run.definition.id),
      JSON.stringify({ score: run.score, elapsed: run.elapsed }),
    );
    return true;
  } catch {
    return false;
  }
}
