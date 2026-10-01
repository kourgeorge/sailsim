import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';

const server=await createServer({cacheDir:'/tmp/sail-practice-panel-vite',server:{host:'127.0.0.1',port:0},logLevel:'error'});
await server.listen();
const url=`http://127.0.0.1:${server.httpServer.address().port}`;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await page.route('**/practice-panel-harness?*',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><meta charset="utf-8"><body><aside class="sidebar" style="width:276px;height:auto;display:block"><div class="lesson-card mission-sidebar"><div class="lesson-copy" id="panel"></div></div></aside></body></html>'}));
 let samples=0;
 for(const language of ['en','he','ar','es','fr','ru']){
  await page.goto(`${url}/practice-panel-harness?lang=${language}`);
  await page.evaluate(async()=>{
   await import('/src/style.css');await import('/src/accessibility/text-size.css');await import('/src/learning/learning.css');await import('/src/learning/decision-ui.css');
   const [{practiceRequirementsMarkup,updatePracticeRequirements},{initializeLocalization,translate:t},{lessons,modules},{initialState}]=await Promise.all([import('/src/learning/practice-requirements.js'),import('/src/i18n/runtime.js'),import('/src/learning/curriculum.js'),import('/src/physics.js')]);
   await initializeLocalization(lessons,modules);
   document.querySelector('#panel').innerHTML=`<div class="training-status-line"><strong class="practice-score">${t('Live score')}: <bdi id="practice-score-value" dir="ltr">0 / 100</bdi></strong></div>${practiceRequirementsMarkup()}<div class="checkpoint-progress"><div></div></div><div class="checkpoint-meta"><span id="checkpoint-status">${t('Continuous hold')}: <bdi dir="ltr">0.0 / 20 s</bdi></span><button>${t('Show hint')}</button></div>`;
   window.panelHarness={root:document.querySelector('#practice-requirements'),updatePracticeRequirements,state:initialState(),attempt:{events:new Set()}};
   await document.fonts.ready;
  });
  for(const width of [235,276,360])for(const scale of [100,125,200]){
   const result=await page.evaluate(({width,scale})=>{
    const h=window.panelHarness;document.querySelector('.sidebar').style.width=`${width}px`;
    document.documentElement.dataset.textSize=String(scale);document.documentElement.style.setProperty('--text-scale',String(scale/100));
    const box=element=>{const r=element.getBoundingClientRect();return[r.x,r.y,r.width,r.height];};
    const layout=()=>[box(h.root),box(document.querySelector('.checkpoint-progress')),box(document.querySelector('.checkpoint-meta')),...[...h.root.querySelectorAll('tbody tr,tbody th,tbody td')].map(box)];
    const check={kind:'windAngle',value:[45,55]},frames=[],overflow=[];
    const readings=[{angle:17.5,speed:4.08},{angle:9.9,speed:.01},{angle:10,speed:1.99},{angle:99.9,speed:9.99},{angle:100,speed:10},{angle:179.9,speed:10.01},{angle:50,speed:4.08},{angle:45,speed:4.08},{angle:55,speed:4.08},{angle:50,speed:4.08,paused:true},{angle:44.9,speed:4.08},{angle:0,speed:4.08,calm:true},{angle:-50,speed:4.08}];
    let table;
    for(const [index,reading] of readings.entries()){
     const windDirection=[315,85,180,0][index%4];Object.assign(h.state,{windDirection,windSpeed:reading.calm?0:12,currentSpeed:0,heading:(windDirection+reading.angle+360)%360,speed:reading.speed});
     h.updatePracticeRequirements(h.root,check,h.state,h.attempt,Boolean(reading.paused));
     table??=h.root.querySelector('table');if(table!==h.root.querySelector('table'))throw new Error('Reading update replaced the table');
     document.querySelector('#practice-score-value').textContent=`${[0,9,10,99,100][index%5]} / 100`;
     document.querySelector('#checkpoint-status bdi').textContent=`${[0,9.9,10,19.9][index%4].toFixed(1)} / 20 s`;
     frames.push(layout());
     for(const value of h.root.querySelectorAll('td bdi')){
      const cell=value.closest('td').getBoundingClientRect(),r=value.getBoundingClientRect();
      if(r.left<cell.left-1||r.right>cell.right+1)overflow.push({text:value.textContent,cell:cell.width,value:r.width});
     }
     if(reading.calm&&getComputedStyle(h.root.querySelector('.requirement-guidance')).visibility!=='hidden')throw new Error('Calm wind exposes invalid heading guidance');
    }
    const maxShift=Math.max(...frames.slice(1).flatMap(frame=>frame.flatMap((rect,i)=>rect.map((value,j)=>Math.abs(value-frames[0][i][j])))));
    const panelWidth=h.root.getBoundingClientRect().width,tableLabel=h.root.querySelector('table').getAttribute('aria-label');
    // A different goal removes its unused guidance area and can change rows.
    h.updatePracticeRequirements(h.root,{kind:'speedAbove',value:2},h.state,h.attempt,false);
    const guidanceHidden=h.root.querySelector('.requirement-guidance').hidden;
    h.updatePracticeRequirements(h.root,check,h.state,h.attempt,false);
    return{maxShift,overflow,guidanceHidden,panelWidth,tableLabel,samples:readings.length};
   },{width,scale});
   assert.ok(result.maxShift<.1,`${language} ${width}px ${scale}%: panel moved ${result.maxShift}px`);
   assert.deepEqual(result.overflow,[],`${language} ${width}px ${scale}%: numeric values fit`);
   assert.ok(result.panelWidth<=width&&result.panelWidth>width-50,'Harness uses the requested rail width');
   if(language!=='en')assert.notEqual(result.tableLabel,'Live requirements','Harness exercises translated requirements');
   assert.equal(result.guidanceHidden,true);samples+=result.samples;
   if(width===276&&scale===125){
    await page.evaluate(()=>{const h=window.panelHarness;Object.assign(h.state,{windDirection:315,windSpeed:12,heading:297.5,speed:4.08});h.updatePracticeRequirements(h.root,{kind:'windAngle',value:[45,55]},h.state,h.attempt,false);});
    await page.screenshot({path:`/tmp/sail-practice-panel-${language}.png`});
   }
  }
 }
 assert.deepEqual(errors,[]);console.log(`Practice panel passed: ${samples} changing readings/statuses, six languages, three widths, 100–200% text; no layout movement or numeric overflow.`);
}finally{await browser.close();await server.close();}
