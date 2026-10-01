import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {anchoringUI} from '../src/i18n/anchoring.js';
import {windlassUI} from '../src/i18n/windlass.js';
const expect=baseExpect.configure({timeout:60000}),url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts/anchoring',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const monitor=page.locator('#anchor-monitor');
const metric=key=>page.locator(`[data-anchor-metric="${key}"]`);
async function openAnchor(){
 if(await page.locator('#systems-drawer').isHidden())await page.locator('#systems-toggle').click();
 const section=page.locator('details:has(> #anchor-monitor)');if(!await section.evaluate(node=>node.open))await section.locator(':scope > summary').click();
}
const selectLesson=async index=>{const learn=page.locator('button[data-mode="learn"]');if(!await learn.evaluate(node=>node.classList.contains('active')))await learn.click();await page.locator('#course-library').click();await page.locator(`[data-library-lesson="${index}"]`).click();await page.locator('#practice-start').click();await page.locator('#practice-launch').click();};
async function paidBetween(min,max,timeout=120000){await page.waitForFunction(({min,max})=>{const value=parseFloat(document.querySelector('[data-anchor-metric="rode"]').textContent);return value>min&&value<max;},{min,max},{timeout});}
async function geometrySnapshot(){return page.locator('#anchor-monitor').evaluate(root=>({paid:root.querySelector('[data-anchor-metric="rode"]').textContent,scope:root.querySelector('[data-anchor-metric="scope"]').textContent,path:root.querySelector('[data-rode]')?.getAttribute('d'),point:root.querySelector('[data-anchor-icon]')?.getAttribute('transform')}));}
const trainingSog=process.argv.includes('--training-sog');
async function checkTrainingLayout(){
 for(const lang of ['en','ar']){
  await page.goto(`${url}/?lang=${lang}`,{waitUntil:'domcontentloaded',timeout:120000});
  await expect(page.locator('html')).toHaveAttribute('lang',lang);
  await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('125');await page.locator('.text-size-control summary').click();
  await page.setViewportSize({width:1440,height:1100});await selectLesson(31);await page.locator('#play').click();
  const rode=page.locator('#practice-anchor-rode');await expect(rode).toBeVisible();
  const fits=()=>rode.evaluate(node=>{const row=node.getBoundingClientRect(),card=node.closest('.lesson-card').getBoundingClientRect();return row.top>=card.top&&row.bottom<=card.bottom;});
  assert.equal(await fits(),true,`${lang}: live rode is visible without scrolling at default text size`);
  await page.screenshot({path:`artifacts/anchoring/training-layout-${lang}-desktop.png`,fullPage:true});
  await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
  await page.setViewportSize({width:390,height:844});await rode.scrollIntoViewIfNeeded();
  assert.equal(await fits(),true,`${lang}: live rode stays readable when scrolled at 200% text`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
  await page.screenshot({path:`artifacts/anchoring/training-layout-${lang}-mobile-200.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log('Live anchor target layout passed: English/Arabic, default desktop and 200% mobile.');
}
async function checkTrainingGroundSpeed(){
 const row=page.locator('#practice-ground-speed'),limit=page.locator('#practice-ground-speed-threshold');
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 await selectLesson(18);await expect(row).toBeHidden();await page.locator('#sails').click();
 await expect(row).toBeVisible();await expect(limit).toHaveText('< 1.00 kn');
 await selectLesson(30);await expect(row).toBeVisible();await expect(limit).toHaveText('< 0.80 kn');
 await expect(page.locator('#practice-ground-speed-value')).toHaveAttribute('dir','ltr');
 await page.locator('#sails').click();await page.screenshot({path:'artifacts/anchoring/training-coast.png',fullPage:true});
 console.log('Ground-speed feedback: coasting targets visible; waiting for natural boat deceleration.');
 // This is the real app, production clock and ordinary controls: no injected
 // state, synthetic elapsed time, or skipped assessment checkpoints.
 await expect(limit).toHaveText('< 0.20 kn',{timeout:600000});
 await expect(metric('target')).toHaveText('45.0 m');await expect(page.locator('#practice-anchor-rode')).toBeVisible();await expect(page.locator('#practice-anchor-rode-value')).toHaveText('0.0 / 45.0 m');await page.locator('#anchor').click();
 await expect(monitor).toHaveAttribute('data-anchor-phase','suspended');await expect(monitor).toHaveAttribute('data-anchor-operation','lowering');
 await expect(limit).toHaveText('< 0.20 kn');await page.screenshot({path:'artifacts/anchoring/training-settling.png',fullPage:true});
 console.log('Ground-speed feedback: waiting for 45 m actual payout (112.5 simulation seconds), automatic stop, and assessed settling.');
 await expect(metric('rode')).toHaveText('45.0 m',{timeout:900000});await expect(monitor).toHaveAttribute('data-anchor-operation','stopped',{timeout:120000});
 await expect(page.locator('.practice-debrief')).toContainText('Training passed',{timeout:900000});
 const report=await page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-31'].lastPracticeResult);
 assert.equal(report.windlassAssessmentVersion,1);assert.ok(report.objectives[0].evidence.speedOverGround<.8);
 assert.ok(report.objectives[1].evidence.speedOverGround<.2);
 assert.equal(report.objectives[1].evidence.anchorSeabedContact,true);
 assert.equal(report.objectives[1].evidence.anchorPaidRode,45);assert.equal(report.objectives[1].evidence.anchorRode,45);assert.equal(report.objectives[1].evidence.anchorWinchRunning,false);
 assert.ok(report.objectives[1].completedAt-report.objectives[0].completedAt>=112.4,'Actual payout duration is included in assessed simulation time');
 for(const summary of await page.locator('.training-results details summary').all())await summary.click();
 await expect(page.locator('.practice-debrief')).toContainText('Ground speed');await expect(page.locator('.practice-debrief')).toContainText('Rode paid out: 45.0 m');await expect(page.locator('.practice-debrief')).toContainText('Rode target: 45.0 m');await expect(page.locator('.practice-debrief')).toContainText('✓ Windlass stopped');
 await page.screenshot({path:'artifacts/anchoring/training-debrief.png',fullPage:true});await page.locator('#close-modal').click();
 await selectLesson(31);await expect(row).toBeVisible();await expect(page.locator('#practice-ground-speed-limit')).toBeHidden();await expect(metric('rode')).toHaveText('45.0 m');
 await expect(page.locator('#anchor span')).toHaveText('Weigh anchor');await page.locator('#anchor').click();
 await expect(monitor).toHaveAttribute('data-anchor-operation','retrieving');await expect(page.locator('#objective-text')).toHaveText('Weigh anchor');
 await paidBetween(1,44);await expect(page.locator('#objective-text')).toHaveText('Weigh anchor');
 console.log('Departure: progressive retrieval confirmed; waiting the full 180 simulation seconds for 45 m to be recovered.');
 await expect(page.locator('#objective-text')).toHaveText('Raise sails',{timeout:900000});await expect(row).toBeHidden();
 await expect(metric('rode')).toHaveText('0.0 m');await expect(monitor).toHaveAttribute('data-anchor-phase','stowed');
 await page.screenshot({path:'artifacts/anchoring/training-retrieved.png',fullPage:true});
 await page.locator('#sails').click();await page.locator('#systems-toggle').click();
 const rig=page.locator('[data-system-section="rig"]');if(!await rig.evaluate(node=>node.open))await rig.locator(':scope > summary').click();
 await page.locator('#trim').fill('60');await page.locator('#vessel-jibSheet').fill('60');await page.locator('#systems-close').click();
 await expect(page.locator('.practice-debrief')).toContainText('Training passed',{timeout:900000});
 const departure=await page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-32'].lastPracticeResult);
 assert.ok(departure.objectives[0].completedAt>=180,'Departure cannot complete before actual 180-second retrieval');
 assert.equal(departure.objectives[0].evidence.anchorPaidRode,0);assert.equal(departure.objectives[0].evidence.anchor,false);assert.equal(departure.objectives[0].evidence.anchorWinchRunning,false);
 assert.ok(departure.objectives[2].evidence.speed>2.5);assert.equal(departure.status,'passed');
 console.log('Timed windlass training: saved payout, stopped-motor, full retrieval and departure evidence passed.');
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/anchoring/training-sog-result.json',JSON.stringify({passed:true,checkedAt:new Date().toISOString(),checks:['sail-19 coast target','sail-31 actual45m payout and stopped motor','natural assessed completion','saved ground-speed and seabed-contact evidence','sail-32 actual180s retrieval and full departure'],report,departure,errors},null,2));
}
try{
 if(process.argv.includes('--training-layout')){
  await checkTrainingLayout();
 }else if(trainingSog){
  await checkTrainingGroundSpeed();assert.deepEqual(errors,[]);
 }else{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await expect(monitor).toHaveAttribute('data-anchor-phase','stowed');
 await page.locator('button[data-mode="explore"]').click();await page.locator('#sails').click();await openAnchor();
 await page.locator('#vessel-anchorRode').fill('5');await page.locator('[data-command="anchor"]').click();
 await expect(monitor).toHaveAttribute('data-anchor-phase','pending');await expect(monitor).toHaveAttribute('data-anchor-operation','paused');
 await expect(page.locator('#anchor span')).toHaveText('Stop windlass');await expect(metric('rode')).toHaveText('0.0 m');await expect(metric('target')).toHaveText('5.0 m');
 await expect(metric('radius')).toHaveText('—');await expect(page.locator('[data-anchor-help]')).toContainText('Resume');
 await page.locator('#play').click();await expect(monitor).toHaveAttribute('data-anchor-phase','suspended');await expect(monitor).toHaveAttribute('data-anchor-operation','lowering');
 await paidBetween(.9,5);await page.locator('#play').click();await expect(monitor).toHaveAttribute('data-anchor-operation','paused');
 const pausedGeometry=await geometrySnapshot();await page.locator('#vessel-anchorRode').fill('10');
 await expect(metric('target')).toHaveText('10.0 m');assert.deepEqual(await geometrySnapshot(),pausedGeometry,'Paused target edit cannot change paid length or physical anchor diagram');
 await page.locator('[data-command="anchor-stop"]').click();await expect(monitor).toHaveAttribute('data-anchor-operation','stopped');await expect(page.locator('#anchor span')).toHaveText('Resume windlass');
 await page.locator('#play').click();const stoppedPaid=await metric('rode').textContent(),frames=Number(await page.locator('#scene').getAttribute('data-frames'));
 await page.waitForFunction(before=>Number(document.querySelector('#scene').dataset.frames)>before+2,frames);
 assert.equal(await metric('rode').textContent(),stoppedPaid,'Stopped motor does not pay out while the simulator runs');
 await page.locator('#vessel-anchorRode').fill('5');await page.locator('[data-command="anchor"]').click();
 await expect(metric('rode')).toHaveText('5.0 m',{timeout:180000});await expect(monitor).toHaveAttribute('data-anchor-operation','stopped');
 await expect(page.locator('#anchor span')).toHaveText('Weigh anchor');await page.locator('[data-command="anchor-retrieve"]').click();
 await expect(monitor).toHaveAttribute('data-anchor-operation','retrieving');await expect(monitor).toHaveAttribute('data-anchor-phase','suspended');
 await paidBetween(0,4.8);await expect(monitor).toHaveAttribute('data-anchor-phase','suspended');
 await expect(monitor).toHaveAttribute('data-anchor-phase','stowed',{timeout:180000});await expect(metric('rode')).toHaveText('0.0 m');
 // Bottom geometry comes from the prescribed departure setup, not an instant
 // target edit. The longer actual retrieval is exercised by --training-sog.
 await page.locator('#systems-close').click();await selectLesson(31);await page.locator('#play').click();await openAnchor();
 await expect(monitor).toHaveAttribute('data-anchor-phase','slack');await expect(monitor).toHaveAttribute('data-anchor-operation','stopped');
 await expect(metric('rode')).toHaveText('45.0 m');await expect(metric('target')).toHaveText('45.0 m');
 const depth=parseFloat(await metric('depth').textContent()),radius=parseFloat(await metric('radius').textContent());
 assert.ok(Math.abs(radius-Math.sqrt(45**2-(depth+1.2)**2))<.2,'Prepared bottom geometry matches actual45m rode');
 await expect(page.locator('.anchor-diagram')).toHaveAttribute('data-anchor-status','slack');
 await page.screenshot({path:'artifacts/anchoring/monitor-en.png',fullPage:true});
 await page.locator('#systems-close').click();await page.locator('#chart-toggle').click();await expect(page.locator('.chart-legend')).toContainText('bow swing limit');
 await page.screenshot({path:'artifacts/anchoring/chart-en.png',fullPage:true});await page.locator('#close-modal').click();
 for(const lang of ['en','es','fr','ru','he','ar']){
  await page.goto(`${url}/?lang=${lang}`,{waitUntil:'domcontentloaded',timeout:120000});await expect(page.locator('html')).toHaveAttribute('lang',lang);
  await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
  const dictionary=JSON.parse(await readFile(new URL(`../src/i18n/${lang}-ui.json`,import.meta.url),'utf8'));
  await openAnchor();
  await expect(page.locator('[data-command="anchor"]')).toHaveText(windlassUI[lang]['Run to target']);
  await expect(page.locator('[data-command="anchor-stop"]')).toHaveText(windlassUI[lang]['Stop windlass']);
  await expect(page.locator('[data-command="anchor-retrieve"]')).toHaveText(dictionary['Weigh anchor']);
  await page.locator('#vessel-anchorRode').fill('5');await page.locator('[data-command="anchor"]').click();
  await expect(monitor).toHaveAttribute('data-anchor-phase','pending');await expect(page.locator('span[data-anchor-phase]')).toHaveText(anchoringUI[lang]['Awaiting deployment']);
  await expect(page.locator('#anchor span')).toHaveText(windlassUI[lang]['Stop windlass']);
  await expect(monitor).toHaveAttribute('data-anchor-operation','paused');await expect(metric('rode')).toHaveText('0.0 m');
  await page.locator('[data-command="anchor-stop"]').click();await expect(page.locator('#anchor span')).toHaveText(windlassUI[lang]['Resume windlass']);
  await expect(monitor).toHaveAttribute('data-anchor-operation','stopped');await page.locator('[data-command="anchor"]').click();
  await expect(monitor).toHaveAttribute('data-anchor-operation','paused');
  await expect(page.locator('.anchor-diagram title')).toHaveText(anchoringUI[lang]['Side view · schematic']);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:width===390?844:1100});await monitor.scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,`${lang} page overflow at ${width}`);
   assert.equal(await monitor.evaluate(el=>el.scrollWidth>el.clientWidth+2),false,`${lang} monitor overflow at ${width}`);
   await expect(metric('rode')).toHaveAttribute('dir','ltr');
   await page.locator('[data-command="anchor"]').scrollIntoViewIfNeeded();await expect(page.locator('[data-command="anchor"]')).toBeVisible();
   await page.screenshot({path:`artifacts/anchoring/${lang}-${width}-200.png`,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1100});console.log('Anchor monitor locale passed:',lang);
 }
 assert.deepEqual(errors,[]);await writeFile('artifacts/anchoring/monitor-result.json',JSON.stringify({passed:true,checkedAt:new Date().toISOString(),languages:['en','es','fr','ru','he','ar'],widths:[1440,390],textSize:200,phases:['stowed','pending','suspended','slack'],operations:['paused','lowering','stopped','retrieving'],checks:['short timed payout/retrieval','paused target geometry unchanged','stopped motor','prepared45m bottomgeometry','sixlanguage run/stop/retrieve labels'],errors},null,2));
 console.log('Anchor UI lifecycle, chart, localization and large-text checks passed.');
 }
}catch(error){await page.screenshot({path:'artifacts/anchoring/failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser.close();}
