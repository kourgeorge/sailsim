import {chromium,expect as baseExpect} from '@playwright/test';
const expect=baseExpect.configure({timeout:60000});
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {decisionScenarios} from '../src/learning/decision-scenarios.js';
await mkdir('artifacts/training',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const assessmentFixesOnly=process.argv.includes('--assessment-fixes');
const checkedScenarios=assessmentFixesOnly?decisionScenarios.filter(s=>s.lessonId==='sail-05'):process.argv.includes('--quick')?decisionScenarios.slice(0,1):decisionScenarios;
const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
async function selectLesson(id){await page.locator('#course-library').click();await page.locator(`[data-library-lesson="${Number(id.slice(-2))-1}"]`).click();await expect(page.locator('#lesson-reader')).toBeHidden();}
async function fillStage(stage){for(const fact of stage.requiredFacts)await page.locator(`[data-scenario-inspect="${fact}"]`).click();for(const field of stage.fields){if(field.type==='select')await page.locator(`[data-value="${field.id}"]`).selectOption(field.expected);else if(field.type==='number')await page.locator(`[data-value="${field.id}"]`).fill(String(field.expected));else if(field.type==='checks'){for(const value of field.expected)await page.locator(`[data-check="${field.id}"][value="${value}"]`).check();}else for(const value of field.expected)await page.locator(`[data-add="${field.id}"]`).selectOption(value);}}
async function checkAssessmentFixes(){
 const scenario=decisionScenarios.find(s=>s.lessonId==='sail-05');
 for(const north of [360,359.5]){
  await selectLesson(scenario.lessonId);await page.locator('#practice-start').click();await page.locator('#practice-launch').click();
  for(const stage of scenario.stages){
   await fillStage(stage);
   if(stage.id==='shift'){
    const input=page.locator('[data-value="windFrom"]');
    await expect(input).toHaveAttribute('min','0');await expect(input).toHaveAttribute('max','360');
    await input.fill(String(north));
   }
   await page.locator('#training-commit').click();
  }
  await expect(page.locator('.training-debrief h2')).toHaveText('Training passed');
  await expect(page.locator('.training-score strong')).toHaveText('100 / 100');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')).records['sail-05'].lastDecisionResult);
  assert.equal(saved.status,'passed');assert.equal(saved.score,100);assert.deepEqual(saved.penalties,[]);
  assert.equal(saved.objectives[2].evidence.windFrom,String(north),'Persist the learner’s exact input');
  await page.locator('.training-results details').nth(2).locator('summary').click();
  await expect(page.locator('.training-results details').nth(2)).toContainText(String(north));
  await page.locator('#training-finish').click();console.log('North bearing passed without deduction:',north);
 }
 // Emulate an accepted legacy report, keeping identity, score and objective
 // metadata intact. Modify both copies so restoration cannot hide the defect
 // by falling back to an unmodified history entry.
 await page.evaluate(()=>{
  const progress=JSON.parse(localStorage.getItem('sail-training-v1')),record=progress.records['sail-05'];
  const reports=[record.lastDecisionResult,...record.decisionResults.filter(r=>r.id===record.lastDecisionResult.id)];
  for(const report of reports){report.objectives[0].evidence=null;delete report.objectives[1].evidence;}
  progress.selected='sail-05';localStorage.setItem('sail-training-v1',JSON.stringify(progress));
 });
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#practice-debrief')).toBeVisible();await page.locator('#practice-debrief').click();
 await expect(page.locator('.practice-debrief')).toContainText('Training passed');
 await expect(page.locator('.practice-debrief')).toContainText('100 / 100');
 const rows=page.locator('.practice-debrief .training-results details');await expect(rows).toHaveCount(3);
 for(const index of [0,1]){await rows.nth(index).locator('summary').click();await expect(rows.nth(index)).toContainText('Not completed');}
 await rows.nth(2).locator('summary').click();await expect(rows.nth(2)).toContainText('359.5');
 assert.deepEqual(errors,[],'Opening the restored debrief must not raise page errors');
 await page.screenshot({path:'artifacts/training/assessment-fixes.png',fullPage:true});
 console.log('Restored null and missing action evidence opens safely with original north-bearing evidence retained.');
}
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});await expect(page.locator('#practice-start')).toBeVisible();
 if(assessmentFixesOnly)await checkAssessmentFixes();
 else {
 await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await expect(page.locator('#decision-training')).toBeVisible();await expect(page.locator('#lesson-reader')).toBeHidden();await expect(page.locator('#training-form')).toBeVisible();
 const speed=await page.locator('#speed').textContent(),rudder=await page.locator('#rudder').inputValue();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#rudder').inputValue(),rudder);assert.equal(await page.locator('#speed').textContent(),speed);
 await page.locator('#training-commit').click();await expect(page.locator('#training-feedback')).toContainText('Complete the marked');await expect(page.locator('.training-score strong')).toContainText('0');
 await page.locator('[data-check="prepare"][value="replace"]').check();await page.locator('[data-scenario-inspect="inventory"]').click();await page.locator('#training-hint').click();await page.locator('#training-study').click();await expect(page.locator('#lesson-reader')).toBeVisible();await expect(page.locator('#decision-training')).toBeHidden();await page.locator('#reader-start-training').click();await expect(page.locator('#decision-training')).toBeVisible();await expect(page.locator('[data-check="prepare"][value="replace"]')).toBeChecked();await expect(page.locator('#reports-status')).toContainText('1 / 2');
 await page.screenshot({path:'artifacts/training/direct-start.png',fullPage:true});
 for(const fact of decisionScenarios[0].stages[0].requiredFacts)await page.locator(`[data-scenario-inspect="${fact}"]`).click();await page.locator('[data-check="prepare"][value="ignore"]').check();await page.locator('#training-commit').click();await expect(page.locator('.training-debrief h2')).toHaveText('Training not passed');await expect(page.locator('.training-debrief')).toContainText('Critical safety');
 await page.locator('.training-results details').first().locator('summary').click();await expect(page.locator('.training-results details').first()).toContainText('oversized');await page.screenshot({path:'artifacts/training/unsafe-debrief.png',fullPage:true});await page.locator('#training-finish').click();
 for(const scenario of checkedScenarios){await selectLesson(scenario.lessonId);await page.locator('#practice-start').click();await page.locator('#practice-launch').click();for(const stage of scenario.stages){await fillStage(stage);await page.locator('#training-commit').click();}await expect(page.locator('.training-debrief h2')).toHaveText('Training passed');await expect(page.locator('.training-score strong')).toContainText('100');await page.locator('#training-finish').click();console.log('Passed',scenario.lessonId);}
 const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('sail-training-v1')));assert.equal(Object.values(record.records).filter(r=>r.decision).length,checkedScenarios.length);assert.equal(record.records['sail-01'].decisionAttempts,2);assert.equal(record.records['sail-01'].decisionResults.length,2);assert.equal(record.records['sail-01'].hints,1);
 await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('#practice-debrief')).toBeVisible();await page.locator('#practice-debrief').click();await expect(page.locator('.practice-debrief')).toContainText('100 / 100');await page.locator('#close-modal').click();
 await selectLesson('sail-04');await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await expect(page.locator('#lesson-reader')).toBeHidden();await expect(page.locator('#decision-training')).toBeHidden();await expect(page.locator('#practice-live-score')).toBeVisible();await page.locator('[data-camera="deck"]').click();await expect(page.locator('#objective-text')).toContainText('chart');await page.locator('#chart-toggle').click();await page.locator('#close-modal').click();await expect(page.locator('.practice-debrief')).toBeVisible();await expect(page.locator('.practice-debrief')).toContainText('Training passed');await page.screenshot({path:'artifacts/training/physical-debrief.png',fullPage:true});await page.locator('#close-modal').click();
 await page.locator('#lesson-briefing').click();await expect(page.locator('#lesson-reader')).toBeVisible();await expect(page.locator('#reader-start-training')).toBeVisible();await page.locator('#reader-start-training').click();await page.locator('#practice-launch').click();await expect(page.locator('#lesson-reader')).toBeHidden();await expect(page.locator('#practice-live-score')).toBeVisible();
 if(process.argv.includes('--locales'))for(const lang of ['en','es','fr','ru','he','ar']){await page.goto(`${url}/?lang=${lang}`,{waitUntil:'domcontentloaded'});await expect(page.locator('html')).toHaveAttribute('lang',lang);await selectLesson('sail-01');await page.locator('#practice-start').click();await page.locator('#practice-launch').click();await expect(page.locator('#training-form')).toBeVisible();if(lang!=='en')assert.doesNotMatch(await page.locator('#training-title').textContent(),/Prepare Meridian/);await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();await page.screenshot({path:`artifacts/training/${lang}-200.png`,fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);assert.equal(overflow,false,lang+' page overflow');for(const stage of decisionScenarios[0].stages){await fillStage(stage);await page.locator('#training-commit').click();}assert.equal(await page.locator('#training-retry').count(),1);await page.locator('#training-finish').click();console.log('Locale passed',lang);}
 }
 assert.deepEqual(errors,[]);await writeFile(assessmentFixesOnly?'artifacts/training/assessment-fixes-result.json':'artifacts/training/browser-result.json',JSON.stringify({passed:true,assessmentFixesOnly,scenarios:checkedScenarios.length,languages:process.argv.includes('--locales')?['en','es','fr','ru','he','ar']:['en'],errors},null,2));console.log('Training browser checks passed.');
}catch(error){await page.screenshot({path:'artifacts/training/failure.png',fullPage:true}).catch(()=>{});console.log(await page.locator('#lesson-briefing').evaluate(el=>{const info=[];while(el){const s=getComputedStyle(el);info.push({tag:el.tagName,id:el.id,class:el.className,hidden:el.hidden,display:s.display,visibility:s.visibility,rect:el.getBoundingClientRect().toJSON()});el=el.parentElement;}return info;}).catch(()=>[]));throw error;}finally{await browser.close();}
