// Shared mini-lab kit: an SVG stage, labelled controls, a plain-English
// readout, a "Try this" checklist and a play bar for time-based labs.
// Drawings never mirror in right-to-left languages; only text direction changes.
// A lab is defined once; staticFigure() renders its starting state as plain SVG
// (print, thumbnails, tests) and mount() makes the same drawing interactive.
import {labText,labLocale} from '../../i18n/labs.js';

export const TOKENS=Object.freeze({
 water:'#d6e5e3',waterLine:'#b5cdcb',ink:'#173a4d',muted:'#58767a',hull:'#f8f7f0',hullLine:'#31505a',
 sail:'#fffdf4',sailLine:'#5b6f73',wind:'#a9700f',windSoft:'#e9b87c',nogo:'#de9f7755',
 drive:'#23824a',side:'#c8641b',keel:'#2f6894',danger:'#b23a2c',ok:'#23824a',port:'#c8352b',starboard:'#2a8a3e',
 dial:'#173946',dialLine:'#8ba1a8',dialText:'#e3eeeb',seabed:'#b59d74',chain:'#46545a',
});
export const RAD=Math.PI/180;
export const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const isRtl=lang=>['he','ar'].includes(labLocale(lang));
/** Keep numbers and bearings left-to-right inside right-to-left sentences. */
export const ltr=value=>`⁦${value}⁩`;
export const round=(value,places=0)=>{const f=10**places;const r=Math.round(value*f)/f;return Object.is(r,-0)?0:r;};
export const pad3=value=>String(Math.round(((value%360)+360)%360)%360).padStart(3,'0');

/** Point on a circle, bearing clockwise from up (north or bow). */
export const polar=(cx,cy,r,bearing)=>({x:cx+Math.sin(bearing*RAD)*r,y:cy-Math.cos(bearing*RAD)*r});

export function svgText(x,y,value,{size=15,fill=TOKENS.ink,anchor='middle',weight=600,lang='en',numeric=false,cls=''}={}){
 const rtl=isRtl(lang)&&!numeric;
 // With direction="rtl" the start of a line is its right edge; keep the box on the same side.
 if(rtl&&anchor!=='middle')anchor=anchor==='start'?'end':'start';
 return `<text x="${round(x,1)}" y="${round(y,1)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl?'rtl':'ltr'}" unicode-bidi="plaintext"${cls?` class="${cls}"`:''}>${esc(value)}</text>`;
}

/** Straight arrow with a drawn head (no shared marker ids between labs). */
export function arrow(x1,y1,x2,y2,{color=TOKENS.ink,width=4,head=12,dash='',part=''}={}){
 const length=Math.hypot(x2-x1,y2-y1);
 if(length<1)return '';
 const ux=(x2-x1)/length,uy=(y2-y1)/length,h=Math.min(head,length*.6);
 const bx=x2-ux*h,by=y2-uy*h,nx=-uy*h*.55,ny=ux*h*.55;
 return `<g${part?` data-lab-part="${part}"`:''}><path d="M${round(x1,1)} ${round(y1,1)}L${round(bx,1)} ${round(by,1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none"${dash?` stroke-dasharray="${dash}"`:''}/><path d="M${round(x2,1)} ${round(y2,1)}L${round(bx+nx,1)} ${round(by+ny,1)}L${round(bx-nx,1)} ${round(by-ny,1)}Z" fill="${color}"/></g>`;
}

/** Pie wedge from bearing a to bearing b (clockwise), centred on cx, cy. */
export function wedge(cx,cy,r,a,b,fill,part=''){
 const p=polar(cx,cy,r,a),q=polar(cx,cy,r,b),large=((b-a+360)%360)>180?1:0;
 return `<path${part?` data-lab-part="${part}"`:''} d="M${cx} ${cy}L${round(p.x,1)} ${round(p.y,1)}A${r} ${r} 0 ${large} 1 ${round(q.x,1)} ${round(q.y,1)}Z" fill="${fill}"/>`;
}

/** Top-view monohull, bow up, centred at 0,0 before transform. */
export function hullTop({x=0,y=0,heading=0,scale=1,fill=TOKENS.hull,stroke=TOKENS.hullLine}={}){
 return `<g transform="translate(${round(x,1)} ${round(y,1)}) rotate(${round(heading,1)}) scale(${scale})" data-lab-part="hull"><path d="M0 -62C-20 -36 -24 2 -21 40C-19 54 -14 60 -10 62H10C14 60 19 54 21 40C24 2 20 -36 0 -62Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/></g>`;
}

