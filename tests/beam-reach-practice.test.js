import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {createPracticeState} from '../src/learning/scenario-state.js';
import {step,apparentWind,suggestedSheet,angleDifference,clamp} from '../src/physics.js';
import {applyControlPatch} from '../src/vessel-controls.js';
import {beginAttempt,advanceAttempt,restoreProgress,recordFor,practiceAssessment} from '../src/learning/engine.js';

const lesson=lessons.find(l=>l.id==='sail-09'),DT=.1;
function fixture(){
 const boat=createPracticeState(lesson.practice.setup),progress=restoreProgress(null);
 return {boat,progress,attempt:beginAttempt(lesson,boat,progress)};
}
// Only operate real helm/sheet controls. Do not assign boat heading, velocity,
// elapsed time, or assessment state to manufacture a passing demonstration.
function sail(f,target){
 const {boat,attempt,progress}=f,sheet=suggestedSheet(apparentWind(boat).angle);
 applyControlPatch(boat,{rudder:clamp(angleDifference(target,boat.heading)*1.5-boat.yawRate*3,-25,25),mainSheet:sheet,jibSheet:sheet});
 step(boat,DT);advanceAttempt(attempt,lesson,boat,DT,progress);
 assert.equal(boat.grounded,false);assert.equal(boat.collisionCount,0);
}
function until(f,target,predicate,limitSeconds=40){
 for(let i=0;i<limitSeconds/DT&&!predicate();i++)sail(f,target);
 assert.ok(predicate(),`Condition was not reached within ${limitSeconds}s; ${JSON.stringify({status:f.attempt.status,heading:f.boat.heading,speed:f.boat.speed,held:f.attempt.held})}`);
}

test('beam reach requires wind angle as well as speed; real steering completes the authored exercise',()=>{
 const f=fixture(),{boat,attempt,progress}=f;
 assert.equal(boat.heading,75);assert.equal(boat.windDirection,315);
 for(let i=0;i<400;i++){sail(f,75);assert.ok(boat.speed>2);}
 assert.equal(Math.abs(angleDifference(boat.heading,boat.windDirection)),120);
 assert.equal(attempt.status,'active');assert.equal(attempt.held,0);
 assert.equal(practiceAssessment(attempt,lesson).score,0);
 assert.equal(recordFor(progress,lesson.id).practice,false);

 until(f,45,()=>attempt.status!=='active');
 const report=practiceAssessment(attempt,lesson),evidence=report.objectives[0].evidence;
 assert.equal(attempt.status,'passed');assert.equal(report.score,100);
 assert.ok(report.objectives[0].heldSeconds>=8);
 assert.ok(evidence.speed>2);
 assert.ok(Math.abs(angleDifference(evidence.heading,evidence.windDirection))>=80);
 assert.ok(Math.abs(angleDifference(evidence.heading,evidence.windDirection))<=105);
 assert.equal(recordFor(progress,lesson.id).practice,true);

 const endedElapsed=attempt.elapsed,saved=JSON.stringify(recordFor(progress,lesson.id).lastPracticeResult);
 for(let i=0;i<100;i++)advanceAttempt(attempt,lesson,boat,DT,progress);
 assert.equal(attempt.elapsed,endedElapsed,'completed attempts stop accepting assessment time');
 assert.equal(JSON.stringify(recordFor(progress,lesson.id).lastPracticeResult),saved);
});

test('leaving the beam reach under real helm control resets its continuous eight-second hold',()=>{
 const f=fixture(),{attempt,boat}=f;
 until(f,45,()=>attempt.held>=2);
 const firstHold=attempt.held;
 until(f,85,()=>attempt.held===0);
 assert.equal(attempt.status,'active');assert.ok(boat.speed>2);
 assert.ok(Math.abs(angleDifference(boat.heading,boat.windDirection))>105);
 assert.ok(attempt.objectives[0].holdBreaks>=1);
 const resetAt=attempt.elapsed;
 until(f,45,()=>attempt.status!=='active');
 assert.equal(attempt.status,'passed');
 assert.ok(attempt.elapsed-resetAt>=8,'the earlier partial hold must not count after leaving tolerance');
 assert.ok(attempt.objectives[0].heldSeconds>=8);
 assert.ok(firstHold<8);
});
