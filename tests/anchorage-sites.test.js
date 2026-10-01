import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/learning/curriculum.js';
import { createPracticeState } from '../src/learning/scenario-state.js';
import { anchorSnapshot, BOW_FAIRLEAD } from '../src/anchor.js';
import { depthAt } from '../src/water-depth.js';
import { PLAYER_HULL } from '../src/collisions.js';
import { getWorldBodyDefinitions } from '../src/world/bodies.js';
import { runScenario } from '../scripts/check-training-scenarios.mjs';

const hullReach = Math.max(...PLAYER_HULL.vertices.map(([x,z]) => Math.hypot(x-BOW_FAIRLEAD.x,z-BOW_FAIRLEAD.z)));
const boundaryRadius = shape => shape.radius ?? Math.hypot(shape.length,shape.beam)/2;
function verifySwingRoom(snapshot, locationId, label) {
  assert.equal(snapshot.seabedContact,true,`${label}: actual bottom contact`);
  assert.equal(snapshot.operation,'stopped',`${label}: completed powered travel`);
  assert.equal(snapshot.rode,snapshot.targetRode,`${label}: actual target reached`);
  const {x,z}=snapshot.seabedPoint,radius=snapshot.swingRadius+hullReach+5;
  // Sample the complete disk, not only the boat track or the swing perimeter.
  // The extra five metres is a fictional scenario margin, not a navigation rule.
  let minimum=Infinity;
  const sample=(dx,dz)=>{minimum=Math.min(minimum,depthAt(x+dx,z+dz,locationId));};
  for(let dx=-Math.ceil(radius);dx<=radius;dx++)for(let dz=-Math.ceil(radius);dz<=radius;dz++)if(Math.hypot(dx,dz)<=radius)sample(dx,dz);
  for(let i=0;i<720;i++){const a=i*Math.PI/360;sample(Math.cos(a)*radius,Math.sin(a)*radius);}
  assert.ok(minimum>=3,`${label}: whole-hull swing envelope has only ${minimum.toFixed(3)} m depth`);
  for(const body of getWorldBodyDefinitions(locationId)) {
    // Fixed fixtures, moored maximum excursions, and unpowered craft's authored
    // initial footprint. This does not predict later arbitrary traffic motion.
    const edge=Math.hypot(x-body.x,z-body.z)-boundaryRadius(body.shape)-(body.mooring?.maxRadius??0);
    assert.ok(edge>radius,`${label}: ${body.id} lies inside the full swing envelope`);
  }
}

for(const id of ['sail-31','sail-35'])test(`${id}: production training finishes with room for the actual full-rode swing`,()=>{
  const lesson=lessons.find(l=>l.id===id),result=runScenario(lesson),snapshot=result.anchorGeometry;
  assert.equal(result.status,'passed',result.reason??id);
  assert.equal(result.final.collisionCount,0);
  assert.equal(result.final.grounded,false);
  assert.ok(snapshot.rode>=lesson.practice.steps.at(-1).minimumRode);
  verifySwingRoom(snapshot,lesson.practice.setup.locationId??'haven',id);
});

test('sail-32: the prepared deployment has swing room and the departure fully retrieves it',()=>{
  const lesson=lessons.find(l=>l.id==='sail-32'),state=createPracticeState(lesson.practice.setup);
  verifySwingRoom(anchorSnapshot(state),state.locationId,'sail-32 start');
  const result=runScenario(lesson);
  assert.equal(result.status,'passed',result.reason??'departure');
  assert.equal(result.final.collisionCount,0);
  assert.equal(result.final.grounded,false);
  assert.equal(result.anchorGeometry.status,'stowed');
  assert.equal(result.anchorGeometry.rode,0);
});

test('the former capstone site is rejected despite a clear completed boat track',()=>{
  const lesson=structuredClone(lessons.find(l=>l.id==='sail-35'));
  Object.assign(lesson.practice.setup,{x:0,z:0});
  const result=runScenario(lesson);
  assert.equal(result.status,'passed','the track alone does not reveal unsafe swing room');
  assert.equal(result.final.collisionCount,0);
  assert.equal(result.final.grounded,false);
  assert.throws(()=>verifySwingRoom(result.anchorGeometry,'haven','former capstone'),/swing envelope/);
});
