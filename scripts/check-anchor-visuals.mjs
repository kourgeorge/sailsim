import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/anchor-visual-harness',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8"><style>
 body{margin:0;background:#123842;color:white;font:16px system-ui}canvas{display:block}#title{position:absolute;left:20px;top:20px;max-width:970px;padding:12px 18px;background:#123842e8}h1{font-size:20px;margin:0 0 6px}p{margin:0}.inset{position:absolute;right:12px;padding:8px;background:#123842e8}#status{padding:16px 24px;line-height:1.7}</style></head><body><div id="scene"></div><div id="title"><h1>Anchor geometry inspection · below-water cutaway</h1><p id="case"></p></div><div class="inset" style="top:10px">Actual bow fitting</div><div class="inset" style="top:460px">Anchor and rode endpoint</div><div id="status"></div></body></html>`}));
 await page.goto(`${url}/anchor-visual-harness`);
 await page.evaluate(async()=>{
  const [THREE,{createMaterials},{createYacht},dynamics,controls,{anchorSnapshot,BOW_FAIRLEAD,initializeAnchoredScenario},{disposeSceneResources}]=await Promise.all([
   import('/node_modules/three/build/three.module.js'),import('/src/rendering/materials.js'),import('/src/rendering/yacht.js'),import('/src/physics.js'),import('/src/vessel-controls.js'),import('/src/anchor.js'),import('/src/rendering/dispose.js')]);
  const physics={...dynamics,...controls};
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1440,900);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  document.querySelector('#scene').append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#b8d1da');scene.add(new THREE.HemisphereLight('#eefaff','#657782',2));const light=new THREE.DirectionalLight('#fff5df',3);light.position.set(-15,30,15);scene.add(light);
  const materials=createMaterials(),yacht=createYacht(materials);scene.add(yacht.group);
  const cameras=Array.from({length:3},(_,i)=>new THREE.PerspectiveCamera(i?40:46,(i?390:1050)/(i?450:900),.02,1000));
  const rig=yacht.group.getObjectByName('anchor-rig');if(!rig)throw new Error('Anchor rig lost after batching');
  const fresh=()=>Object.assign(physics.initialState(),{windSpeed:0,currentSpeed:0,speed:0,rudder:0,heading:0,sails:0,mainHoist:0,jibHoist:0});
  const endpoint=index=>{const rode=rig.getObjectByName('deployed-anchor-rode'),p=rode.geometry.attributes.position,center=new THREE.Vector3();for(let j=0;j<6;j++)center.add(new THREE.Vector3().fromBufferAttribute(p,index*6+j));return center.multiplyScalar(1/6).applyMatrix4(rode.matrixWorld);};
  const visibleBounds=root=>{
   root.updateWorldMatrix(true,true);const bounds=new THREE.Box3();
   root.traverseVisible(object=>{if(!object.isMesh)return;object.geometry.computeBoundingBox();bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));});
   return bounds;
  };
  const fitCamera=(camera,bounds,direction,margin=1.15)=>{
   const sphere=bounds.getBoundingSphere(new THREE.Sphere()),vertical=camera.fov*Math.PI/180,horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);
   const distance=sphere.radius/Math.sin(Math.min(vertical,horizontal)/2)*margin;
   camera.position.copy(sphere.center).addScaledVector(new THREE.Vector3(...direction).normalize(),distance);camera.lookAt(sphere.center);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  };
  window.anchorHarness={THREE,renderer,scene,materials,yacht,physics,anchorSnapshot,BOW_FAIRLEAD,initializeAnchoredScenario,disposeSceneResources,cameras,rig,fresh,state:fresh(),time:0,endpoint,visibleBounds,fitCamera};
 });
 const results=[];
 for(const fixture of ['stowed','pending','mid-lowering','stopped','paused-payout','slack','mid-retrieving','near-stowed','weighed','taut','blocked','dragging','reset']){
  const result=await page.evaluate(fixture=>{
   const h=window.anchorHarness,{physics}=h;
   h.continuity??={samples:0,maxPositionStep:0,maxRotationStep:0};
   let previous=null;
   const tick=()=>{
    physics.step(h.state,.1);const snapshot=h.anchorSnapshot(h.state);
    const inspect=snapshot.anchorPoint&&(Math.abs(snapshot.rode-snapshot.vertical)<1||snapshot.rode<.8);
    if(inspect||(snapshot.status==='stowed'&&previous)){
     h.yacht.group.position.set(h.state.x,.06,h.state.z);h.yacht.group.rotation.set(.035,-h.state.heading*Math.PI/180,.12);
     h.yacht.update(h.state,h.time+=.1);h.scene.updateMatrixWorld(true);
     const anchor=h.rig.getObjectByName(snapshot.status==='stowed'?'stowed-anchor':'deployed-anchor'),position=anchor.getWorldPosition(new h.THREE.Vector3()),rotation=anchor.getWorldQuaternion(new h.THREE.Quaternion());
     if(previous){h.continuity.maxPositionStep=Math.max(h.continuity.maxPositionStep,position.distanceTo(previous.position));h.continuity.maxRotationStep=Math.max(h.continuity.maxRotationStep,rotation.angleTo(previous.rotation));h.continuity.samples++;}
     previous={position,rotation};
    }else previous=null;
    return snapshot;
   };
   const until=(predicate,label)=>{for(let i=0;i<6000;i++){const snapshot=tick();if(predicate(snapshot))return;}throw new Error(`Actual timed simulation did not reach ${label}`);};
   if(fixture==='pending')physics.applyControlPatch(h.state,{anchor:true,anchorRode:8});
   if(fixture==='mid-lowering')for(let i=0;i<100;i++)tick();
   if(fixture==='stopped'){
    h.stoppedPaid=h.anchorSnapshot(h.state).rode;
    physics.applyControlPatch(h.state,{anchorWinchRunning:false});for(let i=0;i<40;i++)tick();
    if(Math.abs(h.anchorSnapshot(h.state).rode-h.stoppedPaid)>1e-8)throw new Error('Stopped windlass changed paid length');
    h.stoppedPoint={...h.anchorSnapshot(h.state).anchorPoint};
   }
   if(fixture==='paused-payout'){
    physics.applyControlPatch(h.state,{anchorRode:80});const snapshot=h.anchorSnapshot(h.state);
    if(Math.abs(snapshot.rode-h.stoppedPaid)>1e-8||JSON.stringify(snapshot.anchorPoint)!==JSON.stringify(h.stoppedPoint))throw new Error('Paused target edit moved the real anchor');
   }
   if(fixture==='slack'){physics.applyControlPatch(h.state,{anchorWinchRunning:true});until(snapshot=>snapshot.rode>=80-1e-8,'full payout');}
   if(fixture==='mid-retrieving'){physics.applyControlPatch(h.state,{anchor:false});until(snapshot=>snapshot.rode<=20,'airborne retrieval');}
   if(fixture==='near-stowed')until(snapshot=>snapshot.rode<=.25,'final roller approach');
   if(fixture==='weighed')until(snapshot=>snapshot.status==='stowed','completed retrieval');
   if(['taut','dragging'].includes(fixture)){
    h.state=h.fresh();h.initializeAnchoredScenario(h.state,{rode:fixture==='taut'?120:50});physics.applyControlPatch(h.state,{throttle:-1});
    until(snapshot=>snapshot.status===fixture,fixture);
   }
   if(fixture==='blocked'){
    physics.applyControlPatch(h.state,{anchor:false,throttle:0});until(snapshot=>snapshot.operation==='blocked','loaded retrieval block');
    const paid=h.anchorSnapshot(h.state).rode;for(let i=0;i<20;i++)tick();
    if(Math.abs(h.anchorSnapshot(h.state).rode-paid)>1e-5)throw new Error('Loaded retrieval reeled in constrained rope');
   }
   if(fixture==='reset')h.state=h.fresh();
   const state=h.state,snapshot=h.anchorSnapshot(state);
   h.yacht.group.position.set(state.x,.06,state.z);h.yacht.group.rotation.set(.035,-state.heading*Math.PI/180,.12);
   h.yacht.update(state,h.time+=.3);h.scene.updateMatrixWorld(true);
   const bow=h.yacht.group.localToWorld(new h.THREE.Vector3(h.BOW_FAIRLEAD.x,h.BOW_FAIRLEAD.y,h.BOW_FAIRLEAD.z));
   const stowed=h.rig.getObjectByName('stowed-anchor'),world=h.rig.getObjectByName('deployed-anchor-world'),anchor=h.rig.getObjectByName('deployed-anchor'),rode=h.rig.getObjectByName('deployed-anchor-rode');
   const anchorWorld=world.visible?anchor.getWorldPosition(new h.THREE.Vector3()):stowed.getWorldPosition(new h.THREE.Vector3());
   h.fitCamera(h.cameras[0],h.visibleBounds(h.yacht.group),[.8,.25,.9]);
   h.cameras[1].position.copy(bow).add(new h.THREE.Vector3(2.3,1.6,-3.8));h.cameras[1].lookAt(bow.clone().add(new h.THREE.Vector3(0,-.3,0)));
   h.fitCamera(h.cameras[2],h.visibleBounds(world.visible?anchor:stowed),[1.5,1.1,2],1.55);
   h.renderer.setScissorTest(true);let drawCalls;
   for(const [index,rect] of [[0,[0,0,1050,900]],[1,[1050,450,390,450]],[2,[1050,0,390,450]]]){h.renderer.setViewport(...rect);h.renderer.setScissor(...rect);h.renderer.render(h.scene,h.cameras[index]);if(index===0)drawCalls=h.renderer.info.render.calls;}
   h.renderer.setScissorTest(false);
   document.querySelector('#case').textContent=`${fixture} · Physics status ${snapshot.status} · Paid ${snapshot.rode.toFixed(1)} / target ${snapshot.targetRode.toFixed(1)} m · Depth ${snapshot.anchorDepth.toFixed(1)} m`;
   document.querySelector('#status').textContent=`${snapshot.status.toUpperCase()} | Actual simulation ${state.elapsed.toFixed(2)} s · Hull speed ${state.speed.toFixed(2)} kn · ${snapshot.operation} | Cutaway exposes the actual below-water geometry for verification.`;
   return{fixture,status:snapshot.status,operation:snapshot.operation,rode:snapshot.rode,targetRode:snapshot.targetRode,continuity:{...h.continuity},adjustmentPending:snapshot.adjustmentPending,stowed:stowed.visible,deployed:world.visible,bow:bow.toArray(),anchorPoint:anchorWorld.toArray(),snapshotAnchor:snapshot.anchorPoint,snapshotFairlead:snapshot.fairlead,first:world.visible?h.endpoint(0).toArray():null,last:world.visible?h.endpoint(96).toArray():null,geometry:rode.geometry.uuid,positionBuffer:rode.geometry.attributes.position.count,drawCalls};
  },fixture);
  const expected=['stowed','weighed','reset'].includes(fixture)?'stowed':['mid-lowering','stopped','paused-payout','mid-retrieving','near-stowed'].includes(fixture)?'suspended':fixture==='blocked'?'taut':fixture;
  assert.equal(result.status,expected,`${fixture}: actual physics state`);
  if(['mid-lowering','mid-retrieving','near-stowed','blocked','stopped','paused-payout'].includes(fixture))assert.equal(result.operation,fixture==='mid-lowering'?'lowering':['mid-retrieving','near-stowed'].includes(fixture)?'retrieving':fixture==='blocked'?'blocked':'stopped');
  if(fixture==='mid-lowering'){assert.ok(result.rode>0&&result.rode<result.targetRode);assert.ok(Math.abs(result.rode-4)<1e-6);}
  if(fixture==='weighed'){assert.equal(result.rode,0);assert.ok(result.continuity.samples>30);assert.ok(result.continuity.maxPositionStep<.08,'Anchor position continuous through lift and stow');assert.ok(result.continuity.maxRotationStep<.15,'Anchor orientation continuous through lift and stow');}
  const active=!['stowed','pending'].includes(result.status);assert.equal(result.deployed,active);assert.equal(result.stowed,!active);
  if(active){
   assert.ok(Math.hypot(...result.first.map((x,i)=>x-result.bow[i]))<2e-5,'Rode starts at the rolled/pitched real bow fitting');
   assert.ok(Math.hypot(...result.last.map((x,i)=>x-result.anchorPoint[i]))<2e-5,'Rode ends on actual anchor shackle');
   if(result.status!=='suspended'||result.rode>=.6)assert.ok(Math.hypot(...result.anchorPoint.map((x,i)=>x-result.snapshotAnchor[['x','y','z'][i]]))<2e-5,'Seabed anchor position matches physics');
  }
  assert.equal(result.geometry,results[0]?.geometry??result.geometry,'Reused rope geometry through all deployment states');
  await page.screenshot({path:`artifacts/anchor-${fixture}.png`,timeout:120000});results.push(result);console.log(JSON.stringify(result));
 }
 // Measure the incremental rendering cost with identical framing and geometry,
 // varying only stowed/deployed visibility through genuine control/state updates.
 const overhead=await page.evaluate(()=>{
  const h=window.anchorHarness;let s=h.fresh();h.yacht.group.position.set(s.x,0,s.z);h.yacht.group.rotation.set(0,0,0);
  const update=()=>{h.yacht.update(s,h.time+=.3);h.scene.updateMatrixWorld(true);};
  update();const bounds=h.visibleBounds(h.yacht.group);
  h.initializeAnchoredScenario(s,{rode:80});update();bounds.union(h.visibleBounds(h.yacht.group));
  // One camera encloses the union of both complete states, including the seabed
  // anchor and every loose turn. It never inherits the preceding surface view.
  const camera=h.cameras[0];camera.aspect=1440/900;h.fitCamera(camera,bounds,[.8,.25,.9],1.2);
  const submitted=new Set(),hooks=[];
  h.scene.traverse(object=>{if(!object.isMesh)return;const original=object.onBeforeRender;hooks.push([object,original]);object.onBeforeRender=function(...args){submitted.add(this.uuid);original.apply(this,args);};});
  const measure=()=>{
   update();submitted.clear();const expected=[];h.scene.traverseVisible(object=>{if(object.isMesh&&object.material.visible!==false)expected.push(object.uuid);});
   h.renderer.setViewport(0,0,1440,900);h.renderer.setScissorTest(false);h.renderer.render(h.scene,camera);
   const anchor=h.rig.getObjectByName(s.anchor?'deployed-anchor':'stowed-anchor'),anchorMeshes=[];anchor.traverseVisible(object=>{if(object.isMesh)anchorMeshes.push(object.uuid);});
   return{calls:h.renderer.info.render.calls,visibleMeshes:expected.length,submittedMeshes:submitted.size,allVisibleSubmitted:expected.every(id=>submitted.has(id)),anchorSubmitted:anchorMeshes.length>0&&anchorMeshes.every(id=>submitted.has(id)),rodeSubmitted:submitted.has(h.rig.getObjectByName('deployed-anchor-rode').uuid)};
  };
  const deployed=measure();s=h.fresh();const stowed=measure();
  for(const [object,original] of hooks)object.onBeforeRender=original;
  return{stowed:stowed.calls,deployed:deployed.calls,extraCalls:deployed.calls-stowed.calls,visibility:{stowed,deployed}};
 });
 for(const [state,visibility] of Object.entries(overhead.visibility)){assert.ok(visibility.allVisibleSubmitted,`${state}: complete visible geometry submitted without frustum loss`);assert.ok(visibility.anchorSubmitted,`${state}: anchor body actually submitted`);}
 assert.equal(overhead.visibility.deployed.rodeSubmitted,true,'Deployed rode actually submitted');assert.equal(overhead.visibility.stowed.rodeSubmitted,false,'Stowed rode hidden');
 assert.equal(overhead.extraCalls,1,'Replacing stowed anchor with deployed anchor plus rode adds one draw call');
 assert.deepEqual(errors,[],'No browser rendering errors');
 await page.evaluate(()=>{const h=window.anchorHarness;h.disposeSceneResources(h.scene,{extraMaterials:Object.values(h.materials)});h.renderer.dispose();h.renderer.forceContextLoss();});
 await writeFile('artifacts/anchor-visual-diagnostics.json',JSON.stringify({results,overhead},null,2));
 console.log('Anchor browser checks passed',overhead);
}finally{await browser.close();}
