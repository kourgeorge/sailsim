import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,step,apparentWind,windOverWater,refreshDerived,KNOT,angleDifference} from '../src/physics.js';

const RAD=Math.PI/180;
const near=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<tolerance,`${a} ≉ ${b}`);
const ocean=patch=>refreshDerived(Object.assign(initialState(),{x:30000,z:30000,heading:0,speed:3,leeway:.2,currentSpeed:0,currentDirection:0,worldBodies:[]},patch));
// Add a common uniform velocity (knots) to the air, water and ground track.
// Water-relative hull velocities and all physical controls remain unchanged.
function boost(state,x,z){
 const copy=structuredClone(state),w=state.windDirection*RAD,c=state.currentDirection*RAD;
 const airX=-Math.sin(w)*state.windSpeed+x,airZ=Math.cos(w)*state.windSpeed+z;
 const waterX=Math.sin(c)*state.currentSpeed+x,waterZ=-Math.cos(c)*state.currentSpeed+z;
 copy.windSpeed=Math.hypot(airX,airZ);copy.windDirection=(Math.atan2(-airX,airZ)/RAD+360)%360;
 copy.currentSpeed=Math.hypot(waterX,waterZ);copy.currentDirection=(Math.atan2(waterX,-waterZ)/RAD+360)%360;
 return refreshDerived(copy);
}
const dynamics=['speed','leeway','heel','heading','yawRate','mainEfficiency','jibEfficiency'];
function equalDynamics(a,b){for(const key of dynamics)near(a[key],b[key]);}

test('no-go gate is invariant when the same velocity is added to air and water',()=>{
 const a=ocean({windSpeed:12,windDirection:45,mainSheet:25,jibSheet:25}),b=boost(a,8,0);
 near(apparentWind(a).speed,apparentWind(b).speed);near(apparentWind(a).angle,apparentWind(b).angle);
 step(a,.02);step(b,.02);equalDynamics(a,b);
});

test('sail-shape force is invariant even away from the no-go gate',()=>{
 const a=ocean({windSpeed:12,windDirection:90,mainSheet:55,jibSheet:55}),b=boost(a,0,4);
 near(apparentWind(a).speed,apparentWind(b).speed);near(apparentWind(a).angle,apparentWind(b).angle);
 step(a,.02);step(b,.02);equalDynamics(a,b);
});

test('water wind subtracts current vectors with wind FROM and current TO bearings',()=>{
 const state=ocean({heading:0,windDirection:0,windSpeed:10,currentSpeed:2});
 for(const [currentDirection,speed,direction] of [[0,12,0],[180,8,0],[90,Math.sqrt(104),Math.atan2(2,10)/RAD]]){
  state.currentDirection=currentDirection;const wind=windOverWater(state);
  near(wind.speed,speed);near(angleDifference(wind.direction,direction),0);near(wind.angle,direction);
 }
 state.currentSpeed=0;
 for(const heading of [0,35,180,359])for(const windDirection of [0,35,270,359]){
  Object.assign(state,{heading,windDirection});const wind=windOverWater(state);
  near(wind.speed,10);near(angleDifference(wind.direction,windDirection),0);near(wind.angle,angleDifference(windDirection,heading));
 }
});

test('water wind is independent of hull velocity, including grounded observer telemetry',()=>{
 const a=ocean({windSpeed:12,windDirection:45,currentSpeed:3,currentDirection:90}),water=windOverWater(a),aw=apparentWind(a);
 Object.assign(a,{speed:7,leeway:-2});assert.deepEqual(windOverWater(a),water);assert.notEqual(apparentWind(a).speed,aw.speed);
 a.grounded=true;refreshDerived(a);
 assert.deepEqual(windOverWater(a),water);near(a.waterWindSpeed,water.speed);near(a.apparentWindSpeed,12);near(a.apparentWindAngle,45);near(a.speedOverGround,0);
});

test('uniform frame changes preserve full open-water trajectories and control response',()=>{
 for(const [heading,windDirection,boostX,boostZ] of [[0,45,8,0],[0,90,0,4],[160,10,-3,-2],[320,260,2,3]]){
  const a=ocean({heading,windDirection,windSpeed:12,mainSheet:25,jibSheet:28,rudder:8}),b=boost(a,boostX,boostZ);
  for(let frame=0;frame<120;frame++){
   step(a,.1);step(b,.1);equalDynamics(a,b);
   near(b.x-a.x,boostX*KNOT*(frame+1)*.1,1e-7);near(b.z-a.z,boostZ*KNOT*(frame+1)*.1,1e-7);
   assert.equal(a.grounded,false);assert.equal(b.grounded,false);
  }
 }
});

test('air moving with the water is calm in that frame and cannot create sail drive at rest',()=>{
 for(const heading of [0,45,180,275]){
  const state=ocean({heading,speed:0,leeway:0,windSpeed:3,windDirection:180,currentSpeed:3,currentDirection:0,mainSheet:0,jibSheet:0});
  assert.deepEqual(windOverWater(state),{speed:0,direction:null,angle:null});
  for(let frame=0;frame<50;frame++)step(state,.1);
  near(state.speed,0);near(state.leeway,0);near(state.heel,0);
  assert.equal(state.waterWindDirection,null);assert.equal(state.waterWindAngle,null);assert.equal(state.mainFlow,'Luffing');
  near(state.x,30000);near(state.z,30000-3*KNOT*5,1e-7);
 }
});

test('current can create usable water-relative wind in calm weather',()=>{
 const state=ocean({heading:90,speed:0,leeway:0,windSpeed:0,windDirection:90,currentSpeed:4,currentDirection:0,mainSheet:65,jibSheet:65});
 near(state.waterWindSpeed,4);near(state.waterWindAngle,-90);
 for(let frame=0;frame<100;frame++)step(state,.1);
 assert.ok(state.speed>.1,'air/water relative motion supplies wind pressure even with zero ground wind');
});

test('paused edits and completed integration publish consistent wind reference readings',()=>{
 const state=ocean({windSpeed:12,windDirection:45,rudder:25});
 const before=Object.fromEntries(['x','z','heading','speed','leeway','elapsed','distance'].map(k=>[k,state[k]]));
 Object.assign(state,{currentSpeed:4,currentDirection:135});refreshDerived(state);
 for(const [key,value] of Object.entries(before))assert.equal(state[key],value);
 for(let frame=0;frame<20;frame++){
  step(state,.1);const water=windOverWater(state),apparent=apparentWind(state);
  near(state.waterWindSpeed,water.speed);near(state.waterWindDirection,water.direction);near(state.waterWindAngle,water.angle);
  near(state.apparentWindSpeed,apparent.speed);near(state.apparentWindAngle,apparent.angle);
 }
});
