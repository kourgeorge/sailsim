import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {createPracticeState} from '../src/learning/scenario-state.js';
import {windOverWater} from '../src/physics.js';
import {practiceConditions,practiceHeadingTarget} from '../src/learning/practice-conditions.js';
import {practiceEvidence} from '../src/learning/practice-assessment.js';
import {beginAttempt,advanceAttempt,restoreProgress} from '../src/learning/engine.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const beam=lessons.find(l=>l.id==='sail-09');
const boat=patch=>Object.assign(createPracticeState(),{windDirection:0,windSpeed:6,currentDirection:90,currentSpeed:8,speed:3},patch);
const assessment=()=>({events:new Set(),maneuver:null,maneuverSide:0});

test('wind requirements and evidence recompute water-relative wind instead of trusting stale telemetry',()=>{
 const state=boat({heading:90,waterWindAngle:90,waterWindSpeed:999,waterWindDirection:0});
 let rows=practiceConditions(beam.practice.steps[0],state,assessment());
 near(rows[0].actual,36.86989764584405);assert.equal(rows[0].met,false);
 near(practiceHeadingTarget(beam.practice.steps[0],state),145.63010235415595);
 const water=windOverWater(state);state.heading=water.direction+90;
 rows=practiceConditions(beam.practice.steps[0],state,assessment());
 near(rows[0].actual,90);assert.equal(rows.every(r=>r.met),true);
 const evidence=practiceEvidence(state);near(evidence.waterWindSpeed,10);near(evidence.waterWindDirection,water.direction);near(evidence.waterWindAngle,-90);
 assert.equal(evidence.windDirection,0);assert.equal(evidence.windSpeed,6);
 const unknown=practiceEvidence({...state,windSpeed:null});assert.equal(unknown.waterWindSpeed,null);assert.equal(unknown.waterWindAngle,null);
});

test('a tack crosses the water wind even when it never crosses the ground-wind bearing',()=>{
 const lesson=lessons.find(l=>l.practice?.steps[0].kind==='tack'),state=boat(),progress=restoreProgress(null),direction=windOverWater(state).direction;
 state.heading=direction-50;
 const attempt=beginAttempt(lesson,state,progress);near(attempt.previousAngle,-50);
 state.heading=direction+50;advanceAttempt(attempt,lesson,state,.1,progress);
 assert.equal(attempt.maneuver,'tack');assert.equal(attempt.maneuverSide,1);assert.ok(attempt.held>0);
 for(let i=0;i<100&&attempt.status==='active';i++)advanceAttempt(attempt,lesson,state,.1,progress);
 assert.equal(attempt.status,'passed');
});

test('calm water-relative wind fails angle/recovery/crossing requirements and clears stale crossing history',()=>{
 const state=boat({windSpeed:3,windDirection:0,currentSpeed:3,currentDirection:180,heading:50});
 assert.equal(windOverWater(state).angle,null);
 assert.equal(practiceHeadingTarget(beam.practice.steps[0],state),null);
 for(const check of [{kind:'windAngle',value:[0,105]},{kind:'recover'},{kind:'tack'},{kind:'gybe'}]){
  const a={...assessment(),maneuver:check.kind,maneuverSide:1};
  assert.equal(practiceConditions(check,state,a).every(r=>r.met),false);
 }
 const lesson=lessons.find(l=>l.practice?.steps[0].kind==='tack'),progress=restoreProgress(null),attempt=beginAttempt(lesson,state,progress);
 assert.equal(attempt.previousAngle,null);
 attempt.previousAngle=-50;attempt.maneuver='tack';attempt.maneuverSide=1;
 advanceAttempt(attempt,lesson,state,.1,progress);
 assert.equal(attempt.previousAngle,null);assert.equal(attempt.maneuver,null);assert.equal(attempt.held,0);
 const evidence=practiceEvidence(state);assert.equal(evidence.waterWindSpeed,0);assert.equal(evidence.waterWindAngle,null);assert.equal(evidence.waterWindDirection,null);
});

test('water-frame assessment retains raw weather locks',()=>{
 const state=boat({heading:143.13010235415595}),progress=restoreProgress(null),attempt=beginAttempt(beam,state,progress);
 state.windSpeed+=1;
 advanceAttempt(attempt,beam,state,.1,progress);
 assert.equal(attempt.status,'invalid');assert.equal(attempt.criticalFailure.code,'conditions-changed');
});
