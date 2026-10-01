import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step, refreshDerived, KNOT } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import { initializeAnchoredScenario, anchorSnapshot } from '../src/anchor.js';
import { lessons } from '../src/learning/curriculum.js';
import { beginAttempt, advanceAttempt, restoreProgress, recordFor } from '../src/learning/engine.js';
import { practiceGroundSpeed, practiceEvidence, practiceStopThreshold, practiceRubric, practiceWindlassComplete, restorePracticeAssessment } from '../src/learning/practice-assessment.js';

const lesson = lessons.find(lesson => lesson.id === 'sail-31');
const ocean = (patch = {}) => {
  const state = Object.assign(initialState(), { x: 3000, z: 3000, heading: 0, speed: 0, leeway: 0, currentSpeed: 0, windSpeed: 0 }, patch);
  applyControlPatch(state, { sails: 0, anchor: false });
  return refreshDerived(state);
};
const tick = (attempt, state, progress, seconds) => {
  for (let time = 0; time < seconds; time += .05) { step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress); }
};

test('displayed stopping targets come from the same stage contract used by assessment', () => {
  const coast = lesson.practice.steps[0], deploy = lesson.practice.steps[1];
  assert.equal(practiceStopThreshold(coast), .8);
  assert.equal(practiceStopThreshold(deploy), .2);
  const departure = lessons.find(lesson => lesson.id === 'sail-32').practice.steps[0];
  assert.equal(practiceStopThreshold(departure), null, 'Weighing anchor has no stopping target');
  assert.equal(practiceStopThreshold({ kind: 'heading', value: 45 }), null);
  assert.equal(practiceStopThreshold({ kind: 'coast', value: NaN }), null);
});

test('zero-current lateral drift cannot complete the anchor settling hold until ground motion decays', () => {
  const state = ocean({ leeway: 1 }), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  // Previously this entire exercise passed in 7.1 s at 0.62 kn sideways,
  // because longitudinal water speed stayed zero throughout.
  for (let time = 0; time < 7.2; time += .05) {
    if (attempt.index === 1 && !state.anchor) initializeAnchoredScenario(state,{rode:45});
    step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress);
  }
  assert.equal(attempt.status, 'active');
  assert.equal(state.speed, 0);
  assert.ok(practiceGroundSpeed(state) > .6);
  assert.ok(attempt.index < 2);
  for (let time = 0; time < 30 && attempt.status === 'active'; time += .05) {
    if (attempt.index === 1 && !state.anchor) initializeAnchoredScenario(state,{rode:45});
    step(state, .05); advanceAttempt(attempt, lesson, state, .05, progress);
  }
  assert.equal(attempt.status, 'passed');
  assert.ok(practiceGroundSpeed(state) < .2);
  const saved = recordFor(progress, lesson.id).lastPracticeResult;
  assert.ok(saved.objectives[1].evidence.speedOverGround < .2);
  assert.ok(saved.objectives[1].evidence.leeway > 0);
  assert.deepEqual(restoreProgress(JSON.stringify(progress)).records[lesson.id].lastPracticeResult, saved);
});

test('coasting in current cannot receive stopping credit from a stale zero-SOG readout', () => {
  const state = ocean({ currentSpeed: 2, currentDirection: 90 }), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  for (let time = 0; time < 4; time += .1) {
    step(state, .1); state.speedOverGround = 0;
    advanceAttempt(attempt, lesson, state, .1, progress);
  }
  assert.equal(attempt.index, 0); assert.equal(attempt.held, 0);
  assert.equal(attempt.status, 'active');
  assert.ok(practiceGroundSpeed(state) >= 2 - 1e-8);
  assert.ok(attempt.objectives[0].evidence.speedOverGround >= 2 - 1e-8);
});

