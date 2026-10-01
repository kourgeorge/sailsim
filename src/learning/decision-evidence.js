const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const boundedNumber = (value, max = 1e7) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
const text = (value, length = 400) => typeof value === 'string' ? value.slice(0, length) : null;
// Legacy or incomplete reports can omit an observation map. Consumers still
// need an object so a missing answer can render as "Not completed" safely.
export const decisionEvidenceValues = row => plainObject(row?.evidence) ? row.evidence : {};

// Reports contain small JSON observations, not executable data or arbitrary stored objects.
function observation(value, depth = 0) {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.slice(0, 500);
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(-1e7, Math.min(value, 1e7)) : null;
  if (depth >= 3) return null;
  if (Array.isArray(value)) return value.slice(0, 30).map(item => observation(item, depth + 1));
  if (plainObject(value)) return Object.fromEntries(Object.entries(value).slice(0, 30).filter(([key]) => !['__proto__', 'prototype', 'constructor'].includes(key)).map(([key, item]) => [key.slice(0, 80), observation(item, depth + 1)]));
  return null;
}

/** Validate terminal evidence against the lesson's trusted, ordered stage IDs. */
export function restoreDecisionResult(value, lesson) {
  if (!plainObject(value) || value.version !== 1 || typeof value.id !== 'string' || !value.id.trim() || value.id.length > 120 || !lesson.decisionScenarioId || value.lessonId !== lesson.id || value.scenarioId !== lesson.decisionScenarioId) return null;
  const expectedIds = lesson.decisionObjectiveIds;
  if (!Array.isArray(expectedIds) || !expectedIds.length || new Set(expectedIds).size !== expectedIds.length) return null;
  if (!['passed', 'failed'].includes(value.status) || !boundedNumber(value.score, 100) || value.maxScore !== 100 || !boundedNumber(value.elapsed)) return null;
  if (!Array.isArray(value.objectives) || value.objectives.length !== expectedIds.length) return null;
  if (value.hints !== undefined && (!Number.isSafeInteger(value.hints) || !boundedNumber(value.hints, 100000))) return null;
  const objectives = [];
  let incomplete = false;
  let completedPoints = 0;
  for (const [index, id] of expectedIds.entries()) {
    const row = value.objectives[index];
    if (!plainObject(row) || row.id !== id || !['complete', 'missed', 'upcoming'].includes(row.status)) return null;
    if (row.status === 'complete' && incomplete) return null;
    if (row.status !== 'complete') incomplete = true;
    const maxPoints = Math.floor(100 / expectedIds.length) + (index < 100 % expectedIds.length ? 1 : 0);
    const points = row.status === 'complete' ? maxPoints : 0;
    if (row.maxPoints !== maxPoints || row.points !== points) return null;
    if (row.completedAt != null && !boundedNumber(row.completedAt)) return null;
    if (row.attempts !== undefined && (!Number.isSafeInteger(row.attempts) || !boundedNumber(row.attempts, 100000))) return null;
    completedPoints += points;
    objectives.push({ id, index, label: text(row.label, 240) ?? id, status: row.status,
      points, maxPoints, completedAt: row.completedAt ?? null, attempts: row.attempts ?? 0,
      evidence: observation(decisionEvidenceValues(row)), inspected: Array.isArray(row.inspected) ? row.inspected.filter(item => typeof item === 'string').slice(0, 30).map(item => item.slice(0, 80)) : [] });
  }
  if (value.penalties !== undefined && (!Array.isArray(value.penalties) || value.penalties.length > 1)) return null;
  let mistakes = 0;
  if (value.penalties?.length) {
    const penalty = value.penalties[0];
    if (!plainObject(penalty) || penalty.code !== 'revised-decision' || !Number.isSafeInteger(penalty.count) || !boundedNumber(penalty.count, 100000) || penalty.points !== 5 * penalty.count) return null;
    mistakes = penalty.count;
  }
  const earnedScore = Math.max(0, completedPoints - 5 * mistakes);
  const score = value.status === 'failed' ? Math.min(79, earnedScore) : earnedScore;
  if (value.score !== score) return null;
  let criticalFailure = null;
  if (value.criticalFailure != null) {
    if (!plainObject(value.criticalFailure) || typeof value.criticalFailure.code !== 'string' || typeof value.criticalFailure.message !== 'string') return null;
    criticalFailure = { code: text(value.criticalFailure.code, 60), message: text(value.criticalFailure.message, 240) };
  }
  if (value.status === 'passed' && (value.score < 80 || incomplete || criticalFailure)) return null;
  return {
    version: 1, id: value.id, lessonId: lesson.id, scenarioId: lesson.decisionScenarioId,
    status: value.status, score, maxScore: 100,
    objectives, criticalFailure, elapsed: value.elapsed, hints: value.hints ?? 0,
    penalties: mistakes ? [{ code: 'revised-decision', count: mistakes, points: 5 * mistakes }] : [],
    assisted: (value.hints ?? 0) > 0,
    debrief: { reason: text(value.debrief?.reason), summary: text(value.debrief?.summary, 1000), practiceTransfer: text(value.debrief?.practiceTransfer, 1000) },
  };
}
