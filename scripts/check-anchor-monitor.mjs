import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {anchoringUI} from '../src/i18n/anchoring.js';
const expect=baseExpect.configure({timeout:60000}),url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts/anchoring',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const monitor=page.locator('#anchor-monitor');
const metric=key=>page.locator(`[data-anchor-metric="${key}"]`);
async function openAnchor(){await page.locator('#systems-toggle').click();await page.locator('details:has(> #anchor-monitor) > summary').click();}
const trainingSog=process.argv.includes('--training-sog');
async function checkTrainingGroundSpeed(){
 const row=page.locator('#practice-ground-speed'),limit=page.locator('#practice-ground-speed-threshold');
 const select=async index=>{await page.locator('#course-library').click();await page.locator(`[data-library-lesson="${index}"]`).click();await page.locator('#practice-start').click();};
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 await select(18);await expect(row).toBeHidden();await page.locator('#sails').click();
 await expect(row).toBeVisible();await expect(limit).toHaveText('< 1.00 kn');
 await select(30);await expect(row).toBeVisible();await expect(limit).toHaveText('< 0.80 kn');
 await expect(page.locator('#practice-ground-speed-value')).toHaveAttribute('dir','ltr');
 await page.locator('#sails').click();await page.screenshot({path:'artifacts/anchoring/training-coast.png',fullPage:true});
 console.log('Ground-speed feedback: coasting targets visible; waiting for natural boat deceleration.');
 // This is the real app, production clock and ordinary controls: no injected
 // state, synthetic elapsed time, or skipped assessment checkpoints.
 await expect(limit).toHaveText('< 0.20 kn',{timeout:600000});
 await page.locator('#anchor').click();await expect(monitor).toHaveAttribute('data-anchor-phase','slack');
 await expect(limit).toHaveText('< 0.20 kn');await page.screenshot({path:'artifacts/anchoring/training-settling.png',fullPage:true});
 console.log('Ground-speed feedback: anchor settling target visible; waiting for the assessed hold.');
 await expect(page.locator('.practice-debrief')).toContainText('Training passed',{timeout:900000});
 const report=await page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-31'].lastPracticeResult);
 assert.ok(report.objectives[0].evidence.speedOverGround<.8);
 assert.ok(report.objectives[1].evidence.speedOverGround<.2);
 assert.equal(report.objectives[1].evidence.anchorSeabedContact,true);
 for(const summary of await page.locator('.training-results details summary').all())await summary.click();
 await expect(page.locator('.practice-debrief')).toContainText('Ground speed');
 await page.screenshot({path:'artifacts/anchoring/training-debrief.png',fullPage:true});await page.locator('#close-modal').click();
 await select(31);await expect(row).toBeVisible();await expect(page.locator('#practice-ground-speed-limit')).toBeHidden();
 await page.locator('#anchor').click();await expect(page.locator('#objective-text')).toHaveText('Raise sails');await expect(row).toBeHidden();
 console.log('Ground-speed feedback: saved measured evidence and departure-stage visibility passed.');
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/anchoring/training-sog-result.json',JSON.stringify({passed:true,checkedAt:new Date().toISOString(),checks:['sail-19 coast target','sail-31 coast and anchor targets','natural assessed completion','saved ground-speed and seabed-contact evidence','sail-32 unbounded departure and hidden sail stage'],report,errors},null,2));
}
try{
 if(trainingSog){
  await checkTrainingGroundSpeed();assert.deepEqual(errors,[]);
 }else{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await expect(monitor).toHaveAttribute('data-anchor-phase','stowed');
 await page.locator('[data-mode="explore"]').click();await page.locator('#sails').click();await openAnchor();
 await page.locator('#vessel-anchorRode').fill('10');await page.locator('[data-command="anchor"]').click();
 await expect(monitor).toHaveAttribute('data-anchor-phase','pending');await expect(page.locator('#anchor span')).toHaveText('Cancel deployment');
 await expect(metric('radius')).toHaveText('—');await expect(page.locator('[data-anchor-help]')).toContainText('Resume');
 await page.locator('#play').click();await expect(monitor).toHaveAttribute('data-anchor-phase','suspended');
 await expect(page.locator('#anchor span')).toHaveText('Weigh anchor');await expect(metric('radius')).toHaveText('—');
 await page.locator('#play').click();await page.locator('#vessel-anchorRode').fill('120');
 await expect(monitor).toHaveAttribute('data-anchor-phase','suspended');await expect(page.locator('[data-anchor-help]')).toContainText('Resume');
 await page.locator('#play').click();await expect(monitor).toHaveAttribute('data-anchor-phase','slack');await page.locator('#play').click();
 await expect(metric('scope')).toHaveText('3.3:1');await expect(metric('radius')).toHaveText('114.4 m');
 await expect(page.locator('.anchor-diagram')).toHaveAttribute('data-anchor-status','slack');
 await page.screenshot({path:'artifacts/anchoring/monitor-en.png',fullPage:true});
 await page.locator('#systems-close').click();await page.locator('#chart-toggle').click();await expect(page.locator('.chart-legend')).toContainText('bow swing limit');
 await page.screenshot({path:'artifacts/anchoring/chart-en.png',fullPage:true});await page.locator('#close-modal').click();
 await page.locator('#anchor').click();await expect(monitor).toHaveAttribute('data-anchor-phase','stowed');
 for(const lang of ['en','es','fr','ru','he','ar']){
  await page.goto(`${url}/?lang=${lang}`,{waitUntil:'domcontentloaded',timeout:120000});await expect(page.locator('html')).toHaveAttribute('lang',lang);
  await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
  await openAnchor();await page.locator('#vessel-anchorRode').fill('10');await page.locator('[data-command="anchor"]').click();
  await expect(monitor).toHaveAttribute('data-anchor-phase','pending');await expect(page.locator('span[data-anchor-phase]')).toHaveText(anchoringUI[lang]['Awaiting deployment']);
  await expect(page.locator('[data-command="anchor"]')).toHaveText(anchoringUI[lang]['Cancel deployment']);
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
 assert.deepEqual(errors,[]);await writeFile('artifacts/anchoring/monitor-result.json',JSON.stringify({passed:true,checkedAt:new Date().toISOString(),languages:['en','es','fr','ru','he','ar'],widths:[1440,390],textSize:200,phases:['stowed','pending','suspended','slack'],errors},null,2));
 console.log('Anchor UI lifecycle, chart, localization and large-text checks passed.');
 }
}catch(error){await page.screenshot({path:'artifacts/anchoring/failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser.close();}
