import {chromium,expect as baseExpect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const expect=baseExpect.configure({timeout:60000});
const only=process.argv.find(x=>x.startsWith('--locales='));const codes=only?only.split('=')[1].split(','):['en','es','ar','he','ru','fr'];
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
await mkdir('artifacts/locales',{recursive:true});
const errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});page.setDefaultTimeout(60000);page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.SAIL_URL||'http://127.0.0.1:5187';
 for(const code of codes){
  console.log('Checking locale:',code);
  await page.goto(`${base}/?lang=${code}`,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(c=>document.documentElement.lang===c&&document.querySelector('#scene')?.dataset.drawCalls,code,{timeout:120000});
  const pack=JSON.parse(await readFile(`public/locales/${code}.json`,'utf8')),ui=JSON.parse(await readFile(`src/i18n/${code}-ui.json`,'utf8'));
  await expect(page.locator('#language-select')).toHaveValue(code);
  assert.equal(await page.locator('#language-select option').count(),6);
  assert.equal(await page.locator('html').getAttribute('dir'),['ar','he'].includes(code)?'rtl':'ltr');
  await expect(page.locator('#card-title')).toHaveText(pack.lessons['sail-01'].title);
  await page.locator('#lesson-briefing').click();
  await expect(page.locator('.reader-heading h1')).toHaveText(pack.lessons['sail-01'].title);
  await page.locator('[data-reader-section=question]').click();
  await expect(page.locator('.knowledge-question').first()).toContainText(pack.lessons['sail-01'].quiz[0].prompt);
  await expect(page.locator('#knowledge-form button')).toHaveText(({en:'Check answer',es:'Comprobar respuesta',ar:'تحقق من الإجابة',he:'בדיקת תשובה',ru:'Проверить ответ',fr:'Vérifier la réponse'})[code]);
  await page.screenshot({path:`artifacts/locales/${code}-lesson.png`,fullPage:true,timeout:90000});
  await page.locator('input[name="q0"][value="1"]').check();await page.locator('#knowledge-form button').click();await page.locator('#reader-next').click();await page.locator('input[name="q1"][value="1"]').check();await page.locator('#knowledge-form button').click();
  await expect(page.locator('#answer-1')).toContainText(pack.lessons['sail-01'].quiz[1].explanation);
  await page.locator('#reader-close').click();
  await expect(page.locator('#progress-label')).toHaveText('0 / 45');
  await page.locator('#course-library').click();assert.equal(await page.locator('[data-library-lesson]').count(),45);assert.equal(await page.locator('.course-library section').count(),11);await page.locator('#close-modal').click();
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1200);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${code}: no horizontal overflow`);
  assert.equal(await page.locator('#rudder').evaluate(el=>getComputedStyle(el).direction),'ltr',`${code}: physical helm direction not mirrored`);
  await page.locator('#systems-toggle').click();await expect(page.locator('#vessel-controls')).toBeVisible();await page.locator('#vessel-mainHoist').fill('0.5');await page.locator('#systems-close').click();
  await page.screenshot({path:`artifacts/locales/${code}-mobile.png`,fullPage:true,timeout:90000});
  results.push({code,passed:true,dir:await page.locator('html').getAttribute('dir')});
  console.log('Locale passed:',code);
  // Exercise the real switcher: returning to English must keep the same course record.
  if(code!=='en'){await page.locator('#language-select').selectOption('en');await page.waitForFunction(()=>document.documentElement.lang==='en'&&document.querySelector('#progress-label')?.textContent==='0 / 45',{timeout:120000});}
  // Clear only the browser-test record so each language starts at the same first lesson.
  await page.evaluate(()=>localStorage.removeItem('sail-training-v1'));
  await page.setViewportSize({width:1440,height:1000});
 }
 assert.deepEqual(errors,[]);await writeFile('artifacts/locales/results.json',JSON.stringify({results,errors},null,2));console.log('All selected language checks passed.');
}finally{await browser.close();}
