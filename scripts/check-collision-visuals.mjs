import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// A real scene and real simulation, rendered only at checkpoints so SwiftShader
// does not obscure physics assertions with frame-rate-dependent integration.
const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/collision-visual-harness',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><style>body{margin:0;background:#163743;color:white;font:16px system-ui}#scene{width:1440px;height:940px}#status{padding:16px;letter-spacing:.03em}</style></head><body><div id="scene"></div><div id="status">Collision verification</div></body></html>'}));
 await page.goto(`${url}/collision-visual-harness`);
 await page.evaluate(async()=>{
  const [{createScene},physics]=await Promise.all([import('/src/scene.js'),import('/src/physics.js')]);
  window.collisionHarness={scene:createScene(document.querySelector('#scene')),physics,time:0};
 });
 const results=[];
 for(const fixture of ['free','glancing','moored','dock']) {
  await page.evaluate(fixture=>{
   const h=window.collisionHarness,s=h.physics.initialState('haven');
   Object.assign(s,{windSpeed:0,currentSpeed:0,sails:0,mainHoist:0,jibHoist:0,speed:5,heading:90,rudder:0,throttle:0});
   const target=s.worldBodies.find(body=>body.id===`haven:${fixture==='moored'?'yacht:moored:0':fixture==='dock'?'marina:spine':'yacht:free:0'}`);
   if(fixture==='free'||fixture==='glancing'){target.heading=0;s.x=target.x-17;s.z=target.z+(fixture==='glancing'?-3.5:0);}
   if(fixture==='moored'){s.x=target.x-19;s.z=target.z;}
   if(fixture==='dock'){s.x=target.x+20;s.z=target.z;s.heading=270;}
   h.state=s;h.target=target;h.before={player:{x:s.x,z:s.z,speed:s.speed,heading:s.heading},target:{x:target.x,z:target.z,heading:target.heading}};
   document.querySelector('#status').textContent=`${fixture.toUpperCase()} · Approach · 5 kn · Actual simulation state`;
   h.scene.setView('chase');for(let i=0;i<10;i++)h.scene.render(s,h.time+=.1);
  },fixture);
  await page.screenshot({path:`artifacts/collision-${fixture}-approach.png`,timeout:120000});
  const result=await page.evaluate(fixture=>{
   const h=window.collisionHarness,s=h.state,target=h.target;
   let firstContact=null,maxYaw=0,maxDisplacement=0;
   for(let i=0;i<400;i++){
    h.physics.step(s,.025);
    maxYaw=Math.max(maxYaw,Math.abs(target.yawRate));
    maxDisplacement=Math.max(maxDisplacement,Math.hypot(target.x-h.before.target.x,target.z-h.before.target.z));
    if(s.collision?.bodyId===target.id&&!firstContact)firstContact=s.elapsed;
    if(firstContact&&s.elapsed-firstContact>.35)break;
   }
   document.querySelector('#status').textContent=`${fixture.toUpperCase()} · Contact ${s.collisionCount} · Target displacement ${maxDisplacement.toFixed(2)} m · Target yaw ${maxYaw.toFixed(1)}°/s · Player ${s.speed.toFixed(2)} kn`;
   for(let i=0;i<5;i++)h.scene.render(s,h.time+=.1);
   return{fixture,targetId:target.id,firstContact,maxYaw,maxDisplacement,before:h.before,player:{x:s.x,z:s.z,speed:s.speed,heading:s.heading},target:{x:target.x,z:target.z,heading:target.heading,vx:target.vx,vz:target.vz},collision:s.collision,diagnostics:{...document.querySelector('#scene').dataset}};
  },fixture);
  assert.ok(result.firstContact,`${fixture}: actual target contact`);
  assert.ok(result.collision.impulse>0,`${fixture}: positive contact impulse`);
  assert.ok(Math.abs(result.player.speed)<5,`${fixture}: player responds`);
  if(fixture==='free'||fixture==='glancing')assert.ok(result.maxDisplacement>.01,`${fixture}: second free hull moves`);
  if(fixture==='glancing')assert.ok(result.maxYaw>.1,'Off-centre impact rotates target');
  if(fixture==='dock')assert.deepEqual([result.target.x,result.target.z,result.target.heading],[result.before.target.x,result.before.target.z,result.before.target.heading],'Fixed dock remains fixed');
  await page.screenshot({path:`artifacts/collision-${fixture}-contact.png`,timeout:120000});
  if(fixture==='moored'){
   result.restraint=await page.evaluate(()=>{
    const h=window.collisionHarness,s=h.state,b=h.target;let max=0;
    for(let i=0;i<1200;i++){h.physics.step(s,.025);max=Math.max(max,Math.hypot(b.x-b.mooring.x,b.z-b.mooring.z));}
    return{max,radius:b.mooring.maxRadius,final:Math.hypot(b.x-b.mooring.x,b.z-b.mooring.z)};
   });
   assert.ok(result.restraint.max<=result.restraint.radius+.1,'Mooring restrains struck vessel');
  }
  results.push(result);console.log(JSON.stringify(result));
 }
 assert.deepEqual(errors,[],'No rendering errors');
 await page.evaluate(()=>window.collisionHarness.scene.dispose());
 await writeFile('artifacts/collision-visual-diagnostics.json',JSON.stringify(results,null,2));
 console.log('Collision scene checks passed: free bodies, glancing yaw, mooring restraint, fixed pier.');
} finally {await browser.close();}
