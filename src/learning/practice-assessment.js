// Scores describe the quality of demonstrated objectives. They never decide pass/fail.
// Every objective uses the existing engine predicate, including its continuous hold.
const finite = value => Number.isFinite(value) ? Math.max(-1e7, Math.min(value, 1e7)) : null;
const bounded = (value, max = 1e7) => Number.isFinite(value) && value >= 0 ? Math.min(value, max) : 0;
const round = value => Math.round(value * 1000) / 1000;
export const COLLISION_FAILURE_MESSAGE = 'Collision ended this attempt. Keep clear of boats and fixed objects, then restart.';
export const playerCollisionCount = state => Number.isSafeInteger(state?.collisionCount) && state.collisionCount >= 0 ? state.collisionCount : 0;
/** Only player contact episodes count; decorative actors may collide independently. */
export const hasPlayerCollision = (state, baseline = 0) => playerCollisionCount(state) > baseline || state.contactActive === true;
/** Persist a small, typed snapshot, never a live physics body or arbitrary payload. */
export function collisionEvidence(value) {
  if (!value || typeof value !== 'object' || typeof value.bodyId !== 'string' || typeof value.bodyKind !== 'string') return null;
  const vector = (v, limit) => v && Number.isFinite(v.x) && Number.isFinite(v.z) ? { x: Math.max(-limit, Math.min(limit, v.x)), z: Math.max(-limit, Math.min(limit, v.z)) } : null;
  return {
    bodyId: value.bodyId.slice(0, 100), bodyKind: value.bodyKind.slice(0, 40),
    point: vector(value.point, 1e7), normal: vector(value.normal, 1),
    impulse: bounded(value.impulse, 1e9), closingSpeed: bounded(value.closingSpeed, 1000),
    time: bounded(value.time), sequence: Math.floor(bounded(value.sequence, Number.MAX_SAFE_INTEGER)),
  };
}
const telemetryKeys = ['heading', 'speed', 'depth', 'x', 'z', 'rudder', 'mainSheet', 'jibSheet', 'mainHoist', 'jibHoist', 'reefLevel', 'throttle', 'anchorScope', 'windDirection', 'windSpeed', 'currentDirection', 'currentSpeed'];
export const PRACTICE_SCORE_RULES = Object.freeze({
  passScore: 80, maxScore: 100, failedScoreCap: 79,
  holdLossThresholdSeconds: 1, holdLossPenalty: 2, holdLossPenaltyCap: 20,
  hintsAffectScore: false,
  criticalConditions: Object.freeze(['grounding', 'conditions-changed', 'early-anchor', 'engine-engaged', 'collision']),
});

export function practiceRubric(lesson) {
  const steps = lesson.practice?.steps ?? [];
  return steps.map((step, index) => ({
    id: `${lesson.id}-objective-${index + 1}`, index, label: step.label, kind: step.kind,
    target: structuredClone(step.value), requiredSeconds: step.duration ?? 0,
    weight: 100 / steps.length,
  }));
}

export function practiceEvidence(state, attempt) {
  const observed = attempt?.events ?? state.observedEvents;
  const crossing = attempt?.maneuver ?? state.crossing;
  return {
    ...Object.fromEntries(telemetryKeys.map(key => [key, finite(state[key])])),
    anchor: state.anchor === true, grounded: state.grounded === true,
    anchorDragging: state.anchorDragging === true,
    collisionCount: playerCollisionCount(state), contactActive: state.contactActive === true,
    collision: collisionEvidence(state.collision),
    mainFlow: typeof state.mainFlow === 'string' ? state.mainFlow.slice(0, 40) : null,
    observedEvents: (observed instanceof Set ? [...observed] : Array.isArray(observed) ? observed : []).filter(value => typeof value === 'string').slice(0, 16).map(value => value.slice(0, 80)),
    crossing: ['tack', 'gybe'].includes(crossing) ? crossing : null,
  };
}

export function beginPracticeAssessment(lesson) {
  return practiceRubric(lesson).map(objective => ({
    ...objective, status: objective.index === 0 ? 'active' : 'upcoming',
    heldSeconds: 0, bestHoldSeconds: 0, holdBreaks: 0, completedAt: null, evidence: null,
  }));
}

export function observePracticeObjective(attempt, state, satisfied, dt) {
  const objective = attempt.objectives?.[attempt.index];
  if (!objective) return;
  objective.evidence = practiceEvidence(state, attempt);
  if (!satisfied && objective.heldSeconds + 1e-9 >= PRACTICE_SCORE_RULES.holdLossThresholdSeconds && objective.requiredSeconds > 0) objective.holdBreaks++;
  objective.heldSeconds = satisfied ? objective.heldSeconds + dt : 0;
  objective.bestHoldSeconds = Math.max(objective.bestHoldSeconds, objective.heldSeconds);
}

export function completePracticeObjective(attempt) {
  const objective = attempt.objectives?.[attempt.index];
  if (!objective) return;
  objective.status = 'complete';
  objective.completedAt = attempt.elapsed;
  const next = attempt.objectives[attempt.index + 1];
  if (next) next.status = 'active';
}

