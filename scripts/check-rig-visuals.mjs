import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Isolated browser fixture; production exports no test mutation hooks. These
// checks use createYacht's actual hierarchy after its normal static batching.
const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/rig-visual-harness',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><style>
 body{margin:0;background:#123842;color:#fff;font:16px system-ui}canvas{display:block}#label{position:absolute;left:24px;top:20px;background:#123842e8;padding:12px 18px;border-radius:5px;max-width:850px}.inset{position:absolute;right:12px;background:#123842e8;padding:7px 12px;pointer-events:none}#status{padding:16px 24px;line-height:1.7}h1{font-size:20px;margin:0 0 5px}p{margin:0}</style></head><body><div id="scene"></div><div id="label"><h1>Working rig</h1><p id="case"></p></div><div class="inset" style="top:10px">Traveler · overhead</div><div class="inset" style="top:460px">Masthead · wind pointer</div><div id="status"></div></body></html>`}));
 await page.goto(`${url}/rig-visual-harness`);
 await page.evaluate(async()=>{
  const [THREE,{createMaterials},{createYacht},{initialState},{disposeSceneResources}]=await Promise.all([
   import('/node_modules/three/build/three.module.js'),import('/src/rendering/materials.js'),import('/src/rendering/yacht.js'),import('/src/physics.js'),import('/src/rendering/dispose.js')]);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1440,900);renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  document.querySelector('#scene').append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#c2d4dd');
  scene.add(new THREE.HemisphereLight('#eefaff','#536470',2));
  const light=new THREE.DirectionalLight('#fff6e4',3);light.position.set(-8,20,13);scene.add(light);
  const materials=createMaterials(),yacht=createYacht(materials);scene.add(yacht.group);
  const camera=(position,target,width,height,fov)=>{const c=new THREE.PerspectiveCamera(fov,width/height,.03,150);c.position.set(...position);c.lookAt(...target);return c;};
  const cameras=[camera([16,11,23],[0,8,-1],1050,900,47),camera([0,10,.9],[0,1.97,.9],390,450,30),camera([1.1,19.1,-.2],[0,17.95,-1.95],390,450,32)];
  const objects=boat=>{
   const boom=boat.group.getObjectByName('mainsail-boom'),car=boat.group.getObjectByName('traveler-car'),vane=boat.group.getObjectByName('masthead-wind-vane');
   if(!boom||!car||!vane)throw new Error('Static batching lost a named moving assembly');
   const main=boom.children.find(child=>child.isGroup);
   const jib=boat.group.children.find(child=>child.isGroup&&Math.abs(child.position.y-1.8)<1e-6&&Math.abs(child.position.z+1.95)<1e-6);
   if(!main||!jib)throw new Error('Main or headsail assembly missing');
   return{boom,car,vane,main,jib};
  };
  const snapshot=(boat=yacht)=>{
   boat.group.updateMatrixWorld(true);const {boom,car,vane,main,jib}=objects(boat);
   const vertex=jib.children.find(child=>child.isMesh&&child.geometry.attributes.position.count===703)?.geometry.attributes.position;
   if(!vertex)throw new Error('Headsail cloth mesh missing');
   const leading=new THREE.Vector3().fromBufferAttribute(vertex,0),clew=new THREE.Vector3().fromBufferAttribute(vertex,18);
   const arrow=vane.children.find(child=>child.geometry?.type==='ConeGeometry');
   if(!arrow)throw new Error('Masthead pointer was detached or statically merged');
   const origin=vane.getWorldPosition(new THREE.Vector3()),tip=arrow.getWorldPosition(new THREE.Vector3()).sub(origin).normalize();
   return{boom:boom.rotation.y,car:car.position.x,vane:vane.rotation.y,mainVisible:main.visible,mainScale:main.scale.y,jibVisible:jib.visible,jibFoot:leading.distanceTo(clew),pointer:{x:tip.x,z:tip.z},vaneParts:vane.children.length,
    attached:boom.parent===boat.group&&car.parent===boat.group&&vane.parent===boat.group&&arrow.parent===vane};
  };
  const render=()=>{
   renderer.setScissorTest(true);
   for(const [i,rect] of [[0,[0,0,1050,900]],[1,[1050,450,390,450]],[2,[1050,0,390,450]]]){
    renderer.setViewport(...rect);renderer.setScissor(...rect);renderer.render(scene,cameras[i]);
   }
   renderer.setScissorTest(false);
  };
  window.rigHarness={THREE,renderer,scene,materials,yacht,initialState,createYacht,objects,snapshot,render,time:0,disposeSceneResources};
 });
 const close=(actual,expected,message,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<tolerance,`${message}: ${actual} versus ${expected}`);
 const fixtures=[
  {id:'starboard',angle:60,mainHoist:1,jibHoist:1,reefLevel:0},
  {id:'port',angle:-60,mainHoist:1,jibHoist:1,reefLevel:0},
  {id:'reef-one',angle:60,mainHoist:1,jibHoist:1,reefLevel:1},
  {id:'reef-two-partial',angle:-60,mainHoist:.5,jibHoist:.5,reefLevel:2},
  {id:'main-down',angle:60,mainHoist:0,jibHoist:1,reefLevel:0},
  {id:'both-down',angle:-60,mainHoist:0,jibHoist:0,reefLevel:0},
 ];
 const results=[];
 for(const fixture of fixtures){
  const result=await page.evaluate(fixture=>{
   const h=window.rigHarness,state={...h.initialState(),apparentWindAngle:fixture.angle,mainSheet:30,traveler:20,mainHoist:fixture.mainHoist,jibHoist:fixture.jibHoist,reefLevel:fixture.reefLevel};
   h.time+=10;h.yacht.update(state,h.time);h.render();
   document.querySelector('#case').textContent=`${fixture.id} · Apparent wind ${fixture.angle}° · Mainsheet 30° · Traveler +20° ease`;
   document.querySelector('#status').textContent=`Main ${(fixture.mainHoist*100).toFixed(0)}% · Headsail ${(fixture.jibHoist*100).toFixed(0)}% · Reef ${fixture.reefLevel} | Whole yacht at left; actual moving traveler and masthead assemblies at right.`;
   return{fixture,...h.snapshot()};
  },fixture);
  const side=Math.sign(fixture.angle);assert.ok(result.attached,`${fixture.id}: moving assemblies retained after batching`);
  assert.equal(result.vaneParts,3);close(result.boom,-side*50*Math.PI/180,'Boom angle');close(result.car,-side,'Traveler side');close(result.vane,-fixture.angle*Math.PI/180,'Vane angle');
  close(result.pointer.x,Math.sin(fixture.angle*Math.PI/180),'Actual pointer direction x');close(result.pointer.z,-Math.cos(fixture.angle*Math.PI/180),'Actual pointer direction z');
  assert.equal(result.mainVisible,fixture.mainHoist>.01);assert.equal(result.jibVisible,fixture.jibHoist>.01);
  close(result.mainScale,fixture.mainHoist*[1,.72,.48][fixture.reefLevel],'Reef/hoist scaling');close(result.jibFoot,3.4*fixture.jibHoist,'Headsail exposed foot',2e-6);
  await page.screenshot({path:`artifacts/rig-${fixture.id}.png`,timeout:120000});results.push(result);
 }
 const timing=await page.evaluate(()=>{
  const h=window.rigHarness,results={};
  for(const rate of [10,60]){
   const boat=h.createYacht(h.materials);boat.group.visible=false;h.scene.add(boat.group);
   const state={...h.initialState(),apparentWindAngle:60,mainSheet:0,traveler:0};
   boat.update(state,0);state.mainSheet=50;
   for(let i=1;i<=rate;i++)boat.update(state,i/rate);
   const atOneSecond=h.snapshot(boat);boat.update(state,1);const repeated=h.snapshot(boat);
   results[rate]={angle:atOneSecond.boom,repeated:repeated.boom,attached:atOneSecond.attached};
  }
  return results;
 });
 close(timing[10].angle,timing[60].angle,'Actual createYacht update is frame-rate independent',1e-10);
 for(const result of Object.values(timing)){assert.ok(result.attached);close(result.angle,result.repeated,'Repeated timestamp does not move boom',1e-12);}
 assert.deepEqual(errors,[],'No browser rendering errors');
 await page.evaluate(()=>{const h=window.rigHarness;h.disposeSceneResources(h.scene,{extraMaterials:Object.values(h.materials)});h.renderer.dispose();h.renderer.forceContextLoss();});
 await writeFile('artifacts/rig-visual-diagnostics.json',JSON.stringify({results,timing},null,2));
 console.log('Rig browser checks passed: six sail configurations, mirrored tacks, assembly retention, actual 10/60 Hz update response.');
}finally{await browser.close();}
