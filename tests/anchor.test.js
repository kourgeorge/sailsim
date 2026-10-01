import test from 'node:test';
import assert from 'node:assert/strict';
import { BOW_FAIRLEAD,ANCHOR_RATES,bowFairlead,anchorSnapshot,initializeAnchoredScenario } from '../src/anchor.js';
import { initialState,step,refreshDerived,groundVelocity } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';

const near=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≉ ${b}`);
const ocean=patch=>Object.assign(initialState(),{x:3000,z:3000,heading:0,sails:0,windSpeed:0,currentSpeed:0,worldBodies:[]},patch);
const run=(s,seconds,dt=.02)=>{for(let t=0;t<seconds-1e-8;t+=dt)step(s,Math.min(dt,seconds-t));return s;};
const physical=s=>({x:s.x,z:s.z,heading:s.heading,paid:s.anchorPaidRode,point:anchorSnapshot(s).anchorPoint,record:structuredClone(s._anchor)});

test('shared fairlead geometry rotates with compass heading and stays 1.2 m above water',()=>{
 assert.ok(Object.isFrozen(BOW_FAIRLEAD));
 for(const [heading,x,z] of [[0,0,-6.6],[90,6.6,0],[180,0,6.6],[270,-6.6,0]]){const f=bowFairlead({x:10,z:20,heading});near(f.x,10+x);near(f.z,20+z);near(f.y,1.2);}
});

test('lowering uses actual powered travel, stops at target, and needs physical bottom contact',()=>{
 const s=ocean();applyControlPatch(s,{anchorRode:40,anchor:true});const before=structuredClone(s);
 const pending=anchorSnapshot(s);assert.equal(pending.status,'pending');assert.equal(pending.operation,'lowering');assert.equal(pending.rode,0);assert.equal(pending.targetRode,40);assert.equal(pending.anchorPoint,null);assert.deepEqual(s,before);
 run(s,25);const suspended=anchorSnapshot(s);near(suspended.rode,25*ANCHOR_RATES.lowering);assert.equal(suspended.status,'suspended');assert.equal(suspended.seabedContact,false);near(suspended.anchorPoint.y,1.2-suspended.rode);
 run(s,75);const bottom=anchorSnapshot(s);assert.equal(bottom.status,'slack');assert.equal(bottom.seabedContact,true);near(bottom.rode,40);assert.equal(bottom.operation,'stopped');assert.equal(s.anchorWinchRunning,false);near(bottom.anchorPoint.y,-35);
 bottom.anchorPoint.x+=100;assert.notEqual(anchorSnapshot(s).anchorPoint.x,bottom.anchorPoint.x);
 run(s,2);near(s.anchorPaidRode,40);
});

test('paused target and stop/resume commands cannot change paid length or move anchor geometry',()=>{
 const s=ocean();applyControlPatch(s,{anchorRode:10,anchor:true});run(s,5);
 applyControlPatch(s,{anchorWinchRunning:false});const stopped=physical(s);applyControlPatch(s,{anchorRode:20});refreshDerived(s);
 assert.deepEqual(physical(s),stopped);assert.equal(anchorSnapshot(s).operation,'stopped');run(s,2);near(s.anchorPaidRode,2);
 const paused=physical(s);applyControlPatch(s,{anchorWinchRunning:true});refreshDerived(s);assert.deepEqual(physical(s),paused);
 run(s,3);near(s.anchorPaidRode,3.2);applyControlPatch(s,{anchor:false});const retrieve=physical(s);refreshDerived(s);assert.deepEqual(physical(s),retrieve);assert.equal(s.anchor,true);assert.equal(anchorSnapshot(s).operation,'retrieving');
});

test('retrieval remains deployed through stop/resume until actual paid length reaches zero',()=>{
 const s=initializeAnchoredScenario(ocean(),{rode:40});const endpoint=physical(s);
 for(let i=0;i<3;i++)applyControlPatch(s,{anchor:false});assert.equal(s.anchor,true);assert.equal(s.anchorPaidRode,40);assert.deepEqual(physical(s),endpoint);
 run(s,40);near(s.anchorPaidRode,30);assert.equal(anchorSnapshot(s).status,'suspended');assert.equal(s.anchor,true);
 applyControlPatch(s,{anchorWinchRunning:false});run(s,2);near(s.anchorPaidRode,30);assert.equal(s.anchor,true);
 applyControlPatch(s,{anchorWinchRunning:true});run(s,119);near(s.anchorPaidRode,.25);assert.equal(s.anchor,true);run(s,1);
 assert.equal(s.anchor,false);assert.equal(s.anchorPaidRode,0);assert.equal(s._anchor,null);assert.equal(s.anchorWinchRunning,false);assert.equal(anchorSnapshot(s).status,'stowed');
});

test('retrieving slack blocks at loaded geometry instead of teleporting the yacht toward the anchor',()=>{
 const s=initializeAnchoredScenario(ocean(),{rode:120});s.x+=60;
 const start={x:s.x,z:s.z,heading:s.heading},anchor={...s._anchor.point};applyControlPatch(s,{anchor:false});run(s,220);
 const snap=anchorSnapshot(s),straight=Math.hypot(snap.distance,snap.vertical);
 assert.equal(snap.operation,'blocked');assert.equal(snap.reason,'rode-loaded');near(snap.rode,straight);assert.equal(s.anchor,true);assert.deepEqual({x:s.x,z:s.z,heading:s.heading},start);assert.deepEqual(snap.anchorPoint,anchor);
 run(s,2);near(s.anchorPaidRode,straight);assert.deepEqual({x:s.x,z:s.z,heading:s.heading},start);
});

test('near-vertical breakout preserves the endpoint through lifting without lateral teleportation',()=>{
 const s=initializeAnchoredScenario(ocean(),{rode:40});s.x+=.3;applyControlPatch(s,{anchor:false});
 let previous=anchorSnapshot(s).anchorPoint,airborne=false;
 for(let i=0;i<1500;i++){
  step(s,.02);const snap=anchorSnapshot(s),point=snap.anchorPoint;
  assert.ok(Math.hypot(point.x-previous.x,point.y-previous.y,point.z-previous.z)<.02,'endpoint jumped across breakout');
  assert.ok(Math.hypot(point.x-snap.fairlead.x,point.y-snap.fairlead.y,point.z-snap.fairlead.z)<=snap.rode+1e-7);
  if(!snap.seabedContact)airborne=true;previous=point;
 }
 assert.equal(airborne,true);assert.equal(s.anchor,true);assert.ok(previous.x>3000&&previous.x<3000.3);
});

test('zero target, direct legacy requests, and stop/resume cannot bypass physical deployment state',()=>{
 const s=ocean();applyControlPatch(s,{anchorRode:0,anchor:true});assert.equal(s.anchor,false);step(s,.1);assert.equal(s.anchorPaidRode,0);
 applyControlPatch(s,{anchorRode:2,anchor:true});run(s,5);assert.equal(s.anchor,true);near(s.anchorPaidRode,2);
 s.anchor=false;refreshDerived(s);assert.equal(s.anchor,true);near(s.anchorPaidRode,2);assert.equal(s.anchorRode,0);
 run(s,7.9);assert.equal(s.anchor,true);run(s,.1);assert.equal(s.anchor,false);
 applyControlPatch(s,{anchorRode:4});applyControlPatch(s,{anchor:true});applyControlPatch(s,{anchor:true});run(s,1);near(s.anchorPaidRode,.4);
});

test('authored predeployment validates reach and initializes actual geometry without running the windlass',()=>{
 const s=ocean();assert.throws(()=>initializeAnchoredScenario(s,{rode:10}),RangeError);assert.equal(s.anchor,false);
 initializeAnchoredScenario(s,{rode:120});const snap=anchorSnapshot(s);near(snap.rode,120);near(snap.targetRode,120);assert.equal(snap.seabedContact,true);assert.equal(snap.operation,'stopped');near(snap.distance,0);
 near(snap.seabedPoint.z,s.z-6.6);refreshDerived(s);assert.equal(s.anchorWinchRunning,false);
});

test('bottom anchor point follows dragging coordinates rather than stale airborne coordinates',()=>{
 const s=initializeAnchoredScenario(ocean({currentSpeed:2,currentDirection:90}),{rode:45});run(s,100);const snap=anchorSnapshot(s);
 assert.equal(s.anchorDragging,true);assert.deepEqual(snap.anchorPoint,snap.seabedPoint);assert.ok(snap.anchorPoint.x>3000.5);
});

test('bow tension includes rotational velocity and symmetric translation and yaw response',()=>{
 const results=[];
 for(const sign of [-1,1]){
  const s=initializeAnchoredScenario(ocean({yawRate:8*sign}),{rode:120}),f=bowFairlead(s),radius=Math.sqrt(120**2-36.2**2);
  s._anchor.x=f.x-sign*radius;step(s,.02);const snap=anchorSnapshot(s),velocity=groundVelocity(s),arm={x:snap.fairlead.x-s.x,z:snap.fairlead.z-s.z};
  const normal={x:(snap.fairlead.x-snap.seabedPoint.x)/snap.distance,z:(snap.fairlead.z-snap.seabedPoint.z)/snap.distance},omega=s.yawRate*Math.PI/180;
  near((velocity.x-omega*arm.z)*normal.x+(velocity.z+omega*arm.x)*normal.z,0);near(snap.distance,radius);
  assert.ok(Math.abs(s.yawRate)<3);assert.ok(s.anchorTension>0);assert.ok(Math.abs(s.leeway)>.1);results.push(s);
 }
 near(results[0].yawRate,-results[1].yawRate);near(results[0].leeway,-results[1].leeway);near(results[0].speed,results[1].speed);
});

test('powered deployment and complete retrieval converge across render frame partitions',()=>{
 const runWith=dt=>{const s=ocean();applyControlPatch(s,{anchorRode:40,anchor:true});run(s,100,dt);applyControlPatch(s,{anchor:false});run(s,150,dt);return s;};
 const a=runWith(.02),b=runWith(.1);
 for(const key of ['x','z','heading','speed','leeway','yawRate','anchorPaidRode']){assert.ok(Number.isFinite(a[key]));near(a[key],b[key],1e-7);}
 for(const key of ['x','y','z'])near(anchorSnapshot(a).anchorPoint[key],anchorSnapshot(b).anchorPoint[key]);near(a.anchorPaidRode,2.5);
});