/** Pure debrief projection: elapsed time alone, hints, and points cannot pass a task. */
export function practiceAssessment(attempt, lesson) {
  if (!attempt || !lesson.practice || attempt.lessonId !== lesson.id) return null;
  const objectives = (attempt.objectives ?? beginPracticeAssessment(lesson)).map(objective => ({
    ...objective,
    status: objective.status === 'complete' ? 'complete' : attempt.status === 'invalid' && objective.status === 'active' ? 'missed' : objective.status,
    heldSeconds: round(objective.heldSeconds), bestHoldSeconds: round(objective.bestHoldSeconds),
    completedAt: objective.completedAt == null ? null : round(objective.completedAt),
    evidence: objective.evidence ? { ...objective.evidence } : null,
  }));
  const complete = objectives.filter(objective => objective.status === 'complete').length;
  const completionScore = objectives.length ? 100 * complete / objectives.length : 0;
  const hints = bounded(attempt.hints, 100000);
  const breaks = objectives.reduce((sum, objective) => sum + objective.holdBreaks, 0);
  const penalties = [{ code: 'broken-holds', count: breaks, points: Math.min(PRACTICE_SCORE_RULES.holdLossPenaltyCap, breaks * PRACTICE_SCORE_RULES.holdLossPenalty) }].filter(penalty => penalty.count > 0);
  const rawScore = Math.max(0, Math.round(completionScore - penalties.reduce((sum, penalty) => sum + penalty.points, 0)));
  const passed = attempt.status === 'passed' && complete === objectives.length && objectives.length > 0 && !attempt.criticalFailure && rawScore >= PRACTICE_SCORE_RULES.passScore;
  const status = attempt.status === 'active' ? 'active' : passed ? 'passed' : 'failed';
  return {
    version: 1, lessonId: lesson.id, status, score: status === 'failed' ? Math.min(PRACTICE_SCORE_RULES.failedScoreCap, rawScore) : rawScore,
    maxScore: 100, completionScore: round(completionScore), penalties,
    rubric: PRACTICE_SCORE_RULES, assisted: hints > 0,
    criticalFailure: attempt.criticalFailure ? { ...attempt.criticalFailure, ...(attempt.criticalFailure.code === 'collision' ? { collision: collisionEvidence(attempt.criticalFailure.collision) } : {}) } : null,
    objectives, elapsed: round(bounded(attempt.elapsed)), hints,
    attemptNumber: bounded(attempt.attemptNumber, 100000),
    debrief: {
      passedObjectives: complete, totalObjectives: objectives.length,
      nextObjectiveId: objectives.find(objective => objective.status !== 'complete')?.id ?? null,
      reason: attempt.message || null,
      practiceTransfer: lesson.transfer,
      summary: passed ? lesson.practice.debrief : null,
    },
  };
}

/** Saved scoring evidence is optional; it never upgrades legacy mastery booleans. */
export function restorePracticeAssessment(value, lesson) {
  if (!value || value.version !== 1 || value.lessonId !== lesson.id || !lesson.practice || !['passed', 'failed'].includes(value.status)) return null;
  const rubric = practiceRubric(lesson);
  if (!Array.isArray(value.objectives) || value.objectives.length !== rubric.length) return null;
  const objectives = [];
  let incomplete = false;
  for (const [index, target] of rubric.entries()) {
    const saved = value.objectives[index];
    if (!saved || saved.id !== target.id || !['complete', 'missed', 'upcoming'].includes(saved.status)) return null;
    if (saved.status === 'complete' && (incomplete || !Number.isFinite(saved.completedAt) || saved.completedAt < 0 || !Number.isFinite(saved.bestHoldSeconds) || saved.bestHoldSeconds + 0.001 < target.requiredSeconds)) return null;
    if (saved.status !== 'complete') incomplete = true;
    objectives.push({ ...target, status: saved.status, heldSeconds: bounded(saved.heldSeconds), bestHoldSeconds: bounded(saved.bestHoldSeconds), holdBreaks: Math.floor(bounded(saved.holdBreaks, 100000)), completedAt: saved.status === 'complete' ? bounded(saved.completedAt) : null, evidence: saved.evidence && typeof saved.evidence === 'object' ? practiceEvidence(saved.evidence) : null });
  }
  if (value.status === 'passed' && incomplete) return null;
  const criticalFailure = value.criticalFailure && typeof value.criticalFailure.code === 'string' && typeof value.criticalFailure.message === 'string' ? { code: value.criticalFailure.code.slice(0, 60), message: value.criticalFailure.message.slice(0, 240) } : null;
  if (criticalFailure?.code === 'collision') criticalFailure.collision = collisionEvidence(value.criticalFailure.collision);
  if (value.status === 'passed' && criticalFailure) return null;
  return practiceAssessment({ lessonId: lesson.id, status: value.status === 'passed' ? 'passed' : 'invalid', objectives, hints: Math.floor(bounded(value.hints, 100000)), elapsed: bounded(value.elapsed), attemptNumber: Math.floor(bounded(value.attemptNumber, 100000)), criticalFailure, message: typeof value.debrief?.reason === 'string' ? value.debrief.reason.slice(0, 240) : '' }, lesson);
}
