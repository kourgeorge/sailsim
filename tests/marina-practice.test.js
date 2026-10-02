import test from 'node:test';
import assert from 'node:assert/strict';
import {marinaLessons,marinaCues} from '../src/learning/marina-course.js';
import {createPracticeState} from '../src/learning/scenario-state.js';
import {practiceConditions} from '../src/learning/practice-conditions.js';
import {beginAttempt,advanceAttempt,restoreProgress,recordFor} from '../src/learning/engine.js';
import {step} from '../src/physics.js';

const create=lesson=>{const state=createPracticeState(lesson.practice.setup),progress=restoreProgress(null);return {state,progress,attempt:beginAttempt(lesson,state,progress),lesson};};
const tick=(r,seconds=.1)=>{for(let i=0;i<seconds*10;i++)advanceAttempt(r.attempt,r.lesson,r.state,.1,r.progress);};
const passes=(check,state)=>practiceConditions(check,state,{events:new Set()}).every(row=>row.met);

test('marina preparations use a vacant berth, distinct ordered routes and matching chart cues',()=>{
 for(const lesson of marinaLessons){
  const r=create(lesson);
  assert.equal(r.state.mainHoist,0);assert.equal(r.state.jibHoist,0);assert.equal(r.state.speed,0);assert.equal(r.state.throttle,0);
  assert.ok(!r.state.worldBodies.some(body=>body.id==='haven:yacht:moored:0'));
  assert.equal(r.state.worldBodies.filter(body=>body.visual?.type==='yacht'&&body.kind==='moored').length,3);
  for(const [index,check] of lesson.practice.steps.entries()){
   const cues=marinaCues(lesson,index);
   assert.deepEqual(cues.target,{x:check.value.x,z:check.value.z,radius:check.value.radius,...(check.kind==='engineStop'?{heading:check.value.heading}:{})});
   if(cues.gate)assert.equal(cues.gate.heading,check.value.heading);
  }
 }
});

test('forward motion cannot satisfy reversing and a final berth position cannot skip the approach',()=>{
 const exit=marinaLessons[2],check=exit.practice.steps[0],r=create(exit);
 Object.assign(r.state,check.value,{speed:.7});assert.equal(passes(check,r.state),false);
 r.state.speed=-.7;assert.equal(passes(check,r.state),true);
 const dock=create(marinaLessons[1]);Object.assign(dock.state,{x:367,z:37,heading:90,speed:0});tick(dock,20);
 assert.equal(dock.attempt.index,0);assert.equal(recordFor(dock.progress,dock.lesson.id).practice,false);
});

test('berth stop checks position, heading, both sails, anchor, ground motion and neutral together',()=>{
 const lesson=marinaLessons[1],check=lesson.practice.steps[1],state=createPracticeState(lesson.practice.setup);
 Object.assign(state,{x:367,z:37,heading:90,speed:0});assert.equal(passes(check,state),true);
 for(const patch of [{x:369.01},{heading:101},{speed:.16},{leeway:.15},{currentSpeed:.2},{throttle:.05},{anchor:true},{mainHoist:.03},{jibHoist:.03},{depth:2.9}]){
  assert.equal(passes(check,{...state,...patch}),false,JSON.stringify(patch));
 }
});

test('a broken berth hold resets and completed engine evidence survives reloading',()=>{
 const r=create(marinaLessons[1]);Object.assign(r.state,{x:340,z:37,speed:.5,heading:90,throttle:.1});tick(r);
 assert.equal(r.attempt.index,1);Object.assign(r.state,{x:367,speed:0,throttle:0});tick(r,4);
 r.state.heading=110;tick(r);assert.equal(r.attempt.held,0);r.state.heading=90;tick(r,4);
 assert.equal(r.attempt.status,'active');tick(r,1.2);assert.equal(r.attempt.status,'passed');
 const saved=restoreProgress(JSON.stringify(r.progress)).records[r.lesson.id];
 assert.equal(saved.practice,true);assert.equal(saved.lastPracticeResult.status,'passed');assert.equal(saved.lastPracticeResult.objectives[1].evidence.throttle,0);
});

test('marina limits invalidate and persist failed attempts without changing sailing rules',()=>{
 for(const [patch,code] of [[{mainHoist:1},'sails-raised'],[{jibHoist:1},'sails-raised'],[{speed:2.51},'speed-limit'],[{x:900},'practice-area'],[{windSpeed:8},'conditions-changed'],[{grounded:true},'grounding'],[{anchor:true},'early-anchor'],[{collisionCount:1},'collision']]){
  const r=create(marinaLessons[0]);Object.assign(r.state,patch);tick(r);
  assert.equal(r.attempt.status,'invalid');assert.equal(r.attempt.criticalFailure.code,code);
  const saved=restoreProgress(JSON.stringify(r.progress)).records[r.lesson.id];assert.equal(saved.practice,false);assert.equal(saved.lastPracticeResult.status,'failed');
 }
 const r=create(marinaLessons[0]);r.state.throttle=.2;tick(r);assert.equal(r.attempt.status,'active');
});

test('actual pontoon impact ends a marina attempt rather than supplying stopping credit',()=>{
 const r=create(marinaLessons[2]);r.state.throttle=.6;
 for(let i=0;i<400&&r.attempt.status==='active';i++){step(r.state,.1);tick(r);}
 assert.equal(r.attempt.status,'invalid');assert.equal(r.attempt.criticalFailure.code,'collision');
 assert.match(r.attempt.criticalFailure.collision.bodyId,/marina/);assert.equal(recordFor(r.progress,r.lesson.id).practice,false);
});