test('anchor settling checks lateral motion after a valid coast checkpoint', () => {
  const state = ocean(), progress = restoreProgress(null), attempt = beginAttempt(lesson, state, progress);
  tick(attempt, state, progress, 3.1); assert.equal(attempt.index, 1);
  initializeAnchoredScenario(state,{rode:45}); state.leeway = .5;
  tick(attempt, state, progress, 4.1);
  assert.equal(attempt.status, 'active'); assert.equal(attempt.index, 1);
  assert.ok(practiceGroundSpeed(state) > .2);
  assert.equal(attempt.held, 0);
});

test('pending, bottom contact and a partly reached target cannot finish the windlass hold', () => {
  const state=ocean(),progress=restoreProgress(null),attempt=beginAttempt(lesson,state,progress);
  tick(attempt,state,progress,3.1);assert.equal(attempt.index,1);
  applyControlPatch(state,{anchorRode:45,anchor:true});refreshDerived(state);
  assert.equal(state.anchorStatus,'Lowering anchor');assert.equal(state.anchorScope,0);
  for(let i=0;i<45;i++)advanceAttempt(attempt,lesson,state,.1,progress);
  assert.equal(attempt.held,0);assert.equal(attempt.objectives[1].evidence.anchorSeabedContact,false);
  tick(attempt,state,progress,100);
  assert.equal(anchorSnapshot(state).seabedContact,true);assert.ok(state.anchorPaidRode<45);assert.equal(attempt.held,0);assert.equal(attempt.status,'active');
  applyControlPatch(state,{anchorWinchRunning:false});tick(attempt,state,progress,5);
  assert.equal(attempt.held,0,'stopping before target cannot earn credit');
  applyControlPatch(state,{anchorRode:state.anchorPaidRode});tick(attempt,state,progress,5);
  assert.equal(attempt.held,0,'lowering the target below the required45m cannot earn credit');
  applyControlPatch(state,{anchorRode:45,anchorWinchRunning:true});tick(attempt,state,progress,17);
  assert.equal(attempt.status,'passed');
  const report=recordFor(progress,lesson.id).lastPracticeResult;
  assert.equal(report.windlassAssessmentVersion,1);assert.equal(report.objectives[1].minimumRode,45);
  assert.equal(report.objectives[1].evidence.anchorPaidRode,45);assert.equal(report.objectives[1].evidence.anchorRode,45);assert.equal(report.objectives[1].evidence.anchorWinchRunning,false);
  assert.deepEqual(restorePracticeAssessment(report,lesson),report);
});

test('all deployment objectives require actual target completion and stopped powered machinery',()=>{
 for(const l of lessons.filter(l=>l.practice))for(const check of l.practice.steps.filter(s=>s.kind==='anchor'&&s.value===true)){
  const required=Math.max(45,check.minimumRode??0),state=initializeAnchoredScenario(ocean(),{rode:required});
  assert.equal(practiceWindlassComplete(state,check),true,l.id);
  state.anchorRode=required+5;assert.equal(practiceWindlassComplete(state,check),false,l.id);
  state.anchorRode=required;state.anchorWinchRunning=true;assert.equal(practiceWindlassComplete(state,check),false,l.id);
  state.anchorWinchRunning=false;state.anchorPaidRode=NaN;assert.equal(practiceWindlassComplete(state,check),false,l.id);
 }
 assert.equal(practiceRubric(lesson)[1].minimumRode,45);
});

test('departure stays at weighing stage until timed retrieval physically stows all paid rode',()=>{
 const departure=lessons.find(l=>l.id==='sail-32');
 const state=Object.assign(initialState(),departure.practice.setup,{windSpeed:0,currentSpeed:0});applyControlPatch(state,{sails:0});initializeAnchoredScenario(state,{rode:35});refreshDerived(state);
 const progress=restoreProgress(null),attempt=beginAttempt(departure,state,progress);
 applyControlPatch(state,{anchor:false});
 for(let i=0;i<20;i++)advanceAttempt(attempt,departure,state,.1,progress);
 assert.equal(attempt.index,0);assert.equal(state.anchor,true);assert.equal(state.anchorPaidRode,35);
 assert.equal(practiceWindlassComplete({...state,anchor:false},departure.practice.steps[0]),false,'a premature false flag cannot bypass actual paid length');
 for(let i=0;i<1390;i++){step(state,.1);advanceAttempt(attempt,departure,state,.1,progress);}
 assert.equal(attempt.index,0);assert.ok(state.anchorPaidRode>0);
 for(let i=0;i<22;i++){step(state,.1);advanceAttempt(attempt,departure,state,.1,progress);}
 assert.equal(state.anchor,false);assert.equal(state.anchorPaidRode,0);assert.equal(attempt.index,1);
 assert.equal(attempt.objectives[0].evidence.anchorWinchRunning,false);assert.equal(attempt.objectives[0].evidence.anchorPaidRode,0);
});