export function stage({viewBox,body,title,desc,lang='en',id,cls=''}){
 const locale=labLocale(lang),key=`${id}-${locale}-${++serial}`;
 return `<svg class="teaching-figure lab-svg${cls?` ${cls}`:''}" data-lab-figure="${esc(id)}" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="${key}-t ${key}-d" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,'Segoe UI',sans-serif"><title id="${key}-t">${esc(title)}</title><desc id="${key}-d">${esc(desc)}</desc>${body}</svg>`;
}
let serial=0;

const formatValue=(control,value,t)=>control.format?control.format(value,t):String(value);
const storage={
 read(key){if(!key)return {};try{return JSON.parse(sessionStorage.getItem(key)||'{}')||{};}catch{return {};}},
 write(key,value){if(!key)return;try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}},
};
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * def: {id, viewBox, initial, controls, compute(settings, sim) -> model with
 * a `status`, draw(model, settings, t, history) -> SVG body, readout(model, t),
 * title, describe(model, t), caption, tasks: {key: {label, check(model, settings, ctx)}},
 * loop?: {dt, create(settings), step(sim, dt, settings), done(sim)}, drag?}
 */
export function defineLab(def){
 const settingsFor=overrides=>({...def.initial,...(overrides||{})});
 function picture(settings,lang,sim,history=[]){
  const t=labText(lang),model=def.compute(settings,sim);
  const body=def.draw(model,settings,t,history,lang);
  return {model,t,svg:stage({viewBox:def.viewBox,body,title:t(`${def.id}.title`),desc:def.describe?def.describe(model,t):def.readout(model,t),lang,id:def.id})};
 }
 const initialSim=settings=>def.loop?def.loop.create(settings):undefined;
 return {
  id:def.id,def,
  settingsFor,
  compute:(overrides,sim)=>def.compute(settingsFor(overrides),sim),
  readout(overrides,lang='en'){const settings=settingsFor(overrides);return def.readout(def.compute(settings,initialSim(settings)),labText(lang));},
  caption:(lang='en')=>`${labText(lang)(`${def.id}.caption`)} ${labText(lang)('kit.model')}`,
  taskKeys:()=>Object.keys(def.tasks||{}),
  staticFigure(lang='en',overrides){const settings=settingsFor(overrides);return picture(settings,lang,initialSim(settings)).svg;},
  mount(container,options={}){return mountLab(def,container,options,{settingsFor,picture});},
 };
}

function controlMarkup(def,control,settings,t){
 const label=esc(t(control.label));
 const value=settings[control.key];
 if(control.kind==='choice'){
  return `<fieldset class="lab-choice" data-control="${control.key}"><legend>${label}</legend>${control.options.map((option,i)=>`<label><input type="radio" name="${def.id}-${control.key}-${mountSerial}" value="${i}" ${option.value===value?'checked':''}><span>${esc(t(option.label))}</span></label>`).join('')}</fieldset>`;
 }
 if(control.kind==='toggle'){
  return `<label class="lab-toggle" data-control="${control.key}"><input type="checkbox" ${value?'checked':''}><span>${label}</span></label>`;
 }
 const nudges=(control.nudge||[]).map(step=>`<button type="button" class="lab-nudge" data-nudge="${step}" aria-label="${label} ${step>0?'+':'−'}${Math.abs(step)}"><span dir="ltr">${step>0?'+':'−'}${Math.abs(step)}</span></button>`);
 return `<div class="lab-control" data-control="${control.key}"><label><span>${label}</span><output dir="ltr">${esc(formatValue(control,value,t))}</output></label><div class="lab-range">${nudges.slice(0,1).join('')}<input type="range" dir="ltr" min="${control.min}" max="${control.max}" step="${control.step??1}" value="${value}" aria-label="${label}">${nudges.slice(1).join('')}</div></div>`;
}
let mountSerial=0;

