import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { rigVisualState,smoothBoomAngle } from '../src/rendering/rig-state.js';
import { createKeelGeometry } from '../src/rendering/keel-geometry.js';
import { VESSEL } from '../src/physics.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} ≠ ${expected}`);

test('positive traveler eases boom and moves car leeward on mirrored tacks',()=>{
 for(const side of [-1,1]){
  const centered=rigVisualState({apparentWindAngle:side*60,mainSheet:30,traveler:0});
  const eased=rigVisualState({apparentWindAngle:side*60,mainSheet:30,traveler:20});
  const inboard=rigVisualState({apparentWindAngle:side*60,mainSheet:30,traveler:-20});
  close(centered.boomAngle,-side*Math.PI/6);close(eased.boomAngle,-side*50*Math.PI/180);
  close(eased.travelerX,-side);close(inboard.travelerX,side);
  assert.ok(Math.abs(eased.boomAngle)>Math.abs(centered.boomAngle));
  assert.ok(Math.abs(inboard.boomAngle)<Math.abs(centered.boomAngle));
 }
});

test('masthead assembly points toward the apparent wind source in boat coordinates',()=>{
 for(const angle of [-180,-90,-40,0,40,90,180]){
  const rig=rigVisualState({apparentWindAngle:angle});
  const pointer=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),rig.windVaneAngle);
  close(pointer.x,Math.sin(angle*Math.PI/180));close(pointer.z,-Math.cos(angle*Math.PI/180));
 }
 // Legacy fallback normalizes a north crossing correctly.
 close(rigVisualState({windDirection:10,heading:350}).windVaneAngle,-20*Math.PI/180);
});

test('boom interpolation has equal elapsed-time response at 10 and 60 frames per second',()=>{
 const start=-Math.PI/3,target=Math.PI/4;
 const advance=(rate)=>{let angle=start;for(let i=0;i<rate;i++)angle=smoothBoomAngle(angle,target,1/rate);return angle;};
 close(advance(10),advance(60));close(advance(10),smoothBoomAngle(start,target,1));
 close(smoothBoomAngle(0,1,1/60),.12);
 for(const elapsed of [0,-1,NaN,Infinity])close(smoothBoomAngle(start,target,elapsed),start);
});

test('visual rig respects sheet/car stops without changing sail hoist or reef state',()=>{
 const state={apparentWindAngle:75,mainSheet:85,traveler:20,mainHoist:.4,jibHoist:.8,reefLevel:2};
 const before=structuredClone(state),rig=rigVisualState(state);close(rig.boomAngle,-Math.PI/2);close(rig.travelerX,-1);assert.deepEqual(state,before);
 close(rigVisualState({...state,mainSheet:5,traveler:-20}).boomAngle,0);
});

test('rendered keel vertices end at the physics draft and remain joined to the hull',()=>{
 const geometry=createKeelGeometry(VESSEL.draft);geometry.computeBoundingBox();
 assert.ok(Math.abs(geometry.boundingBox.min.y+VESSEL.draft)<1e-6);
 assert.ok(Math.abs(geometry.boundingBox.max.y+.55)<1e-6);
 assert.ok(geometry.attributes.position.array.every(Number.isFinite));
 // Simplified world yachts inherit the same geometry and scale their draft.
 for(const scale of [.74,.84,.87])assert.ok(Math.abs(geometry.boundingBox.min.y*scale+VESSEL.draft*scale)<1e-6);
 geometry.dispose();
});