test('historical anchor passes retain earlier criteria and never acquire missing windlass measurements',()=>{
 const state=ocean(),progress=restoreProgress(null),attempt=beginAttempt(lesson,state,progress);
 tick(attempt,state,progress,3.1);initializeAnchoredScenario(state,{rode:45});tick(attempt,state,progress,4.2);
 const current=recordFor(progress,lesson.id).lastPracticeResult;assert.equal(current.status,'passed');
 const old=structuredClone(current);delete old.windlassAssessmentVersion;
 for(const objective of old.objectives){delete objective.minimumRode;delete objective.requiresStoppedWindlass;delete objective.evidence.anchorPaidRode;delete objective.evidence.anchorRode;delete objective.evidence.anchorWinchRunning;}
 old.objectives[1].label='Drop anchor and settle below0.2kn';old.debrief.summary='Earlier slowing and sequencing exercise.';
 const restored=restorePracticeAssessment(old,lesson);assert.equal(restored.status,'passed');assert.equal(restored.windlassAssessmentVersion,null);assert.equal(restored.objectives[1].minimumRode,null);assert.equal(restored.objectives[1].requiresStoppedWindlass,false);assert.equal(restored.objectives[1].label,old.objectives[1].label);
 assert.equal(restored.objectives[1].evidence.anchorPaidRode,null);assert.equal(restored.objectives[1].evidence.anchorRode,null);assert.equal(restored.objectives[1].evidence.anchorWinchRunning,null);assert.equal(restored.debrief.summary,old.debrief.summary);
 assert.deepEqual(restorePracticeAssessment(JSON.parse(JSON.stringify(restored)),lesson),restored);
 const history=restoreProgress({version:1,records:{[lesson.id]:{practice:true,attempts:1,lastPracticeResult:old}}});assert.equal(history.records[lesson.id].practice,true);assert.equal(history.records[lesson.id].lastPracticeResult.windlassAssessmentVersion,null);
 for(const patch of [{anchorPaidRode:'45'},{anchorRode:null},{anchorWinchRunning:'false'},{anchorPaidRode:40},{anchor:false}]){const damaged=structuredClone(current);Object.assign(damaged.objectives[1].evidence,patch);assert.equal(restorePracticeAssessment(damaged,lesson),null);}
});

test('ground speed combines signed water motion with current and never trusts cached SOG', () => {
  const stationary = ocean({ heading: 0, speed: -2, currentSpeed: 2, currentDirection: 0 });
  stationary.speedOverGround = 999;
  assert.ok(practiceGroundSpeed(stationary) < 1e-9);
  assert.ok(practiceEvidence(stationary).speedOverGround < 1e-9);
  assert.equal(practiceGroundSpeed({ speed: -.1 }), .1); // Legacy scalar fixture.
  assert.equal(practiceGroundSpeed({ heading: 90, speed: .1 }), .1);
  for (const patch of [{ heading: NaN }, { leeway: NaN }, { currentSpeed: Infinity }, { currentDirection: null }]) {
    assert.ok(Number.isNaN(practiceGroundSpeed({ heading: 0, speed: 0, speedOverGround: 0, ...patch })));
  }
  assert.equal(practiceGroundSpeed({ ...stationary, grounded: true }), 0);
  assert.ok(Math.abs(practiceGroundSpeed({ heading: 0, speed: 0, leeway: KNOT }) - 1) < 1e-9);
});
