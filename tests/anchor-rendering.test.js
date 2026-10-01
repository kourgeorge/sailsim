import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BOW_FAIRLEAD } from '../src/anchor.js';
import { anchorRodePath,createAnchorRig } from '../src/rendering/anchor-rig.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const pathLength=path=>path.slice(1).reduce((sum,p,i)=>sum+distance(p,path[i]),0);
const base={status:'slack',fairlead:{x:0,y:1.2,z:0},anchorPoint:{x:0,y:-12,z:0},rode:50};
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<2e-5,`${actual} versus ${expected}`);
function fixture(){
 const material=new THREE.MeshStandardMaterial({color:'silver'}),rig=createAnchorRig({steel:material});
 const scene=new THREE.Scene(),boat=new THREE.Group();boat.add(rig.group);scene.add(boat);
 return{rig,boat,scene,material};
}
function endpointWorld(boat,rode,index){
 boat.updateMatrixWorld(true);const position=rode.geometry.attributes.position,center=new THREE.Vector3();
 for(let j=0;j<6;j++)center.add(new THREE.Vector3().fromBufferAttribute(position,index*6+j));
 return center.multiplyScalar(1/6).applyMatrix4(rode.matrixWorld);
}

test('stowed/pending have no deployed rope; suspended uses actual paid-out reach',()=>{
 for(const status of ['stowed','pending'])assert.deepEqual(anchorRodePath({...base,status,anchorPoint:null},base.fairlead),[]);
 const snapshot={...base,status:'suspended',rode:5,anchorPoint:{x:0,y:-3.8,z:0}};
 const rendered={x:10,y:1.4,z:8},path=anchorRodePath(snapshot,rendered);
 assert.deepEqual(path[0],rendered);close(path.at(-1).y,-3.6);close(pathLength(path),5);
 // A paused pay-out awaiting bottom capture is clamped to real depth by the
 // public snapshot; it must not draw an anchor far beneath the seabed.
 const pendingPayOut=anchorRodePath({...snapshot,rode:100,anchorPoint:base.anchorPoint},rendered);
 close(pendingPayOut.at(-1).y,-11.8);
});

test('slack cable endpoints and laid seabed surplus preserve paid length',()=>{
 for(const [horizontal,rode] of [[0,50],[15,50],[45,80],[0,250]]){
  const fairlead={x:horizontal,y:1.2,z:0},snapshot={...base,rode};
  const path=anchorRodePath(snapshot,fairlead);
  assert.deepEqual(path[0],fairlead);assert.deepEqual(path.at(-1),base.anchorPoint);
  close(pathLength(path),rode);assert.ok(path.every(p=>p.y>=base.anchorPoint.y&&Object.values(p).every(Number.isFinite)));
 }
});

test('taut and dragging cable follow the straight geometric constraint',()=>{
 for(const status of ['taut','dragging']){
  const bow={x:30,y:1.2,z:8},snapshot={...base,status},path=anchorRodePath(snapshot,bow);
  close(pathLength(path),distance(bow,base.anchorPoint));assert.deepEqual(path.at(-1),base.anchorPoint);
 }
});

test('real rig retains separate anchor states and follows rolled/pitched bow while seabed stays fixed',()=>{
 const {rig,boat,scene}=fixture(),stowed=rig.group.getObjectByName('stowed-anchor'),world=rig.group.getObjectByName('deployed-anchor-world'),rode=rig.group.getObjectByName('deployed-anchor-rode'),anchor=rig.group.getObjectByName('deployed-anchor');
 const geometry=rode.geometry,positionArray=geometry.attributes.position.array;
 for(const status of ['stowed','pending']){
  rig.update({...base,status,anchorPoint:null},boat);assert.equal(stowed.visible,true);assert.equal(world.visible,false);
 }
 const snapshot=structuredClone(base),before=structuredClone(snapshot);
 for(const heading of [0,Math.PI/2,Math.PI]){
  boat.position.set(12,.06,40);boat.rotation.set(.04,-heading,.2);
  rig.update(snapshot,boat);boat.updateMatrixWorld(true);
  const bow=boat.localToWorld(new THREE.Vector3(BOW_FAIRLEAD.x,BOW_FAIRLEAD.y,BOW_FAIRLEAD.z));
  close(endpointWorld(boat,rode,0).distanceTo(bow),0);
  const bottom=anchor.getWorldPosition(new THREE.Vector3());
  close(bottom.distanceTo(new THREE.Vector3(0,-12,0)),0);close(endpointWorld(boat,rode,96).distanceTo(bottom),0);
  assert.equal(stowed.visible,false);assert.equal(world.visible,true);
 }
 assert.deepEqual(snapshot,before,'Renderer never mutates the physics snapshot');
 assert.equal(rode.geometry,geometry);assert.equal(rode.geometry.attributes.position.array,positionArray,'Deployment updates reuse vertex storage');
 rig.update({...base,status:'stowed',anchorPoint:null},boat);assert.equal(stowed.visible,true);assert.equal(world.visible,false);assert.equal(rig.group.userData.anchorPoint,null);
 disposeSceneResources(scene);
});

test('suspended anchor follows the visual bow; zero rode is finite and reset releases shared resources once',()=>{
 const {rig,boat,scene,material}=fixture(),world=rig.group.getObjectByName('deployed-anchor-world'),anchor=rig.group.getObjectByName('deployed-anchor');
 for(const rode of [0,4]){
  boat.position.set(4,.08,10);boat.rotation.set(.03,.4,.15);
  rig.update({...base,status:'suspended',rode,anchorPoint:{x:0,y:1.2-rode,z:0}},boat);boat.updateMatrixWorld(true);
  const bow=boat.localToWorld(new THREE.Vector3(BOW_FAIRLEAD.x,BOW_FAIRLEAD.y,BOW_FAIRLEAD.z)),position=anchor.getWorldPosition(new THREE.Vector3());
  close(position.x,bow.x);close(position.z,bow.z);close(position.y,bow.y-rode);
  world.traverse(object=>{if(object.geometry)assert.ok(object.geometry.attributes.position.array.every(Number.isFinite));});
 }
 const counts=new Map();scene.traverse(object=>{if(object.geometry&&!counts.has(object.geometry)){counts.set(object.geometry,0);object.geometry.addEventListener('dispose',()=>counts.set(object.geometry,counts.get(object.geometry)+1));}});
 let materialDisposals=0;material.addEventListener('dispose',()=>materialDisposals++);
 disposeSceneResources(scene);assert.ok([...counts.values()].every(count=>count===1));assert.equal(materialDisposals,1);
});

test('simplified world yachts retain a stowed anchor without dynamic rode geometry',()=>{
 const material=new THREE.MeshStandardMaterial(),rig=createAnchorRig({steel:material},{detailed:false});
 assert.ok(rig.group.getObjectByName('stowed-anchor'));assert.equal(rig.group.getObjectByName('deployed-anchor-world'),undefined);
 const scene=new THREE.Scene();scene.add(rig.group);disposeSceneResources(scene);
});
