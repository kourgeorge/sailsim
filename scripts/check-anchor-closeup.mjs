import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const expect=baseExpect.configure({timeout:60000}),url=process.env.SAIL_URL||'http://127.0.0.1:5196';
await mkdir('artifacts/anchor-closeup',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 if(!process.argv.includes('--ui')){
 await page.route('**/anchor-closeup-harness',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><style>body{margin:0;font:14px system-ui}#scene{position:relative;width:100vw;height:100vh}[hidden]{display:none!important}</style><div id="scene"></div></html>'}));
 await page.goto(`${url}/anchor-closeup-harness`);
 await page.evaluate(async()=>{
  const [THREE,{RoomEnvironment},{createMaterials},{createYacht},{createAnchorCloseup},physics,controls,{anchorSnapshot,initializeAnchoredScenario}]=await Promise.all([
   import('/node_modules/three/build/three.module.js'),import('/node_modules/three/examples/jsm/environments/RoomEnvironment.js'),import('/src/rendering/materials.js'),import('/src/rendering/yacht.js'),import('/src/rendering/anchor-closeup.js'),import('/src/physics.js'),import('/src/vessel-controls.js'),import('/src/anchor.js')]);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(.7);
  const container=document.querySelector('#scene');container.append(renderer.domElement);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room);room.dispose();pmrem.dispose();
  const yacht=createYacht(createMaterials()),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();scene.background=new THREE.Color('#234d36');scene.add(yacht.group);
  const closeup=createAnchorCloseup(container,renderer,yacht.group,environment.texture);
  const fresh=()=>Object.assign(physics.initialState(),{windSpeed:0,currentSpeed:0,speed:0,rudder:0,heading:0,sails:0,mainHoist:0,jibHoist:0});
  const h=window.anchorCloseupHarness={THREE,renderer,yacht,scene,camera,closeup,environment,physics,controls,anchorSnapshot,initializeAnchoredScenario,fresh,state:fresh()};
  h.render=()=>{
   yacht.group.position.set(h.state.x,0,h.state.z);yacht.group.rotation.set(0,-h.state.heading*Math.PI/180,0);yacht.update(h.state,0);scene.updateMatrixWorld(true);
   renderer.setViewport(0,0,innerWidth,innerHeight);renderer.setScissor(12,14,200,220);renderer.setScissorTest(false);renderer.autoClear=true;renderer.render(scene,camera);
   const viewport=renderer.getViewport(new THREE.Vector4()).toArray(),scissor=renderer.getScissor(new THREE.Vector4()).toArray();
   const visible=closeup.render(h.state),gl=renderer.getContext(),pixel=new Uint8Array(4);gl.readPixels(2,2,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
   const area=document.querySelector('.anchor-closeup-window').getBoundingClientRect(),ratio=renderer.getPixelRatio();
   const width=Math.floor(area.width*ratio),height=Math.floor(area.height*ratio),pixels=new Uint8Array(width*height*4);
   if(visible)gl.readPixels(Math.floor(area.left*ratio),Math.floor((innerHeight-area.bottom)*ratio),width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   const colors=new Set();for(let i=0;i<pixels.length;i+=4)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);
   return {visible,snapshot:anchorSnapshot(h.state),pixel:[...pixel],colors:colors.size,viewport,restoredViewport:renderer.getViewport(new THREE.Vector4()).toArray(),scissor,restoredScissor:renderer.getScissor(new THREE.Vector4()).toArray(),scissorTest:renderer.getScissorTest(),autoClear:renderer.autoClear};
  };
 });
 let outside;
 for(const fixture of ['stowed','pending','lowering','paused','seabed','retrieving','retrieved']){
  const result=await page.evaluate(fixture=>{
   const h=window.anchorCloseupHarness;
   if(fixture==='pending')h.controls.applyControlPatch(h.state,{anchor:true,anchorRode:45});
   if(fixture==='lowering')for(let i=0;i<100;i++)h.physics.step(h.state,.1);
   if(fixture==='seabed')for(let i=0;i<1100;i++)h.physics.step(h.state,.1);
   if(fixture==='retrieving'){h.controls.applyControlPatch(h.state,{anchor:false});for(let i=0;i<600;i++)h.physics.step(h.state,.1);}
   if(fixture==='retrieved')for(let i=0;i<1300;i++)h.physics.step(h.state,.1);
   return h.render();
  },fixture);
  assert.equal(result.visible,!['stowed','retrieved'].includes(fixture));
  assert.deepEqual(result.viewport,result.restoredViewport,'Close-up preserves the main camera viewport');
  assert.deepEqual(result.scissor,result.restoredScissor,'Close-up restores the original scissor');
  assert.equal(result.scissorTest,false);assert.equal(result.autoClear,true);
  outside??=result.pixel;assert.deepEqual(result.pixel,outside,'Close-up leaves pixels outside its frame intact');
  if(result.visible)assert.ok(result.colors>40,`${fixture}: actual 3D anchor pixels in the close-up`);
  if(fixture==='lowering')assert.equal(result.snapshot.status,'suspended');
  if(fixture==='seabed')assert.equal(result.snapshot.seabedContact,true);
  if(fixture==='retrieving')assert.equal(result.snapshot.operation,'retrieving');
  if(fixture==='retrieved')assert.equal(result.snapshot.status,'stowed');
  await page.screenshot({path:`artifacts/anchor-closeup/${fixture}.png`});console.log(fixture,result.snapshot.status,result.snapshot.rode,result.colors);
 }
 const disposal=await page.evaluate(()=>{
  const h=window.anchorCloseupHarness,rig=h.yacht.group.getObjectByName('anchor-rig');let borrowedDisposed=0;
  rig.traverse(object=>{object.geometry?.addEventListener('dispose',()=>borrowedDisposed++);});
  h.closeup.dispose();const removed=!document.querySelector('.anchor-closeup');h.environment.dispose();h.renderer.dispose();h.renderer.forceContextLoss();return{removed,borrowedDisposed};
 });
 assert.deepEqual(disposal,{removed:true,borrowedDisposed:0});
 }

 // The actual lesson starts with a deployed anchor: no altered app state or clock.
 await page.goto(`${url}/?lang=en`,{waitUntil:'domcontentloaded',timeout:120000});
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="31"]').click();
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await page.locator('#play').click();
 const closeup=page.locator('.anchor-closeup');await expect(closeup).toBeVisible();await expect(closeup).toHaveAttribute('data-anchor-status','slack');
 await expect(closeup.locator('bdi')).toHaveText('45.0 m');
 for(const view of ['chase','helm','deck']){
  await page.locator(`button[data-camera=${view}]`).click();await expect(page.locator('#scene')).toHaveAttribute('data-camera',view);
  await expect(closeup).toBeVisible();await page.screenshot({path:`artifacts/anchor-closeup/app-${view}.png`});
 }
 await page.setViewportSize({width:390,height:844});await expect(closeup).toBeInViewport();
 await page.screenshot({path:'artifacts/anchor-closeup/app-mobile.png'});
 await page.locator('.mobile-controls-toggle').click();await page.locator('#mobile-tab-anchor').click();
 await expect.poll(()=>page.evaluate(()=>document.querySelector('.anchor-closeup').getBoundingClientRect().bottom<=document.querySelector('.mobile-controls-drawer').getBoundingClientRect().top-8)).toBe(true);
 const frame=Number(await page.locator('#scene').getAttribute('data-frames'));
 await page.waitForFunction(frame=>Number(document.querySelector('#scene').dataset.frames)>frame+2,frame);
 await page.screenshot({path:'artifacts/anchor-closeup/app-mobile-controls.png'});
 await page.setViewportSize({width:1024,height:768});
 await page.locator('#practice-end').click();await page.locator('#close-modal').click();
 await expect(closeup).toBeVisible();
 const layout=await page.evaluate(()=>{const inset=document.querySelector('.anchor-closeup').getBoundingClientRect(),card=document.querySelector('.lesson-card').getBoundingClientRect();return {separate:inset.left>=card.right+8||inset.right<=card.left-8||inset.bottom<=card.top-8||inset.top>=card.bottom+8};});
 assert.ok(layout.separate,'Narrow desktop close-up stays clear of the restored lesson card');
 const finalFrame=Number(await page.locator('#scene').getAttribute('data-frames'));
 await page.waitForFunction(frame=>Number(document.querySelector('#scene').dataset.frames)>frame+2,finalFrame);
 await page.screenshot({path:'artifacts/anchor-closeup/app-narrow-desktop.png'});
 assert.deepEqual(errors,[]);console.log('Anchor close-up passed: genuine physics states, rendered pixels, main viewport, borrowed resources and desktop/mobile UI.');
}catch(error){await page.screenshot({path:'artifacts/anchor-closeup/failure.png'}).catch(()=>{});throw error;}finally{await browser.close();}
