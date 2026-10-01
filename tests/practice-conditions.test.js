import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {createPracticeState} from '../src/learning/scenario-state.js';
import {practiceConditions} from '../src/learning/practice-conditions.js';
import {practiceWindlassComplete} from '../src/learning/practice-assessment.js';
import {initializeAnchoredScenario} from '../src/anchor.js';

const attempt=()=>({events:new Set(),maneuver:null,maneuverSide:0});
const passed=rows=>rows.every(row=>row.met);

test('every authored predicate exposes stable typed display rows',()=>{
 for(const lesson of lessons.filter(l=>l.practice)){
  const state=createPracticeState(lesson.practice.setup);
  for(const check of lesson.practice.steps){
   const rows=practiceConditions(check,state,attempt());
   assert.ok(rows.length>0);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
   for(const row of rows){
    assert.deepEqual(Object.keys(row).sort(),['actual','id','label','met','target','unit']);
    assert.equal(typeof row.label,'string');assert.equal(typeof row.unit,'string');assert.equal(typeof row.met,'boolean');
    for(const value of [row.actual,row.target])assert.ok(['number','string','boolean'].includes(typeof value));
   }
  }
 }
 assert.equal(passed(practiceConditions({kind:'unknown'},{},attempt())),false);
});

test('beam-reach feedback reveals speed is met while the wind-angle requirement fails',()=>{
 const lesson=lessons.find(l=>l.id==='sail-09'),state=createPracticeState(lesson.practice.setup),check=lesson.practice.steps[0];
 const rows=practiceConditions(check,state,attempt());
 assert.deepEqual(rows.map(({id,actual,target,met})=>({id,actual,target,met})),[
  {id:'true-wind-angle',actual:120,target:'80–105',met:false},
  {id:'boat-speed',actual:3,target:'> 2',met:true},
 ]);
 for(const twa of [80,105]){
  state.heading=(state.windDirection+twa)%360;state.speed=2;
  assert.equal(passed(practiceConditions(check,state,attempt())),false,'speed must exceed two');
  state.speed=-2.01;
  assert.equal(passed(practiceConditions(check,state,attempt())),true,'preserve existing absolute-surge grading');
 }
});

test('anchor feedback preserves the exact powered-operation helper and endpoint tolerance',()=>{
 const state=createPracticeState({sails:0}),check={kind:'anchor',value:true,minimumRode:45};
 initializeAnchoredScenario(state,{rode:45});state.anchorWinchRunning=false;
 for(const patch of [{},{anchorWinchRunning:true},{anchorWinchRunning:false,anchorPaidRode:44.9},{anchorPaidRode:45,anchorRode:46},{anchorRode:45,anchorPaidRode:NaN}]){
  Object.assign(state,patch);
  const rows=practiceConditions(check,state,attempt()),operation=rows.find(r=>r.id==='anchor-operation');
  assert.equal(operation.met,practiceWindlassComplete(state,check));
  assert.equal(passed(rows),practiceWindlassComplete(state,check));
 }
 const up={kind:'anchor',value:false};
 Object.assign(state,{anchor:false,anchorPaidRode:1e-9,anchorRode:0,anchorWinchRunning:false});
 assert.equal(passed(practiceConditions(up,state,attempt())),true);
 state.anchorPaidRode=1e-7;
 assert.equal(passed(practiceConditions(up,state,attempt())),false);
});