function mountLab(def,container,options,{settingsFor,picture}){
 const lang=options.lang||'en',t=labText(lang),locale=labLocale(lang);
 const settings=settingsFor(options.initial);
 const taskKeys=(options.tasks||Object.keys(def.tasks||{})).filter(key=>def.tasks?.[key]);
 const done=storage.read(options.storageKey);
 mountSerial++;
 const root=document.createElement('div');
 root.className='lab';root.dataset.lab=def.id;root.dataset.noTranslate='';root.lang=locale;root.dir=isRtl(lang)?'rtl':'ltr';
 root.innerHTML=`<div class="lab-stage"></div><p class="lab-readout" data-lab-readout></p><p class="lab-live" aria-live="polite" aria-atomic="true"></p>${def.loop?`<div class="lab-player" role="group" aria-label="${esc(t('kit.controls'))}"><button type="button" class="lab-button" data-player="play"></button><button type="button" class="lab-button" data-player="step">${esc(t('kit.step'))}</button><button type="button" class="lab-button" data-player="restart">${esc(t('kit.restart'))}</button><label class="lab-scrub"><span>${esc(t('kit.time'))}</span><input type="range" dir="ltr" min="0" max="0" step="1" value="0" aria-label="${esc(t('kit.time'))}"><output dir="ltr"></output></label></div>`:''}<div class="lab-controls" role="group" aria-label="${esc(t('kit.controls'))}">${(def.controls||[]).map(control=>controlMarkup(def,control,settings,t)).join('')}</div>${taskKeys.length?`<section class="lab-tasks"><h3>${esc(t('kit.try'))}</h3><ul>${taskKeys.map(key=>`<li data-task="${key}" data-done="${done[key]?'true':'false'}"><span class="lab-tick" aria-hidden="true">${done[key]?'✓':'○'}</span><span>${esc(t(def.tasks[key].label))}</span><span class="lab-sr">${esc(t(done[key]?'kit.done':'kit.notYet'))}</span></li>`).join('')}</ul><p class="lab-note">${esc(t('kit.noCredit'))}</p></section>`:''}`;
 container.replaceChildren(root);
 const stageEl=root.querySelector('.lab-stage'),readoutEl=root.querySelector('[data-lab-readout]'),liveEl=root.querySelector('.lab-live');
 let sim=def.loop?def.loop.create(settings):undefined,history=[],frames=[],scrubIndex=null,playing=false,raf=0,last=0,accumulator=0,liveTimer=0,destroyed=false,model;
 const ctx={initial:{...settings},history:()=>history,events:new Set()};

 function announce(text,now=false){clearTimeout(liveTimer);const write=()=>{liveEl.textContent=text;};if(now)write();else liveTimer=setTimeout(write,450);}
 function checkTasks(){
  // Tasks tick only after the learner has changed something, never on the starting state.
  if(!ctx.events.size)return;
  for(const key of taskKeys){
   if(done[key])continue;
   let passed=false;try{passed=Boolean(def.tasks[key].check(model,settings,ctx));}catch{passed=false;}
   if(!passed)continue;
   done[key]=true;storage.write(options.storageKey,done);
   const item=root.querySelector(`[data-task="${key}"]`);
   item.dataset.done='true';item.querySelector('.lab-tick').textContent='✓';item.querySelector('.lab-sr').textContent=t('kit.done');
   announce(t('kit.taskDone',{task:t(def.tasks[key].label)}),true);
  }
 }
 function paint(){
  const shownModel=scrubIndex===null?undefined:frames[scrubIndex];
  const shownHistory=scrubIndex===null?history:history.slice(0,scrubIndex+1);
  if(shownModel){stageEl.innerHTML=drawFrame(shownModel,shownHistory);model=shownModel;}
  else{const fresh=picture(settings,lang,sim,shownHistory);stageEl.innerHTML=fresh.svg;model=fresh.model;}
  const sentence=def.readout(model,t);
  readoutEl.textContent=sentence;root.dataset.labStatus=model.status;
  for(const control of def.controls||[]){const out=root.querySelector(`[data-control="${control.key}"] output`);if(out)out.value=out.textContent=formatValue(control,settings[control.key],t);}
  if(def.loop){
   const scrub=root.querySelector('.lab-scrub input');scrub.max=String(Math.max(0,frames.length-1));scrub.value=String(scrubIndex??Math.max(0,frames.length-1));
   root.querySelector('.lab-scrub output').textContent=t('kit.seconds',{value:round(model.time??0,1)});
   const play=root.querySelector('[data-player="play"]');play.textContent=t(playing?'kit.pause':'kit.play');play.setAttribute('aria-pressed',String(playing));
  }
  return sentence;
 }
 const drawFrame=(frameModel,frameHistory)=>stage({viewBox:def.viewBox,body:def.draw(frameModel,settings,t,frameHistory,lang),title:t(`${def.id}.title`),desc:def.describe?def.describe(frameModel,t):def.readout(frameModel,t),lang,id:def.id});
 function update({quiet=false}={}){const sentence=paint();if(!quiet)announce(sentence);checkTasks();}
 function record(){const frame=def.compute(settings,sim);frames.push(frame);history.push(frame);if(frames.length>2400){frames.shift();history.shift();}}
 function restart(){sim=def.loop.create(settings);frames=[];history=[];scrubIndex=null;accumulator=0;record();}
 function advance(){def.loop.step(sim,def.loop.dt,settings);record();if(def.loop.done?.(sim))setPlaying(false);}
 function frameLoop(now){
  raf=0;if(destroyed||!playing)return;
  if(!root.isConnected){destroy();return;}
  accumulator+=Math.min(.25,(now-(last||now))/1000)*(def.loop.speed||1);last=now;
  let steps=0;while(accumulator>=def.loop.dt&&playing&&steps<40){advance();accumulator-=def.loop.dt;steps++;}
  update({quiet:true});
  if(playing)raf=requestAnimationFrame(frameLoop);
 }
 function setPlaying(value){
  playing=Boolean(value)&&!destroyed;
  if(playing){if(def.loop.done?.(sim))restart();scrubIndex=null;last=0;if(!raf)raf=requestAnimationFrame(frameLoop);}
  else if(raf){cancelAnimationFrame(raf);raf=0;}
  root.dataset.playing=String(playing);
  const play=root.querySelector('[data-player="play"]');if(play){play.textContent=t(playing?'kit.pause':'kit.play');play.setAttribute('aria-pressed',String(playing));}
  if(!playing)announce(def.readout(def.compute(settings,sim),t));
 }
 const onVisibility=()=>{if(document.hidden&&playing)setPlaying(false);};
 function setValue(control,raw,{reset=true}={}){
  let value=raw;
  if(control.kind!=='choice'&&control.kind!=='toggle'){value=Math.max(control.min,Math.min(control.max,Number(raw)));if(control.wrap)value=((value%control.wrap)+control.wrap)%control.wrap;}
  settings[control.key]=value;
  const input=root.querySelector(`[data-control="${control.key}"] input[type=range]`);if(input&&Number(input.value)!==value)input.value=String(value);
  if(def.loop&&reset&&!control.live){const wasPlaying=playing;setPlaying(false);restart();if(wasPlaying)setPlaying(true);}
  ctx.events.add(`changed:${control.key}`);
  update();
 }
 for(const control of def.controls||[]){
  const el=root.querySelector(`[data-control="${control.key}"]`);
  if(control.kind==='choice')el.addEventListener('change',event=>setValue(control,control.options[Number(event.target.value)].value));
  else if(control.kind==='toggle')el.querySelector('input').addEventListener('change',event=>setValue(control,event.target.checked));
  else{
   el.querySelector('input').addEventListener('input',event=>setValue(control,Number(event.target.value)));
   el.querySelectorAll('[data-nudge]').forEach(button=>button.addEventListener('click',()=>{
    const next=Number(settings[control.key])+Number(button.dataset.nudge);
    setValue(control,control.wrap?((next%control.wrap)+control.wrap)%control.wrap:next);
   }));
  }
 }
 if(def.drag){
  // Drag on the drawing turns an angle control; keyboard users have the slider.
  let dragging=false;
  const toAngle=event=>{
   const svg=stageEl.querySelector('svg');if(!svg)return null;
   const box=svg.getBoundingClientRect(),[vx,vy,vw,vh]=def.viewBox.split(/\s+/).map(Number);
   const x=vx+(event.clientX-box.left)/box.width*vw,y=vy+(event.clientY-box.top)/box.height*vh;
   return Math.atan2(x-def.drag.cx,-(y-def.drag.cy))/RAD;
  };
  const move=event=>{if(!dragging)return;const angle=toAngle(event);if(angle===null)return;const control=def.controls.find(c=>c.key===def.drag.key);const value=def.drag.toValue(angle,settings);setValue(control,Math.round(value/(control.step||1))*(control.step||1));event.preventDefault();};
  stageEl.addEventListener('pointerdown',event=>{dragging=true;stageEl.setPointerCapture?.(event.pointerId);move(event);});
  stageEl.addEventListener('pointermove',move);
  const end=()=>{dragging=false;};stageEl.addEventListener('pointerup',end);stageEl.addEventListener('pointercancel',end);
  stageEl.classList.add('lab-draggable');
 }
 if(def.loop){
  record();
  root.querySelector('[data-player="play"]').addEventListener('click',()=>{ctx.events.add('played');setPlaying(!playing);});
  root.querySelector('[data-player="step"]').addEventListener('click',()=>{setPlaying(false);scrubIndex=null;if(!def.loop.done?.(sim))advance();update();});
  root.querySelector('[data-player="restart"]').addEventListener('click',()=>{const wasPlaying=playing;setPlaying(false);restart();update();if(wasPlaying)setPlaying(true);});
  root.querySelector('.lab-scrub input').addEventListener('input',event=>{setPlaying(false);const index=Number(event.target.value);scrubIndex=index>=frames.length-1?null:index;update();});
  document.addEventListener('visibilitychange',onVisibility);
 }
 function destroy(){
  if(destroyed)return;destroyed=true;playing=false;
  if(raf)cancelAnimationFrame(raf);raf=0;clearTimeout(liveTimer);
  document.removeEventListener('visibilitychange',onVisibility);
  root.dataset.playing='false';
 }
 update({quiet:true});
 if(def.loop)setPlaying(options.autoplay!==false&&!reducedMotion());
 return {root,destroy,get model(){return model;},get playing(){return playing;},settings};
}
