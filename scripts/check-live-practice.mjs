import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const expect=baseExpect.configure({timeout:60000}),url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts/live-practice',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
const activity=id=>expect(page.locator('#activity-status')).toHaveAttribute('data-state',id);
const visualTime=()=>page.locator('#scene').evaluate(e=>Number(e.dataset.visualTime));
const heading=()=>page.locator('#heading').evaluate(e=>Number(e.textContent));
const rows=id=>page.locator(`[data-requirement="${id}"]`);
async function checkLayout(){
 await page.goto(`${url}/?lang=he`,{waitUntil:'domcontentloaded',timeout:120000});await activity('ready');
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="8"]').click();
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await activity('training-running');
 await page.locator('#practice-toggle').click();await activity('training-paused');
 await expect(page.locator('.sidebar > .lesson-card.mission-sidebar')).toBeVisible();
 await expect(page.locator('.scene-title')).toBeHidden();
 assert.equal(await page.locator('.lesson-card').evaluate(card=>{const task=card.getBoundingClientRect(),scene=document.querySelector('#scene').getBoundingClientRect();return task.left<scene.right&&task.right>scene.left;}),false,'desktop task never overlaps the instrument scene');
 await page.locator('button[data-camera="instruments"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','instruments');
 await expect(page.locator('#practice-end')).toBeVisible();
 await page.screenshot({path:'artifacts/live-practice/layout-desktop-he.png',fullPage:true});
 await page.locator('button[data-camera="instruments"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','helm');
 await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.simulator > .lesson-card')).toBeVisible();
 await expect(page.locator('.mission-sidebar')).toHaveCount(0);
 await page.locator('button[data-camera="instruments"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','instruments');
 await expect(page.locator('.lesson-card')).toBeHidden();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'200% mobile has no horizontal overflow');
 await page.screenshot({path:'artifacts/live-practice/layout-mobile-instruments-he.png',fullPage:true});
 await page.locator('button[data-camera="instruments"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','helm');
 await expect(page.locator('.lesson-card')).toBeVisible();
 await page.locator('#practice-end').click();await activity('review');await expect(page.locator('.practice-debrief')).toBeVisible();
 await page.locator('#close-modal').click();await expect(page.locator('.scene-title')).toBeVisible();
 await page.setViewportSize({width:1440,height:1100});
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="3"]').click();
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await activity('training-running');
 await page.locator('[data-camera="deck"]').click();await expect(page.locator('#practice-goal-count')).toContainText('1 / 2');
 await page.locator('#chart-toggle').click();await activity('training-paused');await page.locator('#close-modal').click();await activity('review');
 await expect(page.locator('.practice-debrief')).toBeVisible();
 await page.locator('#close-modal').click();await expect(page.locator('.mission-sidebar')).toHaveCount(0);
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await activity('training-running');
 await page.locator('#reset').click();await activity('review');await expect(page.locator('.mission-sidebar')).toHaveCount(0);
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await activity('training-running');
 await page.locator('[data-mode="explore"]').click();await activity('free-paused');
 await expect(page.locator('.mission-sidebar')).toHaveCount(0);
 await expect(page.locator('.simulator > .lesson-card')).toHaveCount(1);
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/live-practice/layout-results.json',JSON.stringify({passed:true,language:'he',mobileTextSize:200,taskOutsideDesktopScene:true,chartAssessment:true,reset:true,modeSwitch:true,errors},null,2));
 console.log('Practice layout passed: desktop task rail, Instruments toggle, mobile 200%, explicit end, chart assessment, reset and mode switch.');
}
try{
 if(process.argv.includes('--layout'))await checkLayout();else{
 await page.goto(`${url}/?lang=he`,{waitUntil:'domcontentloaded',timeout:120000});await activity('ready');
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="8"]').click();
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await activity('training-running');
 await expect(page.locator('#scene')).toHaveAttribute('data-camera','helm');
 await expect(page.locator('.right-instruments')).toBeHidden();await expect(page.locator('.speed-display')).toBeHidden();
 await expect(rows('true-wind-angle')).toHaveAttribute('data-met','false');await expect(rows('true-wind-angle')).toContainText('80–105');
 await expect(rows('boat-speed')).toHaveAttribute('data-met','true');
 const start=await visualTime();await page.waitForFunction(start=>Number(document.querySelector('#scene').dataset.visualTime)>start+9,start,{timeout:180000});
 await expect(page.locator('#checkpoint-status')).toContainText('0.0 / 8');await activity('training-running');
 await page.locator('#play').click();await activity('training-paused');
 const time=await visualTime(),h=await heading();await page.waitForTimeout(350);assert.equal(await visualTime(),time);assert.equal(await heading(),h);
 // Camera remains responsive while all water/vessel animation time stays frozen.
 await page.locator('[data-camera="instruments"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','instruments');
 const frames=Number(await page.locator('#scene').getAttribute('data-frames'));await page.waitForFunction(frames=>Number(document.querySelector('#scene').dataset.frames)>frames+36,frames,{timeout:180000});
 assert.equal(await visualTime(),time);await page.screenshot({path:'artifacts/live-practice/instruments-paused-he.png',fullPage:true});
 const before=await page.locator('#scene canvas').screenshot();await page.waitForTimeout(350);const after=await page.locator('#scene canvas').screenshot();
 assert.ok(before.equals(after),'Paused water and yacht pixels remain stationary after camera settles');
 await page.locator('[data-camera="helm"]').click();await page.locator('#play').click();await activity('training-running');
 let previousHeading=await heading(),previousTime=await visualTime(),metSeen=false;
 const deadline=Date.now()+240000;
 while(await page.locator('#activity-status').getAttribute('data-state')==='training-running'&&Date.now()<deadline){
  const currentHeading=await heading(),currentTime=await visualTime(),dt=currentTime-previousTime;
  const yaw=dt>.02?((currentHeading-previousHeading+540)%360-180)/dt:0;
  const error=((47.5-currentHeading+540)%360)-180;
  try{await page.locator('#rudder').fill(String(Math.round(Math.max(-20,Math.min(20,error*1.4-yaw*2.2)))),{timeout:1500});}catch(error){if(await page.locator('#activity-status').getAttribute('data-state')==='review')break;throw error;}
  previousHeading=currentHeading;previousTime=currentTime;
  if(await page.evaluate(()=>document.querySelector('[data-requirement="true-wind-angle"]')?.dataset.met==='true'))metSeen=true;
  await page.waitForTimeout(130);
 }
 await activity('review');await expect(page.locator('.practice-debrief')).toBeVisible();assert.ok(metSeen);
 const report=await page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-09'].lastPracticeResult);
 assert.equal(report.status,'passed');assert.equal(report.score,100);assert.ok(report.objectives[0].heldSeconds>=8);
 const angle=Math.abs(((report.objectives[0].evidence.heading-report.objectives[0].evidence.windDirection+540)%360)-180);
 assert.ok(angle>=80&&angle<=105);assert.ok(Math.abs(report.objectives[0].evidence.speed)>2);
 const endTime=await visualTime();await page.waitForTimeout(350);assert.equal(await visualTime(),endTime,'success stops simulation time');
 await page.screenshot({path:'artifacts/live-practice/beam-reach-passed-he.png',fullPage:true});
 assert.deepEqual(errors,[]);await writeFile('artifacts/live-practice/results.json',JSON.stringify({passed:true,report,stationaryPausedPixels:true,hiddenDuplicateInstruments:true,errors},null,2));
 console.log('Real UI beam reach passed; speed alone did not count; true-angle feedback, frozen water, responsive camera and auto-stop verified.');
 }
}catch(error){await page.screenshot({path:'artifacts/live-practice/failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser.close();}
