import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const expect=baseExpect.configure({timeout:60000}),url=process.argv.find(arg=>arg.startsWith('--url='))?.slice(6)||process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts/live-practice',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
const activity=id=>expect(page.locator('body')).toHaveAttribute('data-activity',id);
const visualTime=()=>page.locator('#scene').evaluate(e=>Number(e.dataset.visualTime));
const heading=()=>page.locator('#heading').evaluate(e=>Number(e.textContent));
const rows=id=>page.locator(`[data-requirement="${id}"]`);
async function checkDashboard(){
 await page.goto(`${url}/?lang=he`,{waitUntil:'domcontentloaded',timeout:120000});await activity('ready');
 await page.locator('button[data-mode="explore"]').click();await activity('free-paused');
 const dashboard=page.locator('#helm-dashboard'),read=key=>dashboard.locator(`[data-dashboard-value="${key}"]`);
 await expect(dashboard).toBeVisible();await expect(dashboard).toContainText('מהירות');
 const initialHeight=await dashboard.evaluate(node=>node.getBoundingClientRect().height);
 assert.ok(initialHeight<=100,`Default desktop dashboard stays compact: ${initialHeight}px`);
 // Wider readings must not move neighboring values or the playback strip.
 const layouts=await dashboard.evaluate(root=>{
  const sample=()=>[document.querySelector('#play'),root,...root.querySelectorAll('.dashboard-detail')].map(node=>{
   const {x,y,width,height}=node.getBoundingClientRect();return {x,y,width,height};
  });
  return [
   {speed:'0.00 kn',sog:'0.00 kn',cog:'—','water-speed':'0.0 kn','water-direction':'—','water-angle':'—',rudder:'↑ 0°',throttle:'– 0%'},
   {speed:'9.99 kn',sog:'9.99 kn',cog:'009°','water-speed':'9.9 kn','water-direction':'009°','water-angle':'← 9°',rudder:'← 9°',throttle:'▲ 9%'},
   {speed:'10.00 kn',sog:'10.00 kn',cog:'100°','water-speed':'10.0 kn','water-direction':'100°','water-angle':'→ 100°',rudder:'→ 10°',throttle:'▲ 100%'},
  ].map(values=>{for(const [key,value] of Object.entries(values))root.querySelector(`[data-dashboard-value="${key}"]`).textContent=value;return sample();});
 });
 for(const layout of layouts.slice(1))assert.deepEqual(layout,layouts[0],'Live readings keep the console layout stable');
 await page.locator('#conditions').click();await page.locator('#wind-speed').fill('10');await page.locator('#wind-direction').fill('0');await page.locator('#current-speed').fill('2');await page.locator('#current-direction').fill('90');await page.locator('#close-modal').click();
 await expect(read('water-speed')).toHaveText('10.2 kn');await expect(read('water-direction')).toHaveText('011°');await expect(read('sog')).toHaveText('2.00 kn');
 for(const id of ['rudder','trim','cockpit-jib-sheet','engine-throttle','engine-neutral','cockpit-main-hoist','cockpit-jib-hoist','reef','cockpit-anchor-rode','anchor'])await expect(page.locator(`.control-dock #${id}`)).toBeVisible();
 const dockHeight=await page.locator('.control-dock').evaluate(node=>node.getBoundingClientRect().height);assert.ok(dockHeight<250,`Desktop cockpit stays compact: ${dockHeight}px`);
 await page.locator('#trim').fill('30');await page.locator('#cockpit-jib-sheet').fill('45');await expect(page.locator('#vessel-jibSheet')).toHaveValue('45');await expect(page.locator('#trim')).toHaveValue('30');
 await page.locator('#cockpit-main-hoist').fill('50');await page.locator('#cockpit-jib-hoist').fill('0');await expect(page.locator('#vessel-mainHoist')).toHaveValue('0.5');await expect(page.locator('#vessel-jibHoist')).toHaveValue('0');
 await page.locator('#reef').click();await page.locator('#reef').click();await expect(page.locator('#vessel-reefLevel')).toHaveValue('2');
 await page.locator('#cockpit-anchor-rode').fill('0');await page.locator('#anchor').click();await expect(page.locator('#cockpit-anchor-rode')).toBeFocused();await expect(page.locator('#systems-drawer')).toBeHidden();
 await page.locator('#cockpit-anchor-rode').fill('50');await page.locator('#anchor').click();await expect(page.locator('#cockpit-anchor-paid')).toHaveText('0.0 m');
 await page.locator('#play').click();await activity('free-running');await expect(page.locator('#cockpit-anchor-paid')).not.toHaveText('0.0 m');await page.locator('#play').click();await activity('free-paused');
 await page.locator('#anchor').click();const paid=await page.locator('#cockpit-anchor-paid').textContent();await page.waitForTimeout(350);await expect(page.locator('#cockpit-anchor-paid')).toHaveText(paid);
 await page.locator('#reset').click();await activity('free-paused');
 for(const camera of ['helm','chase','deck']){
  await page.locator(`button[data-camera="${camera}"]`).click();await expect(page.locator('#scene')).toHaveAttribute('data-camera',camera);
  await expect(dashboard).toBeVisible();
  const layout=await dashboard.evaluate(node=>{const rect=node.getBoundingClientRect(),control=document.querySelector('#rudder').getBoundingClientRect();return {below:rect.top>control.bottom,clipped:[...node.querySelectorAll('dd,dt,.dashboard-detail')].some(el=>el.scrollWidth>el.clientWidth+2)};});
  assert.equal(layout.below,true,`${camera}: dashboard below controls`);assert.equal(layout.clipped,false,`${camera}: no clipped readings`);
 }
 const pixelRatio=await page.locator('#scene canvas').evaluate(canvas=>canvas.width/canvas.getBoundingClientRect().width);assert.ok(pixelRatio>=.69,'Camera retains adaptive rendering resolution');
 await page.locator('#rudder').fill('-15');await expect(read('rudder')).toHaveText('← 15°');
 await page.locator('#engine-throttle').fill('0.5');await expect(read('throttle')).toHaveText('▲ 50%');await expect(page.locator('#vessel-throttle')).toHaveValue('0.5');await page.locator('#engine-neutral').click();await expect(read('throttle')).toHaveText('– 0%');
 // Camera has actual wall time to settle; simulation remains paused throughout.
 await page.waitForTimeout(1500);await page.screenshot({path:'artifacts/live-practice/dashboard-he.png',fullPage:true});
 await page.locator('#dashboard-enlarge').click();await expect(page.locator('.dashboard-expanded')).toBeVisible();await expect(page.locator('.dashboard-expanded [data-dashboard-value="rudder"]')).toHaveText('← 15°');
 await page.screenshot({path:'artifacts/live-practice/dashboard-expanded-he.png',fullPage:true});await page.locator('#dashboard-close').click();
 await page.locator('#conditions').click();await page.locator('#wind-speed').fill('3');await page.locator('#wind-direction').fill('180');await page.locator('#current-speed').fill('3');await page.locator('#current-direction').fill('0');await page.locator('#close-modal').click();
 await expect(read('water-speed')).toHaveText('0.0 kn');await expect(read('water-direction')).toHaveText('—');await expect(read('water-angle')).toHaveText('—');
 await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();await page.setViewportSize({width:390,height:844});
 await expect(dashboard).toBeVisible();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Mobile 200% dashboard does not widen the page');
 assert.equal(await page.locator('.cockpit-control-groups').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),1,'200% phone controls use one readable column');
 assert.equal(await page.locator('.cockpit-hoist>label').evaluateAll(nodes=>nodes.every(node=>node.clientWidth>100)),true,'Hoist labels have room for words');
 await page.screenshot({path:'artifacts/live-practice/dashboard-mobile-he-200.png',fullPage:true});
 await page.locator('#dashboard-enlarge').click();await expect(page.locator('.dashboard-expanded')).toBeVisible();
 assert.equal(await page.locator('.dashboard-expanded').evaluate(root=>[...root.querySelectorAll('dd,dt,.dashboard-detail')].some(el=>el.scrollWidth>el.clientWidth+2)),false,'Expanded mobile readings fit');
 await page.locator('#dashboard-close').click();
 await page.setViewportSize({width:1440,height:1100});await page.goto(`${url}/?lang=ar`,{waitUntil:'domcontentloaded',timeout:120000});await activity('ready');
 await expect(dashboard).toContainText('سرعة');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Arabic dashboard fits');
 await page.screenshot({path:'artifacts/live-practice/dashboard-ar-200.png',fullPage:true});
 assert.deepEqual(errors,[]);await writeFile('artifacts/live-practice/dashboard-results.json',JSON.stringify({passed:true,initialHeight,dockHeight,pixelRatio,cameras:['helm','chase','deck'],languages:['he','ar'],mobileTextSize:200,currentWindReadings:true,calmUndefined:true,visibleCockpitControls:true,independentSheetsAndHoists:true,twoReefs:true,poweredAnchor:true,errors},null,2));
 console.log('Dashboard passed: compact strip, all cameras, Hebrew/Arabic, 200% mobile, enlarged readings, helm/throttle and current-derived wind.');
}
async function checkLayout(){
 await page.goto(`${url}/?lang=he`,{waitUntil:'domcontentloaded',timeout:120000});await activity('ready');
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="8"]').click();
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await activity('training-running');
 await page.locator('#practice-toggle').click();await activity('training-paused');
 await expect(page.locator('.control-dock')).toHaveAttribute('aria-disabled','false');
 await expect(page.locator('#rudder')).toBeEnabled();
 await expect(page.locator('.sidebar > .lesson-card.mission-sidebar')).toBeVisible();
 await expect(page.locator('.scene-title')).toBeHidden();
 assert.equal(await page.locator('.lesson-card').evaluate(card=>{const task=card.getBoundingClientRect(),scene=document.querySelector('#scene').getBoundingClientRect();return task.left<scene.right&&task.right>scene.left;}),false,'desktop task never overlaps the instrument scene');
 await page.locator('button[data-camera="deck"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','deck');
 await expect(page.locator('#practice-end')).toBeVisible();
 await page.screenshot({path:'artifacts/live-practice/layout-desktop-he.png',fullPage:true});
 await page.locator('button[data-camera="helm"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','helm');
 await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.simulator > .lesson-card')).toBeVisible();
 await expect(page.locator('.mission-sidebar')).toHaveCount(0);
 await page.locator('button[data-camera="deck"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','deck');
 await expect(page.locator('.lesson-card')).toBeVisible();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'200% mobile has no horizontal overflow');
 await page.screenshot({path:'artifacts/live-practice/layout-mobile-cockpit-he.png',fullPage:true});
 await page.locator('button[data-camera="helm"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','helm');
 await expect(page.locator('.lesson-card')).toBeVisible();
 await page.locator('#practice-end').click();await activity('review');await expect(page.locator('.practice-debrief')).toBeVisible();
 await expect(page.locator('.control-dock')).toHaveAttribute('aria-disabled','true');
 await expect(page.locator('#rudder')).toBeDisabled();
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
 await page.locator('button[data-mode="explore"]').click();await activity('free-paused');
 await expect(page.locator('.mission-sidebar')).toHaveCount(0);
 await expect(page.locator('.simulator > .lesson-card')).toHaveCount(1);
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/live-practice/layout-results.json',JSON.stringify({passed:true,language:'he',mobileTextSize:200,taskOutsideDesktopScene:true,chartAssessment:true,reset:true,modeSwitch:true,errors},null,2));
 console.log('Practice layout passed: desktop task rail, Cockpit/Helm switching, mobile 200%, explicit end, chart assessment, reset and mode switch.');
}
try{
 if(process.argv.includes('--dashboard'))await checkDashboard();else if(process.argv.includes('--layout'))await checkLayout();else{
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
 await page.locator('[data-camera="deck"]').click();await expect(page.locator('#scene')).toHaveAttribute('data-camera','deck');
 const frames=Number(await page.locator('#scene').getAttribute('data-frames'));await page.waitForFunction(frames=>Number(document.querySelector('#scene').dataset.frames)>frames+36,frames,{timeout:180000});
 assert.equal(await visualTime(),time);await page.screenshot({path:'artifacts/live-practice/cockpit-paused-he.png',fullPage:true});
 const before=await page.locator('#scene canvas').screenshot();await page.waitForTimeout(350);const after=await page.locator('#scene canvas').screenshot();
 assert.ok(before.equals(after),'Paused water and yacht pixels remain stationary after camera settles');
 await page.locator('[data-camera="helm"]').click();await page.locator('#play').click();await activity('training-running');
 let previousHeading=await heading(),previousTime=await visualTime(),metSeen=false;
 const deadline=Date.now()+240000;
 while(await page.locator('body').getAttribute('data-activity')==='training-running'&&Date.now()<deadline){
  const currentHeading=await heading(),currentTime=await visualTime(),dt=currentTime-previousTime;
  const yaw=dt>.02?((currentHeading-previousHeading+540)%360-180)/dt:0;
  const error=((47.5-currentHeading+540)%360)-180;
  try{await page.locator('#rudder').fill(String(Math.round(Math.max(-20,Math.min(20,error*1.4-yaw*2.2)))),{timeout:1500});}catch(error){if(await page.locator('body').getAttribute('data-activity')==='review')break;throw error;}
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
