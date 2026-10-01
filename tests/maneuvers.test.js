import test from 'node:test';
import assert from 'node:assert/strict';
import { step, clamp, angleDifference } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import { drills, maneuverStrings, createDrillState, beginManeuver, advanceManeuver, maneuverTelemetry, maneuverResult, cancelManeuver } from '../src/learning/maneuvers.js';

const pilot=(id)=>{
 const s=createDrillState(id),a=beginManeuver(id,s);let precisionBraking=false;
 for(let t=0;t<400&&a.status==='active';t+=.05){
  let throttle=0;
  if(id==='engine-stop'){
   if(a.index===0)throttle=clamp(.09+(2.5-s.speed)*.6,0,.7);
   else if(a.index===2&&s.speed>.1)throttle=-.4;
  }else if(id==='astern-track'){
   if(a.index<2)throttle=-clamp(.05+(1.2-Math.abs(s.speed))*.7,0,.6);
   else if(s.speed<-.1&&(a.lastGear===1||a.neutralHeld>=.4-1e-8))throttle=.4;
  }else {
   if(a.index===1&&s.z<793)precisionBraking=true;
   if(!precisionBraking)throttle=clamp(.04+(1.15-s.speed)*.5,0,.6);
   else if(s.speed>.1&&(a.lastGear===-1||a.neutralHeld>=.4-1e-8))throttle=-.3;
  }
  const rudder=id==='astern-track'&&a.index>=1&&s.speed<-.2?clamp(angleDifference(s.heading,340)*2+s.yawRate*4,-25,25):0;
  applyControlPatch(s,{throttle,rudder});step(s,.05);advanceManeuver(a,s,.05);
 }
 return {s,a};
};

