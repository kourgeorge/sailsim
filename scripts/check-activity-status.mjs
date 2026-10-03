import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {practiceFlowUI} from '../src/i18n/practice-flow.js';
const expect=baseExpect.configure({timeout:60000});
await mkdir('artifacts/activity',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message);});
const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
const state=id=>expect(page.locator('body')).toHaveAttribute('data-activity',id);
const records=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')||'{}'));
async function selectLesson(index){await page.locator('#course-library').click();await page.locator(`[data-library-lesson="${index}"]`).click();}
async function prepare(){await page.locator('#practice-start').click();await state('briefing');await expect(page.locator('#practice-briefing')).toBeVisible();await expect(page.locator('#lesson-reader')).toBeHidden();await expect(page.locator('.workspace')).toBeVisible();}
async function launch(){await page.locator('#practice-launch').click();await state('training-running');await expect(page.locator('.scene-title')).toBeHidden();await expect(page.locator('#practice-end')).toBeAttached();}
async function end(){await page.locator('#practice-end').click();await state('review');await expect(page.locator('.practice-debrief')).toBeVisible();await page.locator('#close-modal').click();await expect(page.locator('.scene-title')).toBeVisible();}
async function screenshot(name){await page.screenshot({path:`artifacts/activity/${name}.png`,fullPage:true});}
try{
 // Reproduce the user's Hebrew beam-reach path from an untouched course record.
 await page.goto(`${url}/?lang=he`,{waitUntil:'domcontentloaded',timeout:120000});await state('ready');
 await selectLesson(8);await expect(page.locator('#card-title')).toContainText('רוח צד');
 await page.locator('#lesson-briefing').click();await state('study');await expect(page.locator('.reader-paused')).toContainText(practiceFlowUI.he['Text lesson']);await screenshot('study-he');
 await page.locator('#reader-start-training').click();await state('briefing');await expect(page.locator('#lesson-reader')).toBeHidden();
 await expect(page.locator('#practice-briefing-title')).toContainText('רוח צד');
 await expect(page.locator('#heading')).toHaveText('075');await expect(page.locator('#speed')).toHaveText('3.0');
 const preparedRecord=await records();await page.waitForTimeout(500);assert.deepEqual(await records(),preparedRecord,'briefing does not award or create an attempt');
 await screenshot('briefing-he');
 await page.keyboard.press('Escape');await state('briefing');await expect(page.locator('#practice-briefing')).not.toBeVisible();
 await expect(page.locator('#conditions')).toBeHidden();await expect(page.locator('#play')).toBeHidden();
 await page.locator('#practice-start').click();await state('briefing');await expect(page.locator('#practice-briefing')).toBeVisible();await expect(page.locator('.practice-conditions')).toContainText('12');
 await launch();await expect(page.locator('#play')).not.toContainText('Set sail');await screenshot('running-he');
 // Reopening the task pauses the SAME attempt; Escape leaves it paused.
 await page.locator('#training-goals').click();await state('training-paused');
 await expect(page.locator('#practice-launch')).toHaveText(practiceFlowUI.he['Continue simulation']);
 const activeRecord=await records();await page.keyboard.press('Escape');await state('training-paused');
 const heading=await page.locator('#heading').textContent();await page.waitForTimeout(300);assert.equal(await page.locator('#heading').textContent(),heading);
 await page.locator('#play').click();await state('training-running');assert.deepEqual(await records(),activeRecord,'resume preserves attempt');
 await page.locator('#lesson-briefing').click();await state('study');await page.locator('#reader-close').click();await state('training-paused');
 await page.locator('#play').click();await state('training-running');await end();
 const stopped=await records();assert.equal(stopped.records['sail-09'].lastPracticeResult.status,'failed');assert.equal(stopped.records['sail-09'].practice,false);assert.equal(stopped.records['sail-09'].attempts,1);
 // A second physical lesson proves checkpoints/score really run only after Start.
 await selectLesson(3);await prepare();await launch();
 await page.locator('[data-camera="deck"]').click();await expect(page.locator('#practice-goal-count')).toContainText('1 / 2');await expect(page.locator('#practice-live-score')).toContainText('50 / 100');
 await page.locator('#chart-toggle').click();await state('training-paused');await page.locator('#close-modal').click();await state('review');
 const finished=await records();assert.equal(finished.records['sail-04'].lastPracticeResult.status,'passed');assert.equal(finished.records['sail-04'].lastPracticeResult.score,100);assert.equal(finished.records['sail-04'].practice,true);
 assert.equal(finished.records['sail-04'].passedAt,null,'preview cannot bypass course prerequisites');
 await page.locator('#close-modal').click();await expect(page.locator('.scene-title')).toBeVisible();
 await page.locator('#practice-start').click();await state('briefing');await page.keyboard.press('Escape');
 // Decision training also has a briefing, then an interactive scenario, never the reader.
 await selectLesson(0);await prepare();await page.locator('#practice-launch').click();await state('scenario-running');await expect(page.locator('#decision-training')).toBeVisible();await expect(page.locator('#lesson-reader')).toBeHidden();
 await page.locator('#training-close').click();await state('review');await page.locator('#training-finish').click();
 await page.locator('button[data-mode="explore"]').click();await state('free-paused');await page.locator('#play').click();await state('free-running');await page.locator('#play').click();await state('free-paused');
 console.log('Hebrew lifecycle, authored setup, pause/resume, assessed score, explicit end, decision and free sailing passed.');
 // Every language: practice entry and large-text/mobile briefing controls stay accessible.
 for(const lang of ['en','es','fr','ru','he','ar']){
  await page.setViewportSize({width:1440,height:1100});
  await page.goto(`${url}/?lang=${lang}`,{waitUntil:'domcontentloaded',timeout:120000});await expect(page.locator('html')).toHaveAttribute('lang',lang);
  await selectLesson(8);await prepare();
  await expect(page.locator('#practice-launch')).toHaveText(practiceFlowUI[lang]['Start simulation']);
  assert.equal(await page.locator('#practice-briefing').evaluate(node=>getComputedStyle(node,'::backdrop').backdropFilter),'none');
  await page.keyboard.press('Escape');
  await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
  await page.setViewportSize({width:390,height:844});await page.locator('#mobile-lesson-toggle').click();await page.locator('#practice-start').click();
  const geometry=await page.locator('#practice-briefing').evaluate(node=>{const box=node.getBoundingClientRect(),launch=node.querySelector('#practice-launch').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+2,within:box.left>=0&&box.right<=innerWidth+1&&box.bottom<=innerHeight,launchVisible:launch.top>=0&&launch.bottom<=innerHeight,height:box.height};});
  assert.equal(geometry.overflow,false,`${lang} horizontal overflow`);assert.equal(geometry.within,true,`${lang} dialog fits`);assert.equal(geometry.launchVisible,true,`${lang} start action visible`);assert.ok(geometry.height<=844*.71,`${lang} keeps view above dialog`);
  await screenshot(`briefing-${lang}-mobile-200`);await launch();await page.locator('#play').click();await state('training-paused');await expect(page.locator('.scene-title')).toBeHidden();
  await page.locator('#mobile-lesson-toggle').click();await page.locator('#practice-end').scrollIntoViewIfNeeded();await end();
  console.log(`${lang}: separate practice entry and 200% mobile briefing passed.`);
 }
 assert.deepEqual(errors,[]);await writeFile('artifacts/activity/results.json',JSON.stringify({passed:true,errors,languages:Object.keys(practiceFlowUI),states:['ready','study','briefing','scenario-running','training-running','training-paused','review','free-paused','free-running']},null,2));
 console.log('Activity and practice lifecycle checks passed.');
}catch(error){await screenshot('failure').catch(()=>{});throw error;}finally{await browser.close();}
