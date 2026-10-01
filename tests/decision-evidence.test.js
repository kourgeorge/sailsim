import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/learning/curriculum.js';
import { restoreProgress, recordFor, masteredIds, checkKnowledge, recordDecisionResult } from '../src/learning/engine.js';
import { decisionEvidenceValues } from '../src/learning/decision-evidence.js';

function scenarioLesson(t, index = 0) {
  const lesson = lessons[index], oldId = lesson.decisionScenarioId, oldObjectives = lesson.decisionObjectiveIds;
  lesson.decisionScenarioId = `decision-${lesson.id}`;
  lesson.decisionObjectiveIds = ['prepare', 'plan', 'commit'];
  t.after(() => { if (oldId === undefined) delete lesson.decisionScenarioId; else lesson.decisionScenarioId = oldId; if (oldObjectives === undefined) delete lesson.decisionObjectiveIds; else lesson.decisionObjectiveIds = oldObjectives; });
  return lesson;
}
function reportFor(lesson, id = 'run-1') {
  return { version: 1, id, lessonId: lesson.id, scenarioId: lesson.decisionScenarioId, status: 'passed', score: 100, maxScore: 100, elapsed: 25, hints: 0, criticalFailure: null, penalties: [], objectives: lesson.decisionObjectiveIds.map((id, index) => ({ id, label: id, status: 'complete', maxPoints: index === 0 ? 34 : 33, points: index === 0 ? 34 : 33, attempts: 1, completedAt: 5 + 10 * index, evidence: { choice: 'safe', numeric: 1.7 }, inspected: ['chart'] })), debrief: { reason: 'complete', summary: 'Plan complete', practiceTransfer: 'Rehearse aboard with an instructor.' } };
}

test('decision mastery requires both correct knowledge and a matching complete scored scenario', t => {
  const lesson = scenarioLesson(t), progress = restoreProgress(null);
  checkKnowledge(progress, lesson, lesson.quiz.map(question => question.correct));
  assert.equal(recordFor(progress, lesson.id).knowledge, true);
  assert.equal(recordFor(progress, lesson.id).decision, false);
  assert.equal(recordFor(progress, lesson.id).passedAt, null);
  assert.equal(masteredIds(progress).has(lesson.id), false);
  assert.equal(recordDecisionResult(progress, lesson, reportFor(lesson)).status, 'passed');
  assert.equal(recordFor(progress, lesson.id).decision, true);
  assert.equal(recordFor(progress, lesson.id).practice, false);
  assert.ok(recordFor(progress, lesson.id).passedAt);
  assert.equal(masteredIds(progress).has(lesson.id), true);
  const reverse = restoreProgress(null);
  recordDecisionResult(reverse, lesson, reportFor(lesson));
  assert.equal(masteredIds(reverse).has(lesson.id), false);
  checkKnowledge(reverse, lesson, lesson.quiz.map(question => question.correct));
  assert.equal(masteredIds(reverse).has(lesson.id), true);
});

test('reports cannot skip objectives, forge points, coerce numbers, or offset a critical failure', t => {
  const lesson = scenarioLesson(t);
  const mutate = [
    report => { report.version = '1'; }, report => { report.scenarioId = 'wrong'; },
    report => { report.lessonId = 'sail-99'; }, report => { report.score = '100'; },
    report => { report.score = NaN; }, report => { report.score = Infinity; },
    report => { report.elapsed = '25'; }, report => { report.hints = '0'; },
    report => { report.objectives.pop(); }, report => { report.objectives[1].id = 'unknown'; },
    report => { report.objectives[1].status = 'upcoming'; report.objectives[1].points = 0; },
    report => { report.objectives[0].points = '34'; }, report => { report.objectives[0].maxPoints = 100; },
    report => { report.objectives[0].attempts = 1.5; },
    report => { report.criticalFailure = { code: 'unsafe-decision', message: 'Unsafe' }; },
    report => { report.score = 75; report.penalties = [{ code: 'revised-decision', count: 5, points: 25 }]; },
    report => { report.penalties = [{ code: 'revised-decision', count: '0', points: 0 }]; },
    report => { report.penalties = [{ code: 'unknown', count: 0, points: 0 }]; },
  ];
  for (const mutation of mutate) {
    const report = reportFor(lesson), progress = restoreProgress(null);
    mutation(report);
    assert.equal(recordDecisionResult(progress, lesson, report), null, mutation.toString());
    assert.equal(Object.keys(progress.records).length, 0);
  }
  const threshold = reportFor(lesson); threshold.score = 80; threshold.penalties = [{ code: 'revised-decision', count: 4, points: 20 }];
  assert.equal(recordDecisionResult(restoreProgress(null), lesson, threshold).status, 'passed');
});