test('all maneuvering drills are completable using only actual engine controls and physics',()=>{
 for(const d of drills){const {s,a}=pilot(d.id);assert.equal(a.status,'passed',`${d.id}: ${a.message} at ${a.elapsed}s, stage ${a.index}, speed ${s.speed}`);assert.equal(a.completed.length,d.steps.length);assert.ok(a.elapsed>15);assert.ok(a.metrics.peakSpeed<=d.maxSpeed);assert.ok(a.metrics.minDepth>=3);assert.equal(s.throttle,0);assert.ok(Math.abs(s.speed)<.25);assert.ok(a.metrics.stoppingDistance>0);}
});
test('precision result records the actual gate crossing speed, offset, and time',()=>{
 const {a,s}=pilot('precision-approach'),m=maneuverTelemetry(a,s),r=maneuverResult(a);
 assert.ok(r.gateCrossing.speed>=.5&&r.gateCrossing.speed<=1.5);assert.ok(Math.abs(r.gateCrossing.crossTrack)<=5);assert.ok(r.gateCrossing.time<a.elapsed);assert.ok(m.distanceToTarget<=12);assert.equal(m.status,'passed');assert.equal(a.events.filter(e=>e.type==='checkpoint').length,2);
});
test('UI schemas expose complete translated text keys and safe bare-pole initial states',()=>{
 assert.equal(drills.length,3);for(const d of drills){assert.ok(maneuverStrings.includes(d.title));for(const p of d.briefing)assert.ok(maneuverStrings.includes(p));for(const stage of d.steps){assert.ok(maneuverStrings.includes(stage.label));assert.ok(stage.hint);}const s=createDrillState(d.id);assert.equal(s.mainHoist,0);assert.equal(s.jibHoist,0);assert.equal(s.throttle,0);assert.equal(s.anchor,false);assert.ok(s.depth>=3);assert.equal(beginManeuver(d.id,s).status,'active');}
 assert.throws(()=>createDrillState('missing'),RangeError);
});
test('invalid or paused frame intervals cannot advance measured holds or elapsed time',()=>{
 const s=createDrillState('engine-stop'),a=beginManeuver('engine-stop',s),before=structuredClone(a);for(const dt of [0,-1,NaN,Infinity,1])advanceManeuver(a,s,dt);assert.deepEqual(a,before);
});
test('continuous speed holds reset after leaving tolerance',()=>{
 const s=createDrillState('engine-stop'),a=beginManeuver('engine-stop',s);s.speed=2.5;s.throttle=.2;for(let i=0;i<20;i++)advanceManeuver(a,s,.1);assert.ok(a.held>1.9);s.speed=1.9;advanceManeuver(a,s,.1);assert.equal(a.held,0);assert.equal(a.index,0);
});
test('neutral dwell is required before both directions of thrust reversal',()=>{
 for(const sign of [1,-1]){const s=createDrillState('engine-stop'),a=beginManeuver('engine-stop',s);s.throttle=sign*.3;advanceManeuver(a,s,.1);s.throttle=0;for(let i=0;i<3;i++)advanceManeuver(a,s,.1);s.throttle=-sign*.3;advanceManeuver(a,s,.1);assert.equal(a.status,'failed');assert.match(a.message,/neutral/);}
 const s=createDrillState('engine-stop'),a=beginManeuver('engine-stop',s);s.throttle=.3;advanceManeuver(a,s,.1);s.throttle=0;for(let i=0;i<4;i++)advanceManeuver(a,s,.1);s.throttle=-.3;advanceManeuver(a,s,.1);assert.equal(a.status,'active');
});
test('unsafe conditions invalidate attempts and cannot later turn into a pass',()=>{
 const cases=[['grounding',s=>s.grounded=true,/depth/],['depth',s=>s.depth=2,/depth/],['anchor',s=>s.anchor=true,/anchor/],['main hoist',s=>s.mainHoist=.1,/sails/],['jib hoist',s=>s.jibHoist=.1,/sails/],['weather',s=>s.windSpeed=9,/Conditions/],['current',s=>s.currentSpeed=1,/Conditions/],['speed',s=>s.speed=5,/Speed/],['area',s=>s.x=250,/area/]];
 for(const [name,change,message]of cases){const s=createDrillState('engine-stop'),a=beginManeuver('engine-stop',s);change(s);advanceManeuver(a,s,.1);assert.equal(a.status,'failed',name);assert.match(a.message,message);const result=structuredClone(a);advanceManeuver(a,createDrillState('engine-stop'),.1);assert.deepEqual(a,result);assert.ok(maneuverStrings.includes(a.message));}
});
test('corridor boundaries, backing limit, gate errors, and target overshoot fail explicitly',()=>{
 const check=(id,change,pattern)=>{const s=createDrillState(id),a=beginManeuver(id,s);change(s);advanceManeuver(a,s,.1);assert.equal(a.status,'failed');assert.match(a.message,pattern);};
 check('astern-track',s=>s.x=15.01,/corridor/);check('astern-track',s=>s.z=965.01,/stopping limit/);
 check('precision-approach',s=>{s.z=819;s.x=6;s.speed=1;},/Gate missed/);
 check('precision-approach',s=>{s.z=819;s.speed=2;},/Gate missed/);
 check('precision-approach',s=>s.z=772.9,/overshot/);
});
test('restoring or starting from an unsuitable vessel state cannot receive a live attempt',()=>{
 for(const patch of [{speed:2},{x:2},{heading:10},{throttle:.5},{mainHoist:1},{anchor:true},{grounded:true}]){const s=Object.assign(createDrillState('engine-stop'),patch);assert.equal(beginManeuver('engine-stop',s).status,'failed');}
 const a=beginManeuver('engine-stop',createDrillState('engine-stop'));cancelManeuver(a);assert.equal(a.status,'failed');assert.match(a.message,/interrupted/);
});

test('astern drill success demonstrates positive helm with negative yaw and a new held heading',()=>{const {s,a}=pilot('astern-track');assert.equal(a.status,'passed');assert.ok(a.metrics.asternSteeringSeconds>=1);assert.ok(a.metrics.minAsternYaw<-.05);assert.ok(Math.abs(angleDifference(s.heading,340))<=6);});
test('visible gate and corridor boundaries agree with assessment dimensions',()=>{const approach=drills.find(d=>d.gate);assert.equal(approach.cues.gate.width,2*approach.gate.halfWidth);const astern=drills.find(d=>d.corridorHalfWidth),c=astern.cues.corridor;assert.equal(c.width,2*astern.corridorHalfWidth);assert.equal(c.z-c.length/2,astern.origin.z);assert.equal(c.z+c.length/2,astern.origin.z+astern.limitAstern);});
test('failed frames retain physical elapsed time and terminal measurements for replay',()=>{const s=createDrillState('engine-stop'),a=beginManeuver('engine-stop',s);s.x=251;s.speed=5;advanceManeuver(a,s,.1);assert.equal(a.status,'failed');assert.equal(a.elapsed,.1);assert.equal(a.metrics.peakSpeed,5);});
