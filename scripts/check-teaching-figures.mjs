import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {lessons} from '../src/learning/curriculum.js';
import {advancedLessons} from '../src/learning/advanced-course.js';
import {renderTeachingFigure,getTeachingFigureCaption} from '../src/learning/teaching-figures.js';

// Static SVG QA only: does not start the simulator, WebGL, or a development server.
const course=[...new Map([...lessons,...advancedLessons].map(lesson=>[lesson.id,lesson])).values()];
const languages=['en','es','fr','ru','he','ar'];
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1520,height:1050},deviceScaleFactor:1});
  const samples=languages.flatMap(lang=>course.map(lesson=>({id:`${lang}-${lesson.id}`,svg:renderTeachingFigure(lesson,lang)})));
  await page.setContent(`<main>${samples.map(({id,svg})=>`<section data-id="${id}">${svg}</section>`).join('')}</main>`);
  const issues=await page.evaluate(()=>{
    const problems=[],ids=new Set();
    for(const section of document.querySelectorAll('section')) {
      const svg=section.querySelector('svg'),name=section.dataset.id;
      if(!svg||!svg.querySelector('title')?.textContent||!svg.querySelector('desc')?.textContent) {problems.push(`${name}: missing accessible description`);continue;}
      for(const element of svg.querySelectorAll('[id]')) {
        if(ids.has(element.id)) problems.push(`${name}: duplicated ID ${element.id}`);
        ids.add(element.id);
      }
      for(const element of svg.querySelectorAll('text')) {
        const box=element.getBBox();
        if(box.x<0||box.x+box.width>760||box.y<0||box.y+box.height>430) problems.push(`${name}: label clips: ${element.textContent}`);
      }
      for(const element of svg.querySelectorAll('path')) if(/NaN|undefined/.test(element.getAttribute('d'))) problems.push(`${name}: invalid path`);
      for(const path of svg.querySelectorAll('[marker-end]')) {
        const id=path.getAttribute('marker-end').match(/^url\(#(.+)\)$/)?.[1];
        const marker=id&&svg.querySelector(`[id="${id}"]`);
        if(!marker||marker.tagName.toLowerCase()!=='marker'||marker.getAttribute('orient')!=='auto') problems.push(`${name}: arrow has no local automatically oriented marker`);
        const length=path.getTotalLength(),end=path.getPointAtLength(length),before=path.getPointAtLength(Math.max(0,length-.5));
        const dx=end.x-before.x,dy=end.y-before.y;
        if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.1) problems.push(`${name}: degenerate arrow tangent`);
        const kind=path.dataset.arrowKind;
        if(kind==='ahead-motion'&&(Math.abs(dx)>.01||dy>=0)) problems.push(`${name}: ahead direction incorrect`);
        if(kind==='astern-motion'&&(Math.abs(dx)>.01||dy<=0)) problems.push(`${name}: astern direction incorrect`);
        if(kind==='ahead-bow-turn'&&(dx<=0||dy<=0)) problems.push(`${name}: bow must turn starboard ahead`);
        if(kind==='astern-bow-turn'&&(dx>=0||dy<=0)) problems.push(`${name}: bow must turn port astern`);
      }
    }
    return problems;
  });
  if(issues.length) throw new Error(issues.join('\n'));
  await mkdir('artifacts',{recursive:true});
  const groups=[[2,3,5,14,15,17,29,38],[4,8,19,21,25,26,27,42]];
  for(let group=0;group<groups.length;group++) {
    const examples=groups[group].map((n,i)=>({lesson:course[n-1],lang:['en','ru','he','ar'][i%4]}));
    await page.setContent(`<style>body{margin:0;background:#f1f3ed;font:18px system-ui;color:#173a4d}main{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px}figure{margin:0;background:#e1e9dd;border-radius:20px;overflow:hidden}figcaption{padding:10px 22px;line-height:1.5}h2{font-size:18px;margin:12px 22px}</style><main>${examples.map(({lesson,lang})=>`<figure><h2>${lesson.id} · ${lang}</h2>${renderTeachingFigure(lesson,lang)}<figcaption dir="${['he','ar'].includes(lang)?'rtl':'ltr'}">${getTeachingFigureCaption(lesson,lang)}</figcaption></figure>`).join('')}</main>`);
    await page.screenshot({path:`artifacts/teaching-figures-${group+1}.png`,fullPage:true});
  }
  for(const lang of ['en','he','ar']) {
    await page.setViewportSize({width:1020,height:720});
    await page.setContent(`<style>body{margin:0;background:#f1f3ed;font:20px system-ui;color:#173a4d}figure{margin:20px;border-radius:20px;background:#e1e9dd;padding:20px}figcaption{line-height:1.6;margin-top:18px}</style><figure>${renderTeachingFigure({id:'sail-29'},lang)}<figcaption dir="${lang==='en'?'ltr':'rtl'}">${getTeachingFigureCaption({id:'sail-29'},lang)}</figcaption></figure>`);
    await page.screenshot({path:`artifacts/teaching-engine-arrows-${lang}.png`,fullPage:true});
  }
  console.log(`${samples.length} localized lesson figures: accessible descriptions, unique IDs, finite geometry, unclipped text, local arrow markers and engine arrow tangents verified. Contact sheets: artifacts/teaching-figures-{1,2}.png. Engine examples: artifacts/teaching-engine-arrows-{en,he,ar}.png`);
} finally {await browser.close();}