test('attempt IDs deduplicate, last5 history is bounded, and later failures preserve decision evidence', t => {
  const lesson = scenarioLesson(t), progress = restoreProgress(null), report = reportFor(lesson);
  recordDecisionResult(progress, lesson, report);
  recordDecisionResult(progress, lesson, report);
  assert.equal(recordFor(progress, lesson.id).decisionAttempts, 1);
  for (let i = 2; i <= 8; i++) {
    const failed = reportFor(lesson, `run-${i}`); failed.status = 'failed'; failed.score = 75; failed.penalties = [{ code: 'revised-decision', count: 5, points: 25 }];
    recordDecisionResult(progress, lesson, failed);
  }
  const record = recordFor(progress, lesson.id);
  assert.equal(record.decision, true);
  assert.equal(record.decisionAttempts, 8);
  assert.deepEqual(record.decisionResults.map(report => report.id), ['run-4', 'run-5', 'run-6', 'run-7', 'run-8',]);
  assert.equal(record.lastDecisionResult.status, 'failed');
  const restored = restoreProgress(JSON.stringify(progress));
  assert.equal(restored.records[lesson.id].decision, true);
  assert.deepEqual(restored.records[lesson.id].decisionResults, record.decisionResults);
});

test('legacy knowledge and physical practice survive but no historic decision credit is invented', t => {
  const lesson = scenarioLesson(t), physical = lessons.find(lesson => lesson.practice);
  const progress = restoreProgress({ version: 1, records: {
    [lesson.id]: { knowledge: true, passedAt: '2026-10-01T00:00:00Z' },
    [physical.id]: { knowledge: true, practice: true, attempts: 2 },
  } });
  assert.equal(progress.records[lesson.id].knowledge, true);
  assert.equal(progress.records[lesson.id].decision, false);
  assert.equal(progress.records[lesson.id].lastDecisionResult, null);
  assert.equal(progress.records[physical.id].practice, true);
  assert.equal(masteredIds(progress).has(lesson.id), false);
  const forged = restoreProgress({ version: 1, records: { [lesson.id]: { decision: 'true', decisionAttempts: '1', lastDecisionResult: reportFor(lesson) } } });
  assert.equal(forged.records[lesson.id].decision, false);
});

test('decision observation payloads and strings are bounded and copied, never executable', t => {
  const lesson = scenarioLesson(t), progress = restoreProgress(null), report = reportFor(lesson);
  report.objectives[0].evidence = JSON.parse('{"__proto__":{"polluted":true},"choice":"safe"}');
  report.objectives[0].evidence.huge = 1e300;
  report.objectives[0].evidence.invalid = Infinity;
  report.objectives[0].inspected = Array(100).fill('x'.repeat(200));
  const saved = recordDecisionResult(progress, lesson, report);
  assert.equal(saved.objectives[0].evidence.huge, 1e7);
  assert.equal(saved.objectives[0].evidence.invalid, null);
  assert.equal(Object.hasOwn(saved.objectives[0].evidence, '__proto__'), false);
  assert.equal(saved.objectives[0].inspected.length, 30);
  assert.equal(saved.objectives[0].inspected[0].length, 80);
  report.objectives[0].evidence.choice = 'changed';
  assert.equal(saved.objectives[0].evidence.choice, 'safe');
});

test('accepted legacy reports expose a safe empty action map when root evidence is absent or malformed', t => {
  const lesson = scenarioLesson(t);
  for (const evidence of [undefined, null, [], ['action'], false, 12, 'old summary']) {
    const report = reportFor(lesson);
    report.objectives[0].evidence = evidence;
    const restored = recordDecisionResult(restoreProgress(null), lesson, report);
    assert.ok(restored);
    assert.deepEqual(restored.objectives[0].evidence, {});
    assert.deepEqual(decisionEvidenceValues(report.objectives[0]), {});
    assert.equal(Object.hasOwn(decisionEvidenceValues(report.objectives[0]), 'choice'), false);
  }
  const row = { evidence: { choice: 'safe' } };
  assert.deepEqual(decisionEvidenceValues(row), { choice: 'safe' });
  assert.deepEqual(decisionEvidenceValues(), {});
});
