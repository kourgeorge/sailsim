// Scores describe the quality of demonstrated objectives. They never decide pass/fail.
// Every objective uses the existing engine predicate, including its continuous hold.
import { groundVelocity, KNOT, windOverWater } from '../physics.js';
import { anchorSnapshot } from '../anchor.js';
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
const telemetryKeys = ['heading', 'speed', 'leeway', 'depth', 'x', 'z', 'rudder', 'mainSheet', 'jibSheet', 'mainHoist', 'jibHoist', 'reefLevel', 'throttle', 'anchorScope', 'anchorPaidRode', 'anchorRode', 'windDirection', 'windSpeed', 'currentDirection', 'currentSpeed'];
export const WINDLASS_ASSESSMENT_VERSION = 1;
/** Shared by assessment and feedback so the displayed stop target cannot drift. */
export function practiceStopThreshold(check) {
  if (check?.kind === 'coast' && Number.isFinite(check.value)) return check.value;
  return check?.kind === 'anchor' && check.value === true ? .2 : null;
}
/** Stops concern motion over the seabed, including lateral drift and current.
 * Old minimal fixtures may omit vector components; malformed supplied values
 * cannot fall back to a cached speed-over-ground display or earn stop credit. */
export function practiceGroundSpeed(state) {
  if (state.grounded === true) return 0;
  if (!Number.isFinite(state.speed)) return NaN;
  if (['heading', 'leeway', 'currentSpeed', 'currentDirection'].every(key => state[key] === undefined)) return Math.abs(state.speed);
  if (!Number.isFinite(state.heading) || ['leeway', 'currentSpeed', 'currentDirection'].some(key => state[key] !== undefined && !Number.isFinite(state[key]))) return NaN;
  const velocity = groundVelocity({ ...state, leeway: state.leeway ?? 0, currentSpeed: state.currentSpeed ?? 0, currentDirection: state.currentDirection ?? 0 });
  return Math.hypot(velocity.x, velocity.z) / KNOT;
}
export function practiceAnchorContact(state) {
  // Legacy scalar fixtures have no deployment geometry. Live simulator states
  // always carry rode length and must demonstrate the running capture step.
  if (state.anchorRode === undefined && state.anchorStatus === undefined && state.locationId === undefined) return null;
  return anchorSnapshot(state).seabedContact;
}
/** An anchor command or bottom contact alone does not finish powered handling. */
export function practiceWindlassComplete(state,check) {
  const paid=state.anchorPaidRode,target=state.anchorRode;
  if(!Number.isFinite(paid)||paid<0||paid>250||!Number.isFinite(target)||target<0||target>250||state.anchorWinchRunning!==false)return false;
  if(check.value===false)return state.anchor===false&&paid<=1e-8;
  if(check.value!==true||state.anchor!==true||Math.abs(paid-target)>1e-8)return false;
  if(Number.isFinite(check.minimumRode)&&paid+1e-8<check.minimumRode)return false;
  const snapshot=anchorSnapshot(state);
  return snapshot.seabedContact&&snapshot.scope>=1&&snapshot.status!=='dragging'&&state.anchorDragging!==true;
}
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
    minimumRode: step.kind==='anchor'&&step.value===true&&Number.isFinite(step.minimumRode)?step.minimumRode:null,
    requiresStoppedWindlass: step.kind==='anchor',
    weight: 100 / steps.length,
  }));
}

