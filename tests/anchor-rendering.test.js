import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BOW_FAIRLEAD,bowFairlead,anchorSnapshot,initializeAnchoredScenario } from '../src/anchor.js';
import { initialState,step } from '../src/physics.js';
import { applyControlPatch } from '../src/vessel-controls.js';
import { anchorRodePath,createAnchorRig,renderedAnchorPoint } from '../src/rendering/anchor-rig.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const pathLength=path=>path.slice(1).reduce((sum,p,i)=>sum+distance(p,path[i]),0);
const base={status:'slack',fairlead:{x:0,y:1.2,z:0},anchorPoint:{x:0,y:-12,z:0},anchorDepth:12,rode:50};
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

test('stowed/pending have no deployed rope; suspended preserves the actual 3D endpoint',()=>{
 for(const status of ['stowed','pending'])assert.deepEqual(anchorRodePath({...base,status,anchorPoint:null},base.fairlead),[]);
 const snapshot={...base,status:'suspended',rode:5,anchorPoint:{x:1,y:-3.5,z:.8}};
 const rendered={x:10,y:1.4,z:8},path=anchorRodePath(snapshot,rendered);
 assert.deepEqual(path[0],rendered);assert.deepEqual(path.at(-1),snapshot.anchorPoint);
 // Requested target changes cannot move actual paid geometry while stopped.
 assert.deepEqual(anchorRodePath({...snapshot,targetRode:100,operation:'stopped'},rendered),path);
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

test('suspended anchor remains solver-positioned until the small final roller blend; disposal is shared',()=>{
 const {rig,boat,scene,material}=fixture(),world=rig.group.getObjectByName('deployed-anchor-world'),anchor=rig.group.getObjectByName('deployed-anchor');
 for(const rode of [0,4]){
  boat.position.set(4,.08,10);boat.rotation.set(.03,.4,.15);
  const fairlead=bowFairlead({x:4,z:10,heading:-.4*180/Math.PI}),snapshot={...base,fairlead,status:'suspended',rode,anchorPoint:{x:fairlead.x,y:1.2-rode,z:fairlead.z}};
  rig.update(snapshot,boat);boat.updateMatrixWorld(true);
  const bow=boat.localToWorld(new THREE.Vector3(BOW_FAIRLEAD.x,BOW_FAIRLEAD.y,BOW_FAIRLEAD.z)),position=anchor.getWorldPosition(new THREE.Vector3());
  const expected=renderedAnchorPoint(snapshot,bow);close(position.x,expected.x);close(position.z,expected.z);close(position.y,expected.y);
  if(rode===0){
   close(position.distanceTo(bow),0);
   const stowed=rig.group.getObjectByName('stowed-anchor');close(anchor.getWorldQuaternion(new THREE.Quaternion()).angleTo(stowed.getWorldQuaternion(new THREE.Quaternion())),0);
  }else assert.deepEqual(expected,snapshot.anchorPoint);
  world.traverse(object=>{if(object.geometry)assert.ok(object.geometry.attributes.position.array.every(Number.isFinite));});
 }
 const counts=new Map();scene.traverse(object=>{if(object.geometry&&!counts.has(object.geometry)){counts.set(object.geometry,0);object.geometry.addEventListener('dispose',()=>counts.set(object.geometry,counts.get(object.geometry)+1));}});
 let materialDisposals=0;material.addEventListener('dispose',()=>materialDisposals++);
 disposeSceneResources(scene);assert.ok([...counts.values()].every(count=>count===1));assert.equal(materialDisposals,1);
});

test('timed slack payout crosses old coil thresholds without a shape discontinuity',()=>{
 for(const threshold of [31.2,49.2,67.2,85.2,121.2]){
  const before=anchorRodePath({...base,rode:threshold-.001},base.fairlead),after=anchorRodePath({...base,rode:threshold+.001},base.fairlead);
  close(pathLength(before),threshold-.001);close(pathLength(after),threshold+.001);
  assert.ok(Math.max(...before.map((p,index)=>distance(p,after[index])))<.01,'Cable points move continuously when actual paid length changes');
 }
});

test('breakout endpoint/orientation and final stow stay continuous through real geometry',()=>{
 const {rig,boat,scene}=fixture(),anchor=rig.group.getObjectByName('deployed-anchor');
 const fairlead={...BOW_FAIRLEAD},bottom={x:.2,y:-12,z:BOW_FAIRLEAD.z+.15};
 rig.update({...base,fairlead,anchorPoint:bottom,rode:13.25},boat);boat.updateMatrixWorld(true);
 const groundPosition=anchor.getWorldPosition(new THREE.Vector3()),groundRotation=anchor.getWorldQuaternion(new THREE.Quaternion());
 rig.update({...base,fairlead,status:'suspended',anchorPoint:{...bottom,y:bottom.y+.001},rode:13.249},boat);boat.updateMatrixWorld(true);
 assert.ok(anchor.getWorldPosition(new THREE.Vector3()).distanceTo(groundPosition)<.002);
 assert.ok(anchor.getWorldQuaternion(new THREE.Quaternion()).angleTo(groundRotation)<.001);
 let previous=null;
 for(let i=61;i>=0;i--){
  const rode=i/100,snapshot={...base,fairlead,status:'suspended',rode,anchorPoint:{...fairlead,y:fairlead.y-rode}};
  rig.update(snapshot,boat);boat.updateMatrixWorld(true);
  const current={position:anchor.getWorldPosition(new THREE.Vector3()),rotation:anchor.getWorldQuaternion(new THREE.Quaternion())};
  if(previous){assert.ok(current.position.distanceTo(previous.position)<.012);assert.ok(current.rotation.angleTo(previous.rotation)<.04);}
  previous=current;
 }
 const stowed=rig.group.getObjectByName('stowed-anchor');close(previous.position.distanceTo(stowed.getWorldPosition(new THREE.Vector3())),0);close(previous.rotation.angleTo(stowed.getWorldQuaternion(new THREE.Quaternion())),0);
 disposeSceneResources(scene);
});

test('actual timed retrieval preserves rendered endpoint and orientation through breakout and final stow',()=>{
 const {rig,boat,scene}=fixture(),state=Object.assign(initialState(),{heading:0,windSpeed:0,currentSpeed:0,sails:0,mainHoist:0,jibHoist:0});
 initializeAnchoredScenario(state,{rode:38});applyControlPatch(state,{anchor:false});
 let previous=null,samples=0,maxPosition=0,maxRotation=0;
 for(let i=0;i<1700;i++){
  step(state,.1);const snapshot=anchorSnapshot(state),inspect=snapshot.anchorPoint&&(Math.abs(snapshot.rode-snapshot.vertical)<1||snapshot.rode<.8);
  if(inspect||(snapshot.status==='stowed'&&previous)){
   boat.position.set(state.x,.06,state.z);boat.rotation.set(.035,0,.12);rig.update(snapshot,boat);boat.updateMatrixWorld(true);
   const anchor=rig.group.getObjectByName(snapshot.status==='stowed'?'stowed-anchor':'deployed-anchor'),position=anchor.getWorldPosition(new THREE.Vector3()),rotation=anchor.getWorldQuaternion(new THREE.Quaternion());
   if(previous){maxPosition=Math.max(maxPosition,position.distanceTo(previous.position));maxRotation=Math.max(maxRotation,rotation.angleTo(previous.rotation));samples++;}
   previous={position,rotation};
  }else previous=null;
  if(snapshot.status==='stowed')break;
 }
 assert.equal(anchorSnapshot(state).status,'stowed');assert.ok(samples>30);assert.ok(maxPosition<.08,`Maximum 100 ms position step ${maxPosition}`);assert.ok(maxRotation<.15,`Maximum 100 ms rotation step ${maxRotation}`);
 disposeSceneResources(scene);
});

test('simplified world yachts retain a stowed anchor without dynamic rode geometry',()=>{
 const material=new THREE.MeshStandardMaterial(),rig=createAnchorRig({steel:material},{detailed:false});
 assert.ok(rig.group.getObjectByName('stowed-anchor'));assert.equal(rig.group.getObjectByName('deployed-anchor-world'),undefined);
 const scene=new THREE.Scene();scene.add(rig.group);disposeSceneResources(scene);
});
