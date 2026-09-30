import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const started=Date.now();await page.goto(process.env.SAIL_URL||'http://127.0.0.1:5187',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>document.querySelector('#scene')?.dataset.drawCalls,{timeout:120000});
 const diagnostics={startupMs:Date.now()-started,cameras:{}};
 for(const camera of ['chase','helm','deck']){
  await page.locator(`button[data-camera="${camera}"]`).click({timeout:60000});
  await page.waitForFunction(v=>document.querySelector('#scene').dataset.camera===v,camera,{timeout:60000});
  await page.waitForTimeout(2500);
  diagnostics.cameras[camera]=await page.locator('#scene').evaluate(e=>({...e.dataset}));
  await page.screenshot({path:`artifacts/graphics-${camera}.png`,timeout:60000});
  console.log(camera,diagnostics.cameras[camera]);
 }
 await page.locator('button[data-camera="chase"]').click();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(4000);
 await page.screenshot({path:'artifacts/graphics-mobile.png',timeout:60000});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 assert.deepEqual(errors,[],'No rendering JavaScript errors');
 await writeFile('artifacts/graphics-diagnostics.json',JSON.stringify(diagnostics,null,2));
 console.log('Visual smoke passed',diagnostics.startupMs);
} finally {await browser.close();}
