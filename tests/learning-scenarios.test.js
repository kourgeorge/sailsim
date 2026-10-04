import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {runScenario} from '../scripts/check-training-scenarios.mjs';
import {initialState,apparentWind,angleDifference} from '../src/physics.js';

test('all practical checkpoints are reachable through real physics and control inputs',()=>{
 const practical=lessons.filter(l=>l.practice);assert.equal(practical.length,23);
 for(const lesson of practical){const r=runScenario(lesson);assert.equal(r.status,'passed',`${lesson.id} ${lesson.title}: ${JSON.stringify(r)}`);assert.equal(r.checkpoints.length,lesson.practice.steps.length);assert.ok(r.minDepth>=3,`${lesson.id} needs safe sea room`);assert.ok(r.seconds<1200);if(lesson.practice.steps.some(s=>s.kind==='tack'))assert.ok(r.crossings.some(c=>c.kind==='bow'));if(lesson.practice.steps.some(s=>s.kind==='gybe'))assert.ok(r.crossings.some(c=>c.kind==='stern'));}
});
test('coasting with sails down cannot demonstrate mainsail trim or reefing',()=>{
 for(const [id,patch] of [['sail-12',{mainHoist:0,jibHoist:0,sails:0,speed:3}],['sail-18',{mainHoist:0,jibHoist:1,reefLevel:1,reef:true,speed:3}]]){
  const lesson=structuredClone(lessons.find(l=>l.id===id));Object.assign(lesson.practice.setup,patch);
  const result=runScenario(lesson,{maxSeconds:20});assert.notEqual(result.status,'passed',`${id} must require an operating mainsail`);
 }
});
test('stopping and deploying zero rode cannot earn anchoring evidence',()=>{
 const lesson=structuredClone(lessons.find(l=>l.id==='sail-31'));lesson.practice.setup.anchorRode=0;
 const result=runScenario(lesson,{maxSeconds:300});assert.equal(result.status,'timeout');assert.equal(result.checkpoint,1);assert.equal(result.final.anchorStatus,'Stowed');
});
test('tacks across compass north are recorded in both directions with recovered speed',()=>{
 for(const heading of [310,50]){const l=structuredClone(lessons.find(l=>l.id==='sail-14'));l.practice.setup={...l.practice.setup,heading,windDirection:0};const r=runScenario(l);assert.equal(r.status,'passed');assert.deepEqual(r.crossings.map(c=>c.kind),['bow']);assert.ok(r.final.speed>2);assert.notEqual(Math.sign(angleDifference(heading,0)),Math.sign(angleDifference(r.final.heading,0)));assert.ok(Math.abs(r.final.x)>5&&r.final.z< -20,'The boat must physically move during the tack');}
});
test('wind bearings denote their source and apparent wind shifts forward with boat motion',()=>{
 const s=Object.assign(initialState(),{heading:90,windDirection:0,windSpeed:12,speed:0,currentSpeed:0,leeway:0});assert.equal(apparentWind(s).angle,-90);s.speed=6;assert.ok(apparentWind(s).angle> -90&&apparentWind(s).angle<0);
 s.heading=0;assert.ok(Math.abs(apparentWind(s).angle)<1e-9);assert.ok(Math.abs(apparentWind(s).speed-18)<1e-9);
 s.heading=180;assert.ok(Math.abs(Math.abs(apparentWind(s).angle)-180)<1e-9);assert.ok(Math.abs(apparentWind(s).speed-6)<1e-9);
});
