import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {createPracticeState} from '../src/learning/scenario-state.js';
import {restoreProgress,beginAttempt,advanceAttempt,recordEvent} from '../src/learning/engine.js';
import {step} from '../src/physics.js';
import {applyControlPatch} from '../src/vessel-controls.js';
import {runScenario} from '../scripts/check-training-scenarios.mjs';

const physicalLessons=lessons.filter(lesson=>lesson.practice);
function exercise(lesson){
 const state=createPracticeState(lesson.practice.setup),progress=restoreProgress(null);
 return {lesson,state,progress,attempt:beginAttempt(lesson,state,progress)};
}
function sail(run,seconds){
 for(let frame=0;frame<seconds*10&&run.attempt.status==='active';frame++){
  step(run.state,.1);
  advanceAttempt(run.attempt,run.lesson,run.state,.1,run.progress);
 }
 return run;
}

// Two minutes covers the former automatic acceleration (13 s), waypoint (33 s),
// and heading (10 s) credit. Use the production force/contact model and judge:
// state-only assertions would miss a yacht accelerating or drifting into a goal.
for(const lesson of physicalLessons)test(`${lesson.id}: two minutes untouched earns no first objective`,()=>{
 const run=sail(exercise(lesson),120);
 assert.equal(run.attempt.completed.length,0,`${lesson.title} awarded an objective without learner input`);
 assert.notEqual(run.attempt.status,'passed');
});

test('sail-07: one sail-raising control starts actual acceleration and completes the early exercise',()=>{
 const run=exercise(lessons.find(lesson=>lesson.id==='sail-07'));
 sail(run,15);
 assert.equal(run.attempt.completed.length,0);
 assert.ok(Math.abs(run.state.speed)<.01,'waiting with sails lowered supplies no drive');
 applyControlPatch(run.state,{sails:1});
 sail(run,60);
 assert.equal(run.attempt.status,'passed',run.attempt.message);
 assert.ok(run.state.speed>3);
 assert.equal(run.state.rudder,0,'this early exercise needs no steering correction');
 assert.equal(run.state.collisionCount,0);
 assert.equal(run.state.grounded,false);
});

test('sail-22: opening the chart alone does not sail to the waypoint',()=>{
 const run=exercise(lessons.find(lesson=>lesson.id==='sail-22'));
 recordEvent(run.attempt,'event','chart');
 sail(run,120);
 assert.equal(run.attempt.completed.length,1,'only the chart objective should complete');
 assert.notEqual(run.attempt.status,'passed');
});

for(const id of ['sail-22','sail-24','sail-35'])test(`${id}: active helm and sail controls complete every authored stage`,()=>{
 const result=runScenario(lessons.find(lesson=>lesson.id===id));
 assert.equal(result.status,'passed',result.reason??JSON.stringify(result));
 assert.equal(result.final.collisionCount,0);
 assert.equal(result.final.grounded,false);
});
