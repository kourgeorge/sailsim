import test from 'node:test';
import assert from 'node:assert/strict';
import { BOW_FAIRLEAD,bowFairlead,anchorSnapshot } from '../src/anchor.js';
import { initialState,step,refreshDerived,groundVelocity,KNOT } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';

const near=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≉ ${b}`);
const ocean=patch=>Object.assign(initialState(),{x:3000,z:3000,heading:0,sails:0,windSpeed:0,currentSpeed:0,worldBodies:[]},patch);
const run=(s,seconds,dt=.02)=>{for(let t=0;t<seconds-1e-8;t+=dt)step(s,Math.min(dt,seconds-t));return s;};

test('shared fairlead geometry rotates with compass heading and stays 1.2 m above water',()=>{
 assert.ok(Object.isFrozen(BOW_FAIRLEAD));
 for(const [heading,x,z] of [[0,0,-6.6],[90,6.6,0],[180,0,6.6],[270,-6.6,0]]){
  const f=bowFairlead({x:10,z:20,heading});near(f.x,10+x);near(f.z,20+z);near(f.y,1.2);
 }
});

test('snapshot is pure, distinguishes pending from suspended, and captures bottom only on a running tick',()=>{
 const s=ocean({anchor:true,anchorRode:10});
 const before=structuredClone(s),pending=anchorSnapshot(s);
 assert.equal(pending.status,'pending');assert.equal(pending.anchorPoint,null);assert.equal(pending.seabedContact,false);assert.equal(pending.reachesBottom,false);
 assert.deepEqual(s,before);
 step(s,.02);
 const suspended=anchorSnapshot(s);
 assert.equal(suspended.status,'suspended');assert.equal(suspended.seabedPoint,null);near(suspended.anchorPoint.y,-8.8);
 near(suspended.anchorPoint.x,suspended.fairlead.x);near(suspended.anchorPoint.z,suspended.fairlead.z);
 const record=structuredClone(s._anchor),position={x:s.x,z:s.z};
 applyControlPatch(s,{anchorRode:180});refreshDerived(s);
 const preview=anchorSnapshot(s);assert.equal(preview.status,'suspended');assert.equal(preview.adjustmentPending,true);assert.equal(preview.seabedContact,false);
 assert.deepEqual(s._anchor,record);assert.deepEqual({x:s.x,z:s.z},position);
 step(s,.02);const bottom=anchorSnapshot(s);
 assert.equal(bottom.status,'slack');assert.equal(bottom.seabedContact,true);assert.equal(bottom.adjustmentPending,false);near(bottom.anchorPoint.y,-35);
 bottom.anchorPoint.x+=100;bottom.fairlead.z+=100;assert.notEqual(anchorSnapshot(s).anchorPoint.x,bottom.anchorPoint.x);
});

test('short rode follows the drifting bow and later pay-out anchors at the new position',()=>{
 const s=ocean({anchor:true,anchorRode:10,currentSpeed:2,currentDirection:90});
 run(s,20);const before=bowFairlead(s),suspended=anchorSnapshot(s);
 assert.equal(suspended.status,'suspended');near(suspended.anchorPoint.x,before.x);near(suspended.anchorPoint.z,before.z);
 assert.ok(before.x>3010);near(s.speedOverGround,2);
 applyControlPatch(s,{anchorRode:180});step(s,.02);
 const captured=anchorSnapshot(s);near(captured.seabedPoint.x,before.x);near(captured.seabedPoint.z,before.z);
 assert.equal(captured.captured,true);assert.equal(captured.status,'slack');
});

test('shortening below reach releases bottom and weighing clears the entire visible deployment',()=>{
 const s=ocean({anchor:true,anchorRode:120,currentSpeed:2,currentDirection:90});step(s,.02);
 const old=structuredClone(s._anchor);
 applyControlPatch(s,{anchorRode:5});refreshDerived(s);
 const preview=anchorSnapshot(s);assert.equal(preview.status,'suspended');assert.equal(preview.adjustmentPending,true);assert.equal(preview.seabedPoint,null);assert.deepEqual(s._anchor,old);
 step(s,.02);assert.equal(s._anchor.onBottom,false);assert.equal(anchorSnapshot(s).adjustmentPending,false);
 run(s,2);near(s.speedOverGround,2);
 applyControlPatch(s,{anchor:false});refreshDerived(s);
 const stowed=anchorSnapshot(s);assert.equal(stowed.status,'stowed');assert.equal(stowed.anchorPoint,null);assert.equal(stowed.seabedPoint,null);assert.equal(stowed.scope,0);assert.equal(stowed.tension,0);
});

test('bow tension includes rotational velocity and yields symmetric translation and yaw response',()=>{
 const results=[];
 for(const sign of [-1,1]){
  const s=ocean({anchor:true,anchorRode:120,yawRate:8*sign}),f=bowFairlead(s),radius=Math.sqrt(120**2-36.2**2);
  s._anchor={x:f.x-sign*radius,z:f.z,depth:35,onBottom:true};
  step(s,.02);const snap=anchorSnapshot(s),velocity=groundVelocity(s),arm={x:snap.fairlead.x-s.x,z:snap.fairlead.z-s.z};
  const normal={x:(snap.fairlead.x-snap.seabedPoint.x)/snap.distance,z:(snap.fairlead.z-snap.seabedPoint.z)/snap.distance};
  const omega=s.yawRate*Math.PI/180,radial=(velocity.x-omega*arm.z)*normal.x+(velocity.z+omega*arm.x)*normal.z;
  assert.ok(Math.abs(s.yawRate)<3,'bow restraint must resist outward yaw');assert.ok(s.anchorTension>0);
  near(radial,0);near(snap.distance,radius);assert.ok(Math.abs(s.leeway)>.1,'off-centre impulse must also translate the hull');
  results.push(s);
 }
 near(results[0].yawRate,-results[1].yawRate);near(results[0].leeway,-results[1].leeway);near(results[0].speed,results[1].speed);
});

test('legacy bottom records remain valid and snapshot distance is measured from bow, not vessel center',()=>{
 const s=ocean({anchor:true,anchorRode:120,_anchor:{x:3000,z:2900,depth:35}}),snap=anchorSnapshot(s);
 assert.equal(snap.seabedContact,true);near(snap.distance,93.4);near(snap.vertical,36.2);near(snap.scope,120/36.2);
});

test('bow anchoring remains finite and converges across frame partitions',()=>{
 const runWith=dt=>run(ocean({anchor:true,anchorRode:120,currentSpeed:2,currentDirection:90,heading:35}),180,dt);
 const a=runWith(.02),b=runWith(.1);
 for(const key of ['x','z','heading','speed','leeway','yawRate']){assert.ok(Number.isFinite(a[key]));near(a[key],b[key],1e-6);}
 const snap=anchorSnapshot(a);assert.ok(snap.distance<=snap.swingRadius+1e-6);
 assert.ok(Math.hypot(...Object.values(groundVelocity(a)))<2*KNOT);
});