export function practiceEvidence(state, attempt) {
  const observed = attempt?.events ?? state.observedEvents;
  const crossing = attempt?.maneuver ?? state.crossing;
  // Recompute from raw weather, including on report restoration. Historical
  // records with missing weather retain unknown values rather than invented wind.
  const completeWind=['heading','windSpeed','windDirection'].every(key=>Number.isFinite(state[key]))&&['currentSpeed','currentDirection'].every(key=>state[key]===undefined||Number.isFinite(state[key]));
  const water=completeWind?windOverWater(state):{speed:null,direction:null,angle:null};
  return {
    ...Object.fromEntries(telemetryKeys.map(key => [key, finite(state[key])])),
    waterWindSpeed:finite(water.speed),waterWindDirection:finite(water.direction),waterWindAngle:finite(water.angle),
    speedOverGround: finite(practiceGroundSpeed(state)),
    anchor: state.anchor === true, grounded: state.grounded === true,
    anchorWinchRunning: typeof state.anchorWinchRunning==='boolean'?state.anchorWinchRunning:null,
    anchorSeabedContact: practiceAnchorContact(state),
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
    version: 1, windlassAssessmentVersion: attempt.windlassAssessmentVersion===WINDLASS_ASSESSMENT_VERSION?WINDLASS_ASSESSMENT_VERSION:null,
    lessonId: lesson.id, status, score: status === 'failed' ? Math.min(PRACTICE_SCORE_RULES.failedScoreCap, rawScore) : rawScore,
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
  const windlassAssessmentVersion=value.windlassAssessmentVersion===WINDLASS_ASSESSMENT_VERSION?WINDLASS_ASSESSMENT_VERSION:null;
  if (!Array.isArray(value.objectives) || value.objectives.length !== rubric.length) return null;
  const objectives = [];
  let incomplete = false;
  for (const [index, target] of rubric.entries()) {
    const saved = value.objectives[index];
    if (!saved || saved.id !== target.id || !['complete', 'missed', 'upcoming'].includes(saved.status)) return null;
    if (saved.status === 'complete' && (incomplete || !Number.isFinite(saved.completedAt) || saved.completedAt < 0 || !Number.isFinite(saved.bestHoldSeconds) || saved.bestHoldSeconds + 0.001 < target.requiredSeconds)) return null;
    if (saved.status !== 'complete') incomplete = true;
    const evidence = saved.evidence && typeof saved.evidence === 'object' ? practiceEvidence(saved.evidence) : null;
    // Saved observations never decide credit. Preserve a typed recorded SOG;
    // old records without one do not gain a reconstructed observation.
    if (evidence) evidence.speedOverGround = finite(saved.evidence.speedOverGround);
    if (evidence) evidence.anchorSeabedContact = typeof saved.evidence.anchorSeabedContact === 'boolean' ? saved.evidence.anchorSeabedContact : null;
    if(windlassAssessmentVersion&&target.kind==='anchor'&&saved.status==='complete'){
      if(!evidence||!Number.isFinite(evidence.anchorPaidRode)||evidence.anchorPaidRode<0||evidence.anchorPaidRode>250||!Number.isFinite(evidence.anchorRode)||evidence.anchorRode<0||evidence.anchorRode>250||evidence.anchorWinchRunning!==false)return null;
      if(target.target===true&&(evidence.anchor!==true||evidence.anchorSeabedContact!==true||Math.abs(evidence.anchorPaidRode-evidence.anchorRode)>1e-8||(target.minimumRode!==null&&evidence.anchorPaidRode+1e-8<target.minimumRode)))return null;
      if(target.target===false&&(evidence.anchor!==false||evidence.anchorPaidRode>1e-8))return null;
    }
    const historicalAnchor=!windlassAssessmentVersion&&target.kind==='anchor';
    objectives.push({ ...target,
      ...(historicalAnchor?{minimumRode:null,requiresStoppedWindlass:false,label:typeof saved.label==='string'?saved.label.slice(0,300):'Anchor operation (earlier criteria)'}:{}),
      status: saved.status, heldSeconds: bounded(saved.heldSeconds), bestHoldSeconds: bounded(saved.bestHoldSeconds), holdBreaks: Math.floor(bounded(saved.holdBreaks, 100000)), completedAt: saved.status === 'complete' ? bounded(saved.completedAt) : null, evidence });
  }
  if (value.status === 'passed' && incomplete) return null;
  const criticalFailure = value.criticalFailure && typeof value.criticalFailure.code === 'string' && typeof value.criticalFailure.message === 'string' ? { code: value.criticalFailure.code.slice(0, 60), message: value.criticalFailure.message.slice(0, 240) } : null;
  if (criticalFailure?.code === 'collision') criticalFailure.collision = collisionEvidence(value.criticalFailure.collision);
  if (value.status === 'passed' && criticalFailure) return null;
  const report=practiceAssessment({ lessonId: lesson.id,windlassAssessmentVersion, status: value.status === 'passed' ? 'passed' : 'invalid', objectives, hints: Math.floor(bounded(value.hints, 100000)), elapsed: bounded(value.elapsed), attemptNumber: Math.floor(bounded(value.attemptNumber, 100000)), criticalFailure, message: typeof value.debrief?.reason === 'string' ? value.debrief.reason.slice(0, 240) : '' }, lesson);
  if(!windlassAssessmentVersion&&rubric.some(objective=>objective.kind==='anchor'))report.debrief.summary=typeof value.debrief?.summary==='string'?value.debrief.summary.slice(0,1000):null;
  return report;
}
