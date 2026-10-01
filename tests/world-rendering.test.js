import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { LOCATIONS } from '../src/locations.js';
import { getWorldBodyDefinitions,getWorldRockDefinitions,localToWorld,yachtHullShape } from '../src/world/bodies.js';
import { syncBodyTransform,impactMotion } from '../src/rendering/body-motion.js';

test('every world fixture has a unique stable id and fresh mutable state',()=>{
 for(const location of LOCATIONS){
  const a=getWorldBodyDefinitions(location.id),b=getWorldBodyDefinitions(location.id);
  assert.deepEqual(a,b);assert.equal(new Set(a.map(body=>body.id)).size,a.length);
  assert.equal(a.filter(body=>body.visual.type==='buoy').length,3);
  assert.equal(a.filter(body=>body.kind==='free').length,1);
  a[0].x+=99;assert.notEqual(a[0].x,b[0].x);
  for(const body of a)assert.ok(Number.isFinite(body.x)&&Number.isFinite(body.z)&&body.shape);
 }
});

test('marina collider transforms match visible pier dimensions and previous berth positions',()=>{
 const a=getWorldBodyDefinitions('haven');
 const spine=a.find(b=>b.id==='haven:marina:spine');
 assert.deepEqual([spine.x,spine.z,spine.heading,spine.shape.length,spine.shape.beam],[380,70,90,5,102]);
 const moored=a.filter(b=>b.visual.type==='yacht'&&b.kind==='moored');
 assert.deepEqual(moored.map(b=>[b.x,Math.round(b.z),b.heading]),[[367,37,270],[367,59,270],[367,81,270],[367,103,270]]);
});

test('the compass transform used by collision hulls matches THREE group rotation',()=>{
 for(const heading of [0,35,90,180,270,359]){
  const origin={x:12,z:-45,heading},local={x:2,z:-6};
  const expected=localToWorld(origin,local.x,local.z);
  const group=new THREE.Group();syncBodyTransform(group,{...origin,visual:{type:'yacht'}},0,0);
  group.updateMatrixWorld(true);const rendered=group.localToWorld(new THREE.Vector3(local.x,0,local.z));
  assert.ok(Math.abs(rendered.x-expected.x)<1e-9);assert.ok(Math.abs(rendered.z-expected.z)<1e-9);
 }
 const hull=yachtHullShape();assert.equal(Math.min(...hull.vertices.map(p=>p[1])),-6.6);assert.equal(Math.max(...hull.vertices.map(p=>p[1])),5.25);
});

test('shore rocks use the exact same stable positions in visuals and collisions',()=>{
 for(const location of LOCATIONS){
  const rocks=getWorldRockDefinitions(location.id),bodies=getWorldBodyDefinitions(location.id);
  assert.equal(rocks.length,105*location.islands.length);
  for(const body of bodies.filter(b=>b.visual.type==='rock')){
   const rock=rocks.find(r=>r.id===body.id);assert.ok(rock);
   assert.equal(body.x,rock.x);assert.equal(body.z,rock.z);assert.equal(body.shape.radius,rock.scale);
  }
 }
});

test('rendered movable roots follow solver position and impacts decay without changing physics',()=>{
 const body={id:'boat',x:6,z:11,heading:90,mass:3000,visual:{type:'yacht'},lastImpact:{time:2,point:{x:6,z:13},impulse:5000}};
 const before=structuredClone(body),group=new THREE.Group();
 syncBodyTransform(group,body,2.1,0);assert.equal(group.position.x,6);assert.equal(group.position.z,11);
 assert.notEqual(group.rotation.z,0);assert.deepEqual(impactMotion(body,5),{roll:0,pitch:0});
 body.x=15;body.heading=180;syncBodyTransform(group,body,5,0);assert.equal(group.position.x,15);assert.equal(group.rotation.y,-Math.PI);
 body.x=before.x;body.heading=before.heading;assert.deepEqual(body,before);
});
