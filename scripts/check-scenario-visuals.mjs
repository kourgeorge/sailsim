import {chromium} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {decisionScenarios} from '../src/learning/decision-scenarios.js';
import {renderScenarioScene} from '../src/learning/scenario-visual.js';
const samples=decisionScenarios.flatMap(s=>s.stages.flatMap(stage=>['en','es','fr','ru','he','ar'].map(lang=>({id:`${s.lessonId}/${stage.id}/${lang}`,scenarioId:s.id,family:s.family,stageId:stage.id,scene:stage.scene,facts:stage.facts,values:{},lang}))));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}});
 await page.setContent(samples.map(vm=>`<section data-id="${vm.id}">${renderScenarioScene(vm).svg}</section>`).join(''));
 const problems=await page.evaluate(()=>{
  const problems=[],ids=new Set();for(const section of document.querySelectorAll('section')){const svg=section.querySelector('svg'),name=section.dataset.id;
   for(const item of svg.querySelectorAll('[id]')){if(ids.has(item.id))problems.push(`${name}: duplicate ID`);ids.add(item.id);}
   for(const text of svg.querySelectorAll('text')){const b=text.getBBox();if(b.x<0||b.x+b.width>800||b.y<0||b.y+b.height>440)problems.push(`${name}: text clips: ${text.textContent}`);}
   for(const path of svg.querySelectorAll('[marker-end]')){const id=path.getAttribute('marker-end').match(/url\(#(.+)\)/)?.[1],marker=id&&svg.querySelector(`[id="${id}"]`);if(marker?.getAttribute('orient')!=='auto')problems.push(`${name}: missing automatic arrow marker`);if(path.getTotalLength()<.1)problems.push(`${name}: zero-length arrow`);}
  }return problems;
 });
 if(problems.length)throw new Error(problems.join('\n'));
 await mkdir('artifacts',{recursive:true});
 const css=await readFile('src/learning/scenario-visual.css','utf8'),source=await readFile('src/learning/scenario-visual.js','utf8');
 await page.setContent(`<style>${css}body{margin:0;padding:24px;background:#f3f5ee;font-family:system-ui}.sample{border-bottom:1px solid #afc4b5;margin-bottom:25px;padding-bottom:25px}h2{font-size:17px;color:#193e48}</style><main id="samples" style="display:grid;grid-template-columns:1fr 1fr;gap:22px"></main>`);
 await page.addScriptTag({type:'module',content:source+'\nwindow.createScenarioVisual=createScenarioVisual;'});
 await page.waitForFunction(()=>window.createScenarioVisual);
 const selected=[['sail-01','roles',{alex:'helm',sam:'lookout',jo:'lines'}],['sail-02','reverse-view',{left:'starboard',right:'port',bottom:'bow'}],['sail-05','course',{heading:45}],['sail-20','window',{departure:'0800'}],['sail-21','route',{route:['S','A','B','F']}],['sail-25','trend',{}],['sail-29','obstruction',{fenders:'starboard',escape:'port'}],['sail-30','tide',{rode:40,radius:50}]];
 const examples=selected.map(([id,stage,values],i)=>{const vm=samples.find(s=>s.id===`${id}/${stage}/${['en','ru','he','ar'][i%4]}`);return vm?{...vm,values}:null;}).filter(Boolean);
 await page.evaluate(examples=>{for(const vm of examples){const host=document.createElement('section');host.className='sample';const heading=document.createElement('h2');heading.textContent=vm.id;host.append(heading);const mount=document.createElement('div');host.append(mount);document.querySelector('#samples').append(host);const visual=window.createScenarioVisual(mount,{onInspect(){}});visual.update(vm);}},examples);
 await page.screenshot({path:'artifacts/scenario-workbench-contact-sheet.png',fullPage:true});
 const route=samples.find(vm=>vm.id==='sail-21/route/en');
 if(route){
  await page.evaluate(vm=>{document.body.innerHTML='<main id="interaction"></main>';window.actions=[];window.inspections=[];window.vm={...vm,inspected:[],values:{route:[]}};window.visual=window.createScenarioVisual(document.querySelector('#interaction'),{onInspect(id){window.inspections.push(id);window.vm.inspected.push(id);window.visual.update(window.vm);},onAction(action){window.actions.push(action);window.vm.values.route.push(action.value);window.visual.update(window.vm);}});window.visual.update(window.vm);},route);
  await page.locator('[data-scenario-inspect]').first().click();
  await page.locator('[data-scenario-waypoint="A"]').click();
  const outcome=await page.evaluate(()=>({action:window.actions[0],inspected:window.inspections.length,text:document.querySelector('.scenario-visual__report').textContent}));
  if(outcome.action?.value!=='A'||outcome.action?.fieldId!=='route'||outcome.action?.type!=='append'||outcome.inspected!==1||!outcome.text.trim())throw new Error('Inspection/waypoint interaction failed');
  await page.evaluate(()=>window.visual.dispose());
  if(await page.locator('#interaction').innerHTML())throw new Error('Dispose did not release view content');
 }
 console.log(`${samples.length} fixture/language combinations passed SVG checks. Inspection, route action, state update and disposal passed. Screenshot: artifacts/scenario-workbench-contact-sheet.png`);
}finally{await browser.close();}
