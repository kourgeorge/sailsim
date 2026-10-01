import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts/cockpit',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});page.setDefaultTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.route('**/cockpit-qa*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#12333f}#scene{height:100vh;width:100vw}canvas{display:block}</style></head><body><div id="scene"></div></body></html>'}));
 await page.goto(`${url}/cockpit-qa`,{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  // Vite may rewrite static imports with HMR timestamps. Use the display's
  // exact runtime URL so initialization and rendering share one singleton.
  const source=await (await fetch('/src/rendering/helm-display.js')).text();
  const runtimeUrl=source.match(/from\s*['"]([^'"]*i18n\/runtime\.js[^'"]*)['"]/)[1];
  const [{createScene},{initialState,refreshDerived},runtime,course]=await Promise.all([import('/src/scene.js'),import('/src/physics.js'),import(runtimeUrl),import('/src/learning/curriculum.js')]);
  const {initializeLocalization,getLanguage,translate}=runtime;
  const state=initialState();state.speed=4.27;state.heading=35;state.rudder=-12;state.throttle=.25;state.currentSpeed=1.2;state.currentDirection=110;refreshDerived(state);
  const scene=createScene(document.querySelector('#scene'));
  window.qa={scene,state,refreshDerived,initializeLocalization,getLanguage,translate,course,time:12};
  window.qa.settle=async(view,count=24)=>{scene.setView(view);for(let i=0;i<count;i++){scene.render(state,window.qa.time);await new Promise(requestAnimationFrame);}};
 });
 for(const heel of process.argv.includes('--display-only')?[]:[-38,0,38]){
  await page.evaluate(heel=>{qa.state.heel=heel;},heel);
  await page.evaluate(()=>qa.settle('deck'));
  await page.screenshot({path:`artifacts/cockpit/deck-heel-${heel}.png`,timeout:120000});
  results.push({heel,...await page.locator('#scene').evaluate(node=>({view:node.dataset.camera,drawCalls:node.dataset.drawCalls,triangles:node.dataset.triangles}))});
  if(heel!==0){
   // Inspect the cockpit from the low side: the high gunwale otherwise hides
   // the floor at positive heel. Dragging uses the normal camera interaction.
   if(heel>0){await page.mouse.move(400,400);await page.mouse.down();await page.mouse.move(924,520);await page.mouse.up();}
   await page.evaluate(async()=>{for(let i=0;i<24;i++){qa.scene.render(qa.state,qa.time);await new Promise(requestAnimationFrame);}});
   await page.screenshot({path:`artifacts/cockpit/floor-heel-${heel}.png`,timeout:120000});
   await page.evaluate(()=>qa.settle('helm'));
   await page.screenshot({path:`artifacts/cockpit/helm-heel-${heel}.png`,timeout:120000});
  }
 }
 await page.evaluate(()=>{qa.state.heel=0;});
 for(const view of ['helm']){
  await page.evaluate(view=>qa.settle(view),view);
  await page.screenshot({path:`artifacts/cockpit/${view}.png`,timeout:120000});
 }
 // Capture the actual onboard display texture, not reconstructed test graphics.
 async function saveScreen(name){const png=await page.evaluate(()=>qa.scene.getInstrumentCanvas().toDataURL('image/png'));await writeFile(`artifacts/cockpit/display-${name}.png`,Buffer.from(png.split(',')[1],'base64'));}
 await saveScreen('en');
 const locales=[];
 for(const lang of process.argv.includes('--display-only')?['en','es','fr','ru','he','ar']:['he','ar']){
  const localized=await page.evaluate(async lang=>{
   const before=qa.scene.getInstrumentCanvas().toDataURL();
   history.replaceState(null,'',`/cockpit-qa?lang=${lang}`);
   await qa.initializeLocalization(qa.course.lessons,qa.course.modules);
   // Record the strings actually drawn to the physical instrument canvas.
   const canvas=qa.scene.getInstrumentCanvas(),ctx=canvas.getContext('2d'),original=ctx.fillText,drawn=[],bounds=[];
   ctx.fillText=function(text,x,y,...args){drawn.push(text);const width=ctx.measureText(text).width,left=ctx.textAlign==='right'?x-width:x;bounds.push({text,left,right:left+width,y,font:ctx.font});return original.call(this,text,x,y,...args);};
   qa.state.rudder+=1; // Make the actual display redraw even for its current language.
   try{qa.scene.render(qa.state,qa.time);}finally{ctx.fillText=original;}
   const expected=['CHART','BOAT SPEED','HEADING','DEPTH','APPARENT WIND','HELM','Engine throttle','Wind over water'].map(label=>qa.translate(label));
   return {language:qa.getLanguage(),changed:before!==canvas.toDataURL(),expected,drawn,bounds,width:canvas.width,height:canvas.height};
  },lang);
  assert.equal(localized.language,lang);assert.equal(localized.changed,true,`${lang}: physical display pixels change after localization`);
  for(const label of localized.expected)assert.ok(localized.drawn.join(' ').includes(label),`${lang}: actual onboard canvas draws ${label}`);
  assert.equal(localized.width,2400);assert.equal(localized.height,1440);
  // Exclude intentionally clipped chart labels. Metric labels/numbers must stay
  // on the logical 1200px display without browser maxWidth compression.
  for(const box of localized.bounds.filter(box=>box.left>=570))assert.ok(box.right<=1195,`${lang}: ${box.text} exceeds the screen (${box.right})`);
  locales.push(localized);
  await saveScreen(lang);await page.screenshot({path:`artifacts/cockpit/helm-${lang}.png`,timeout:120000});
 }
 for(const viewport of [{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>qa.settle('helm'));
  await page.screenshot({path:`artifacts/cockpit/helm-${viewport.width}-ar.png`,timeout:120000});
 }
 await page.setViewportSize({width:1440,height:1000});
 // Physics/animation time is identical. Camera still gets real render time.
 const paused=await page.evaluate(async()=>{
  await qa.settle('helm',45);
  const capture=()=>{qa.scene.render(qa.state,qa.time);return document.querySelector('#scene>canvas').toDataURL();};
  const before=capture(),displayBefore=qa.scene.getInstrumentCanvas().toDataURL();
  for(let i=0;i<8;i++){await new Promise(requestAnimationFrame);qa.scene.render(qa.state,qa.time);}
  const after=capture(),displayAfter=qa.scene.getInstrumentCanvas().toDataURL();
  return {sceneStable:before===after,displayStable:displayBefore===displayAfter};
 });
 assert.equal(paused.displayStable,true,'Paused onboard texture is stable');
 assert.equal(paused.sceneStable,true,'Settled paused scene pixels are identical');
 // Paused telemetry edits must still update the physical display.
 const edit=await page.evaluate(()=>{const before=qa.scene.getInstrumentCanvas().toDataURL();qa.state.throttle=-.5;qa.state.rudder=9;qa.scene.render(qa.state,qa.time);return before!==qa.scene.getInstrumentCanvas().toDataURL();});
 assert.equal(edit,true,'Paused helm/throttle edits refresh the single screen');
 await page.evaluate(()=>qa.scene.dispose());
 assert.equal(await page.locator('#scene>canvas').count(),0,'Disposal removes WebGL canvas');
 assert.deepEqual(errors,[],'Actual scene and Water shader render without errors');
 await writeFile('artifacts/cockpit/results.json',JSON.stringify({results,locales,paused,pausedEdit:edit,errors},null,2));
 console.log(`Cockpit checks passed: ${results.length} heel views, ${locales.length} language displays, paused pixel stability, live paused control updates, disposal.`);
}finally{await browser.close();}
