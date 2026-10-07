import { shoreScale } from '../src/rendering/geography.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, step, angleDifference, depthAt, islands, apparentWind, refreshDerived, KNOT, VESSEL } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import { bowFairlead, anchorSnapshot, initializeAnchoredScenario } from '../src/anchor.js';
const ocean=patch=>Object.assign(initialState(),{x:3000,z:3000},patch);
const run=(s,seconds,dt=.02)=>{for(let t=0;t<seconds-1e-8;t+=dt)step(s,Math.min(dt,seconds-t));return s;};
const near=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≉ ${b}`);
test('a yacht accelerates on a reach with finite leeway and bounded heel',()=>{const s=run(ocean(),45);assert.ok(s.speed>3&&s.speed<10);assert.ok(s.z<3000);assert.ok(s.distance>50);assert.ok(s.leeway>0);assert.ok(Math.abs(s.heel)<40);});
test('stationary head to wind has no sail drive and no rudder authority',()=>{const s=ocean();s.heading=s.windDirection;s.rudder=30;run(s,30);near(s.speed,0);near(s.heading,s.windDirection);});
test('heading differences are continuous across north and multiple turns',()=>{assert.equal(angleDifference(5,355),10);assert.equal(angleDifference(355,5),-10);assert.equal(angleDifference(-715,715),10);});
test('apparent wind uses vector subtraction and bearings FROM',()=>{
  const s=ocean({heading:0,windDirection:0,windSpeed:10,speed:5});near(apparentWind(s).speed,15);near(apparentWind(s).angle,0);
  s.windDirection=180;near(apparentWind(s).speed,5);near(Math.abs(apparentWind(s).angle),180);
  s.windDirection=90;near(apparentWind(s).speed,Math.sqrt(125));near(apparentWind(s).angle,63.43494882292201);
});
test('apparent wind accounts for current and leeway in ground velocity',()=>{const s=ocean({heading:0,windDirection:0,windSpeed:10,currentSpeed:2,currentDirection:0});near(apparentWind(s).speed,12);s.currentSpeed=0;s.leeway=3*KNOT;near(apparentWind(s).speed,Math.sqrt(109));});
test('grounded wind instruments use the stationary observer despite current and stale water velocity',()=>{
 for(const [heading,windDirection,currentDirection] of [[0,0,0],[275,35,90],[90,270,180]]){
  const s=ocean({grounded:true,heading,windDirection,windSpeed:12,currentDirection,currentSpeed:5,speed:3,leeway:2});
  const before={x:s.x,z:s.z,heading:s.heading,elapsed:s.elapsed,speed:s.speed,leeway:s.leeway};
  near(apparentWind(s).speed,12);near(apparentWind(s).direction,windDirection);
  refreshDerived(s);near(s.apparentWindSpeed,12);near(s.apparentWindAngle,angleDifference(windDirection,heading));near(s.speedOverGround,0);
  assert.deepEqual({x:s.x,z:s.z,heading:s.heading,elapsed:s.elapsed,speed:s.speed,leeway:s.leeway},before);
 }
});
test('engine accelerates ahead and astern; neutral preserves momentum and drag dissipates it',()=>{const ahead=run(ocean({sails:0,throttle:.7}),30),astern=run(ocean({sails:0,throttle:-.7}),30);assert.ok(ahead.speed>2);assert.ok(astern.speed< -2);const old=ahead.speed;ahead.throttle=0;step(ahead,.02);assert.ok(ahead.speed>0&&ahead.speed<old);run(ahead,100);assert.ok(ahead.speed<old*.2);});
test('rudder response reverses astern and yaw decays after centering',()=>{const ahead=ocean({sails:0,speed:3,rudder:20}),astern=ocean({sails:0,speed:-3,rudder:20});run(ahead,3);run(astern,3);assert.ok(ahead.heading>35);assert.ok(astern.heading<35);ahead.rudder=0;const yaw=ahead.yawRate;run(ahead,6);assert.ok(Math.abs(ahead.yawRate)<Math.abs(yaw)*.05);});
test('main and jib can drive independently; reefing reduces main area and heel',()=>{const both=run(ocean(),40),main=run(ocean({jibHoist:0}),40),jib=run(ocean({mainHoist:0}),40),reef=run(ocean({reefLevel:2}),40);assert.ok(main.speed>1&&jib.speed>1);assert.ok(main.speed<both.speed&&jib.speed<both.speed);assert.ok(reef.speed<both.speed);assert.ok(Math.abs(reef.heel)<Math.abs(both.heel));});
test('fully eased sails lose drive on a close reach',()=>{const good=run(ocean({heading:10,trim:35,jibSheet:35}),30),bad=run(ocean({heading:10,trim:90,jibSheet:90}),30);assert.ok(good.speed>bad.speed+1);assert.equal(bad.mainFlow,'Luffing');});
test('large and small frame steps converge without dropping normal elapsed time',()=>{const a=run(ocean({rudder:8}),12,.01),b=run(ocean({rudder:8}),12,.1);near(a.elapsed,12);near(b.elapsed,12);near(a.speed,b.speed,.015);near(a.heading,b.heading,.03);near(a.x,b.x,.04);});
test('current changes ground track while a bare boat has zero through-water speed',()=>{const s=run(ocean({sails:0,currentDirection:90,currentSpeed:2}),10);near(s.speed,0);near(s.x,3000+20*KNOT);near(s.z,3000);near(s.speedOverGround,2);near(s.courseOverGround,90);});
test('anchor is a geometric rode constraint, not an instant speed brake',()=>{const s=ocean({sails:0,speed:3,anchor:true,anchorRode:180});step(s,.02);assert.ok(s.speed>2.9);assert.equal(s.anchorStatus,'Lowering anchor');near(s.anchorPaidRode,.008);assert.ok(s.anchorScope<.01);});
test('sufficient rode bounds the bow swing circle against a steady current',()=>{const s=initializeAnchoredScenario(ocean({sails:0,windSpeed:0,currentSpeed:2,currentDirection:90}),{rode:120}),drop=bowFairlead(s);run(s,300);const snapshot=anchorSnapshot(s);near(snapshot.seabedPoint.x,drop.x);near(snapshot.seabedPoint.z,drop.z);assert.ok(snapshot.distance<=snapshot.swingRadius+.001);assert.equal(s.anchorStatus,'Holding');assert.equal(s.anchorDragging,false);assert.ok(s.speedOverGround<.1);assert.ok(snapshot.distance>100);});
test('rode too short cannot reach bottom; marginal actual scope can drag',()=>{const short=run(ocean({sails:0,anchor:true,anchorRode:10,currentSpeed:2}),30);assert.equal(short.anchorStatus,'Anchor suspended');near(short.anchorPaidRode,10);assert.equal(anchorSnapshot(short).seabedContact,false);assert.ok(short.x>3000);const drag=run(initializeAnchoredScenario(ocean({sails:0,currentSpeed:2}),{rode:45}),100);assert.equal(drag.anchorDragging,true);assert.ok(drag._anchor.x>3000.5);});
test('islands have shallow water and prevent passage',()=>{const island=islands[0];assert.equal(depthAt(island.x,island.z),0);const s=ocean({x:island.x,z:island.z,speed:5});step(s,.1);assert.equal(s.grounded,true);assert.equal(s.speed,0);assert.equal(s.speedOverGround,0);});
test('invalid elapsed time is ignored',()=>{for(const dt of [-1,NaN,Infinity,0]){const s=initialState(),before=structuredClone(s);step(s,dt);assert.deepEqual(s,before);}});
test('long integration remains finite at high wind and large controls',()=>{const s=ocean({windSpeed:30,rudder:35,trim:0,jibSheet:0,throttle:1});run(s,240,.1);for(const k of ['x','z','heading','speed','heel','leeway','apparentWindSpeed'])assert.ok(Number.isFinite(s[k]),k);assert.ok(s.heading>=0&&s.heading<360);assert.ok(Math.abs(s.speed)<20);});
test('legacy controls and atomic patch preserve independent sail settings',()=>{const s=initialState();step(s,.02);s.trim=22;s.reef=true;step(s,.02);assert.equal(s.mainSheet,22);assert.equal(s.reefLevel,1);s.sails=0;step(s,.02);assert.equal(s.mainHoist,0);assert.equal(s.jibHoist,0);applyControlPatch(s,{mainHoist:.5});step(s,.02);assert.equal(s.mainHoist,.5);assert.equal(s.jibHoist,0);applyControlPatch(s,{reefLevel:2,mainSheet:38});step(s,.02);assert.equal(s.reefLevel,2);assert.equal(s.reef,true);assert.equal(s.trim,38);});
test('port and starboard tacks are mirror symmetric in open water',()=>{const port=run(ocean({heading:35,windDirection:315}),30),starboard=run(ocean({heading:325,windDirection:45}),30);near(port.speed,starboard.speed);near(port.heel,-starboard.heel);near(port.leeway,-starboard.leeway);near(port.x-3000,3000-starboard.x);near(port.z,starboard.z);});
test('a motionless yacht cannot gain energy in still air and still water',()=>{const s=run(ocean({windSpeed:0,rudder:35,trim:0,jibSheet:0}),60);near(s.speed,0);near(s.leeway,0);near(s.x,3000);near(s.z,3000);near(s.heading,35);});

test('paused instrument refresh recomputes conditions without moving the yacht',()=>{const s=ocean({heading:0,speed:3,windDirection:0,windSpeed:10,currentDirection:0,currentSpeed:2});const keys=['x','z','heading','speed','leeway','yawRate','heel','elapsed','distance'];const before=Object.fromEntries(keys.map(k=>[k,s[k]]));refreshDerived(s);near(s.apparentWindSpeed,15);near(s.speedOverGround,5);assert.equal(s.courseOverGround,0);assert.equal(s.depth,35);for(const k of keys)assert.equal(s[k],before[k],k);assert.equal(s._anchor,undefined);s.windSpeed=20;refreshDerived(s);near(s.apparentWindSpeed,25);});
test('paused windlass commands preserve actual scope and a retrieval request cannot instantly stow gear',()=>{
 const s=ocean();applyControlPatch(s,{anchorRode:10,anchor:true});refreshDerived(s);
 assert.equal(s.anchorStatus,'Lowering anchor');assert.equal(s.anchorScope,0);assert.equal(s._anchor,undefined);
 applyControlPatch(s,{anchorRode:180});refreshDerived(s);assert.equal(s.anchorPaidRode,0);step(s,.02);assert.ok(s._anchor);near(s.anchorPaidRode,.008);
 const record=structuredClone(s._anchor);applyControlPatch(s,{anchor:false});refreshDerived(s);assert.equal(s.anchor,true);assert.deepEqual(s._anchor,record);near(s.anchorPaidRode,.008);
 step(s,.1);assert.equal(s.anchor,false);assert.equal(s._anchor,null);assert.equal(s.anchorStatus,'Stowed');assert.equal(s.anchorScope,0);
});

test('grounding contact survives later substeps and remains latched until reset',()=>{
 const island=islands[0],x=island.x+island.rx*shoreScale(0)*(1+VESSEL.draft/24+1e-6);
 for(const dt of [.02,.05,.1,.25]){
  const s=ocean({x,z:island.z,heading:270,speed:5,sails:0});step(s,dt);
  assert.equal(s.grounded,true,`contact lost at ${dt}s frame`);assert.equal(s.speed,0);assert.equal(s.speedOverGround,0);
  const position={x:s.x,z:s.z,heading:s.heading,depth:s.depth};
  applyControlPatch(s,{throttle:-1,rudder:35});refreshDerived(s);run(s,2);
  assert.equal(s.grounded,true);assert.equal(s.x,position.x);assert.equal(s.z,position.z);assert.equal(s.heading,position.heading);assert.equal(s.depth,position.depth);
 }
 assert.equal(initialState().grounded,false);
});
test('actual grounding updates apparent wind immediately and on subsequent simulation ticks',()=>{
 const island=islands[0],x=island.x+island.rx*shoreScale(0)*(1+VESSEL.draft/24+1e-6);
 for(const dt of [.02,.1,.25]){
  const s=ocean({x,z:island.z,heading:270,speed:5,sails:0,currentDirection:270,currentSpeed:2,windDirection:270,windSpeed:12});
  refreshDerived(s);near(s.apparentWindSpeed,19);
  step(s,dt);
  assert.equal(s.grounded,true);near(s.apparentWindSpeed,12);near(s.apparentWindAngle,0);near(s.speedOverGround,0);
  near(s._playerBody.vx,0);near(s._playerBody.vz,0);
  const position={x:s.x,z:s.z,heading:s.heading,depth:s.depth};
  Object.assign(s,{windSpeed:18,windDirection:45,currentSpeed:5,currentDirection:0});
  step(s,.02); // No paused refresh: the grounded integration path must update instruments itself.
  near(s.apparentWindSpeed,18);near(s.apparentWindAngle,135);near(s.speedOverGround,0);
  run(s,1,.1);near(s.apparentWindSpeed,18);near(s.apparentWindAngle,135);
  assert.deepEqual({x:s.x,z:s.z,heading:s.heading,depth:s.depth},position);
 }
});
test('paused target edits cannot alter an existing actual deployment',()=>{
 const s=initializeAnchoredScenario(ocean(),{rode:120}),record=structuredClone(s._anchor),snapshot=anchorSnapshot(s);
 applyControlPatch(s,{anchorRode:10});refreshDerived(s);assert.equal(s.anchorWinchRunning,false);near(s.anchorPaidRode,120);near(s.anchorScope,snapshot.scope);assert.deepEqual(s._anchor,record);
 applyControlPatch(s,{anchorWinchRunning:true});refreshDerived(s);near(s.anchorPaidRode,120);assert.equal(s.anchorStatus,'Retrieving anchor');step(s,.02);near(s.anchorPaidRode,119.995);
});
test('paying out target alone does not clear a dragging warning before rode is actually paid',()=>{
 const s=run(initializeAnchoredScenario(ocean({sails:0,currentSpeed:2}),{rode:45}),100);assert.equal(s.anchorDragging,true);
 const position={x:s.x,z:s.z},paid=s.anchorPaidRode;applyControlPatch(s,{anchorRode:180});refreshDerived(s);
 assert.equal(s.anchorDragging,true);near(s.anchorPaidRode,paid);assert.equal(s.x,position.x);assert.equal(s.z,position.z);
 applyControlPatch(s,{anchorWinchRunning:true});run(s,10);assert.ok(s.anchorPaidRode>paid);assert.equal(s.anchorDragging,false);
});
test('prop walk: astern thrust from rest swings the stern to port, ahead thrust does not, and it fades with speed',()=>{
 const calm={sails:0,mainHoist:0,jibHoist:0,windSpeed:0,currentSpeed:0,heading:90,rudder:0,worldBodies:[]};
 const astern=run(ocean({...calm,throttle:-1}),4);
 assert.ok(angleDifference(astern.heading,90)>2,'bow swings to starboard, stern to port');
 const ahead=run(ocean({...calm,throttle:1}),4);near(ahead.heading,90);
 const neutral=run(ocean({...calm,throttle:0}),4);near(neutral.heading,90);
 // Already moving fast astern: water flow past the rudder masks the walk.
 const moving=ocean({...calm,throttle:-1,speed:-3.2});const start=moving.heading;run(moving,1);
 assert.ok(Math.abs(angleDifference(moving.heading,start))<Math.abs(angleDifference(run(ocean({...calm,throttle:-1}),1).heading,90)));
 const cat=run(Object.assign(initialState(undefined,'catamaran'),{x:3000,z:3000},calm,{throttle:-1}),4);near(cat.heading,90);
});
