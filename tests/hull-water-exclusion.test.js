import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {hullGeometry,insideHull,installHullWaterExclusion} from '../src/rendering/hull-geometry.js';

test('water exclusion contains the dry cockpit interior but leaves surrounding sea intact',()=>{
 for(const x of [-.8,0,.8]){
  assert.equal(insideHull({x,y:0,z:3}),true,'Water plane inside the cockpit is excluded');
  assert.equal(insideHull({x,y:.49,z:3}),true,'The cockpit sole lies within the hull');
 }
 for(const p of [{x:2.1,y:0,z:3},{x:-2.1,y:0,z:3},{x:0,y:-1,z:3},{x:0,y:2,z:3},{x:0,y:0,z:-7},{x:0,y:0,z:6}]){
  assert.equal(insideHull(p),false,`Exterior water must remain: ${JSON.stringify(p)}`);
 }
 assert.equal(insideHull({x:0,y:0,z:-6.55}),false,'Dry bow overhang must not punch a water hole');
 assert.equal(insideHull({x:0,y:0,z:-6}),true,'Immersed bow excludes interior water');
});

test('water exclusion tracks the actual world transform at both maximum heel angles',()=>{
 const material=new THREE.ShaderMaterial({fragmentShader:'varying vec4 worldPosition; void main() { gl_FragColor=vec4(1.0); }'});
 const update=installHullWaterExclusion(material),parent=new THREE.Group(),boat=new THREE.Group();parent.add(boat);
 parent.position.set(240,0,-870);parent.rotation.y=.4;
 for(const heel of [-38,0,38]){
  boat.position.set(-12,-.045,37);boat.rotation.set(.005,1.2,heel*Math.PI/180);update(boat);
  assert.equal(material.uniforms.hullExclusionActive.value,true);
  for(const [p,inside] of [[new THREE.Vector3(.8,.45,3),true],[new THREE.Vector3(-.8,0,3),true],[new THREE.Vector3(3,0,3),false],[new THREE.Vector3(0,-2,3),false]]){
   const world=p.clone().applyMatrix4(boat.matrixWorld),back=world.applyMatrix4(material.uniforms.hullInverse.value);
   assert.ok(back.distanceTo(p)<1e-10,'Inverse includes parent translation, heading, heel, pitch and bob');
   assert.equal(insideHull(back),inside);
  }
 }
 material.dispose();
});

test('sharing the hull definition preserves the existing visual hull dimensions and topology',()=>{
 const geometry=hullGeometry();geometry.computeBoundingBox();
 const {min,max}=geometry.boundingBox;
 assert.equal(geometry.attributes.position.count,3977);
 assert.equal(geometry.index.count,96*40*6);
 assert.ok(Math.abs(min.z+6.6)<1e-6);assert.ok(Math.abs(max.z-5.25)<1e-6);
 assert.ok(max.x-min.x>4.11&&max.x-min.x<4.13);
 assert.ok(min.y>-.60&&min.y<-.58);
 geometry.dispose();
});
