import {getLanguage,translate as t} from '../i18n/runtime.js';
import {renderTeachingFigure,getTeachingFigureCaption} from './teaching-figures.js';
import {renderLabFigure,labCaption,mountLab} from './labs/index.js';
import './reader.css';
import './labs/labs.css';
import {playbackIcon} from '../activity/playback-icon.js';
import {splitLead,summaryPoints} from './lesson-text.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=s=>esc(t(s));

// Navigation is study progress only. The existing assessment engine owns credit.
export function lessonPages(lesson){
 return [...lesson.concepts.map((text,index)=>({kind:'concept',index,text,figure:lesson.conceptFigures?.[index],lab:lesson.conceptLabs?.[index]})),{kind:'observe'},...(lesson.practice?[{kind:'practice'}]:[]),...lesson.quiz.map((q,index)=>({kind:'question',index,figure:q.figure,lab:q.lab})),{kind:'takeaway'}];
}
export function createLessonReader({onCheck,onPractice,onCourse,onRecord,onNext,onGuide=()=>{},onFigure=()=>{},onChallenge=()=>{},getEvidence,onClose=()=>{}}){
 const root=document.createElement('main');root.id='lesson-reader';root.hidden=true;root.className='lesson-reader';document.querySelector('.topbar').after(root);
 let lesson,pages=[],page=0,answers=[],checked=[],opener=null,returnScroll=0,activeLab=null;
 // A page with a mini-lab mounts it over its static drawing; leaving the page stops it.
 function stopLab(){activeLab?.destroy();activeLab=null;}
 const pageTitle=p=>p.kind==='concept'?'Understand':p.kind==='observe'?'Look for this aboard':p.kind==='practice'?'Your practice checklist':p.kind==='question'?'Check your understanding':'What you learned';
 function remember(){try{sessionStorage.setItem(`sail-reader-${lesson.id}`,String(page));}catch{}}
 function close(){if(root.hidden)return;stopLab();root.hidden=true;document.body.removeAttribute('data-reading');document.querySelector('.workspace').hidden=false;window.scrollTo(0,returnScroll);if(opener?.isConnected)opener.focus({preventScroll:true});onClose();}
 function navigate(next){page=Math.max(0,Math.min(pages.length-1,next));remember();render();window.scrollTo(0,0);root.querySelector('#reader-step-title').focus({preventScroll:true});}
 function render(){
  stopLab();
  const p=pages[page],e=getEvidence(),q=p.kind==='question'?lesson.quiz[p.index]:null;
  const figureLesson=p.lab?{...lesson,lab:p.lab}:p.figure?{...lesson,figure:p.figure}:lesson;
  const sections=[['concept','Understand'],['observe','Observe'],...(lesson.practice?[['practice','Your practice checklist']]:[]),['question','Questions'],['takeaway','Takeaway']];
  let content='',title=label(pageTitle(p)),kicker='';
  if(p.kind==='concept'){
   // The page's first sentence is its headline, so each page leads with one idea.
   const {lead,rest}=splitLead(p.text);kicker=`${label('Understand')} · <bdi dir="ltr">${p.index+1} / ${lesson.concepts.length}</bdi>`;
   if(lead)title=esc(lead);
   content=rest||!lead?`<p class="reader-body">${esc(rest||p.text)}</p>`:'';
  }
  else if(q)kicker=label('Question {number} of {total}').replace('{number}',p.index+1).replace('{total}',lesson.quiz.length);
  else kicker=label(sections.find(([kind])=>kind===p.kind)[1]);
  if(p.kind==='observe')content=`<ol class="reader-observations">${lesson.observe.map((text,i)=>`<li><span aria-hidden="true">${i+1}</span><p>${esc(text)}</p></li>`).join('')}</ol><aside class="reader-mistake"><strong>${label('Common mistake')}</strong><p>${esc(lesson.mistake)}</p></aside>`;
  if(p.kind==='practice')content=`<ol class="reader-observations">${lesson.practice.steps.map((s,i)=>`<li><span aria-hidden="true">${i+1}</span><p>${esc(s.label)}${s.duration?`<small>${label('{seconds} s continuous').replace('{seconds}',s.duration)}</small>`:''}</p></li>`).join('')}</ol><p class="reader-small">${label('Begin practice resets your position, sails, helm, and weather. Timers run only while underway and restart if the condition is lost. Grounding, engine use, early anchoring, or changing conditions ends the attempt.')}</p><button id="begin-assessment" class="reader-button primary">${label(e.trainingActive?'Resume training':'Prepare simulation')}</button>`;
  if(q)content=`<form id="knowledge-form"><fieldset class="knowledge-question"><legend>${esc(q.prompt)}</legend>${q.options.map((text,i)=>`<label><input type="radio" name="q${p.index}" value="${i}" ${answers[p.index]===i?'checked':''} required><span>${esc(text)}</span></label>`).join('')}</fieldset><button class="reader-button primary" type="submit">${label('Check answer')}</button><div id="answer-${p.index}" class="answer-explanation ${checked[p.index]?(answers[p.index]===q.correct?'correct':'incorrect'):''}" role="status" ${checked[p.index]?'':'hidden'}>${checked[p.index]?`${label(answers[p.index]===q.correct?'Correct.':'Review and try again.')} ${esc(q.explanation)}`:''}</div><p id="quiz-result" role="status">${e.knowledge?label('Knowledge check passed.'):''}</p></form>`;
  if(p.kind==='takeaway'){
   const practiced=lesson.practice?e.practice:e.decision,points=summaryPoints(lesson);
   const status=(done,name)=>`<li class="${done?'done':''}"><span aria-hidden="true">${done?'✓':''}</span>${label(name)}</li>`;
   // One clear next step: practice until it is done, then move on.
   const primary=lesson.practice&&!practiced?`<button id="begin-assessment" class="reader-button primary">${label(e.trainingActive?'Resume training':'Prepare simulation')}</button>`:`<button id="reader-next-lesson" class="reader-button primary">${label('Browse next lesson →')}</button>`;
   const secondary=lesson.practice&&practiced?`<button id="begin-assessment" class="reader-link">${label(e.trainingActive?'Resume training':'Prepare simulation')}</button>`:'';
   content=`${points.length?`<ul class="reader-summary">${points.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:''}${lesson.genericTransfer?'':`<aside class="reader-transfer"><strong>${label('Take this onto the water')}</strong><p>${esc(lesson.transfer)}</p></aside>`}<ul class="reader-evidence">${status(e.knowledge,'Knowledge check')}${status(practiced,lesson.practice?'Live boat handling':'Interactive seamanship')}</ul>${lesson.practice&&e.practice?`<aside class="reader-mistake"><strong>${label('Practice debrief')}</strong><p>${esc(lesson.practice.debrief)}</p></aside>`:''}<div class="reader-actions">${primary}${secondary}<button id="reader-record" class="reader-link">${label('My course record')}</button></div><p class="reader-small">${label('Simulator achievement is a study record, not a sailing qualification. Learn physical procedures and local rules with a qualified instructor.')}</p>`;
  }
  if(lesson.challengeId)content+=`<div class="reader-actions"><button id="reader-wind-exercise" class="reader-button">${label('Apparent Wind Lab')} ↗</button></div>`;
  const sources=lesson.rules?.length?`<p class="reader-small reader-rule-source"><strong>${label('Source material')}</strong> · <bdi dir="ltr">COLREGs ${lesson.rules.join(', ')}</bdi><br><a href="https://www.navcen.uscg.gov/navigation-rules-amalgamated" target="_blank" rel="noopener noreferrer">${label('Open official source')} ↗</a></p>`:'';
  const heading=`<h2 id="reader-step-title" tabindex="-1" class="${p.kind==='concept'&&title!==label('Understand')?'reader-lead':''}">${title}</h2>`;
  // The strip shows every section, sized by its pages, filled up to the current page.
  const strip=sections.map(([kind,name])=>{const own=pages.map((x,i)=>x.kind===kind?i:-1).filter(i=>i>=0),seen=own.filter(i=>i<=page).length;return `<button data-reader-section="${kind}" style="flex-grow:${own.length}" ${p.kind===kind?'aria-current="step"':''} class="${seen===own.length&&p.kind!==kind?'done':''}"><span class="reader-strip-bar"><span style="width:${100*seen/own.length}%"></span></span><span class="reader-strip-label">${label(name)}</span></button>`;}).join('');
  root.innerHTML=`<div class="reader-shell"><header class="reader-bar"><button id="reader-close" class="reader-button reader-exit"><span aria-hidden="true" class="reader-exit-arrow">←</span> ${label('Exit')}</button><div class="reader-heading"><div class="eyebrow">${label('LESSON')} ${Number(lesson.id.split('-')[1])} · ${lesson.minutes} ${label('MIN')}<span class="reader-paused"> · ${label('Text lesson')} · ${label('Read and explore. Simulation is paused.')}</span></div><h1>${esc(lesson.title)}</h1></div><div class="reader-bar-actions"><button id="reader-course" class="reader-button">${label('Course')}</button><button id="reader-start-training" class="reader-button primary">${playbackIcon()} ${label(e.trainingActive?'Resume training':'Start training')}</button></div></header><nav class="reader-sections" aria-label="${label('Lesson sections')}">${strip}</nav><div class="reader-layout"><figure class="reader-figure${p.lab?' reader-lab':''}">${p.lab?`<div class="lab-host">${renderLabFigure(p.lab,getLanguage())}</div>`:renderTeachingFigure(figureLesson,getLanguage())}<figcaption>${esc(p.lab?labCaption(p.lab,getLanguage()):getTeachingFigureCaption(figureLesson,getLanguage()))}</figcaption><button id="reader-enlarge" class="reader-button">${label('Enlarge diagram')}</button></figure><article class="reader-page" data-page-kind="${p.kind}"><div class="reader-page-kicker">${kicker}</div>${p.kind==='concept'?`<div class="reader-concept">${heading}${content}</div>`:heading+content}${sources}<div class="reader-topic-action"><button id="reader-guide" class="reader-link">${label('Explore this topic')} →</button></div></article></div><footer class="reader-navigation"><button id="reader-back" class="reader-button" ${page===0?'disabled':''}>${label('Back')}</button><div class="reader-progress" dir="ltr" aria-label="${label('Reading progress')}">${page+1} / ${pages.length}</div><button id="reader-next" class="reader-button primary">${label(page===pages.length-1?'Exit':q&&!checked[p.index]?'Skip for now':'Continue')}</button></footer></div>`;
  root.querySelector('#reader-start-training').onclick=()=>{close();onPractice();};root.querySelector('#reader-close').onclick=close;root.querySelector('#reader-course').onclick=()=>{close();onCourse();};root.querySelector('#reader-guide').onclick=()=>onGuide(lesson);root.querySelector('#reader-enlarge').onclick=()=>onFigure(figureLesson);
  if(p.lab)activeLab=mountLab(root.querySelector('.lab-host'),p.lab,{lang:getLanguage(),lessonId:lesson.id});
  root.querySelectorAll('[data-reader-section]').forEach(b=>b.onclick=()=>navigate(pages.findIndex(x=>x.kind===b.dataset.readerSection)));
  const windExercise=root.querySelector('#reader-wind-exercise');if(windExercise)windExercise.onclick=()=>{close();onChallenge(lesson.challengeId);};
  root.querySelector('#reader-back').onclick=()=>navigate(page-1);root.querySelector('#reader-next').onclick=()=>page===pages.length-1?close():navigate(page+1);
  if(root.querySelector('#begin-assessment'))root.querySelector('#begin-assessment').onclick=()=>{close();onPractice();};
  if(root.querySelector('#reader-record'))root.querySelector('#reader-record').onclick=()=>{close();onRecord();};
  if(root.querySelector('#reader-next-lesson'))root.querySelector('#reader-next-lesson').onclick=onNext;
  if(q){const form=root.querySelector('form');form.onchange=event=>{answers[p.index]=Number(event.target.value);checked[p.index]=false;root.querySelector(`#answer-${p.index}`).hidden=true;};form.onsubmit=event=>{event.preventDefault();const value=new FormData(form).get(`q${p.index}`);if(value===null)return;answers[p.index]=Number(value);checked[p.index]=true;const result=onCheck(answers.map((a,i)=>checked[i]?a:null),p.index);render();const feedback=root.querySelector(`#answer-${p.index}`);feedback.tabIndex=-1;feedback.focus({preventScroll:true});feedback.scrollIntoView({block:'nearest',behavior:'smooth'});if(result?.complete)root.querySelector('#quiz-result').textContent=t(result.correct?'Knowledge check passed.':'Review the explanations, change your answers, and check again.');};}
 }
 return {get isOpen(){return !root.hidden;},close,open(value){opener=root.hidden?document.activeElement:opener;if(root.hidden)returnScroll=window.scrollY;lesson=value;pages=lessonPages(lesson);answers=lesson.quiz.map(()=>null);checked=lesson.quiz.map(()=>false);try{const saved=Number(sessionStorage.getItem(`sail-reader-${lesson.id}`));page=Number.isInteger(saved)?Math.max(0,Math.min(pages.length-1,saved)):0;}catch{page=0;}document.querySelector('#modal').close();document.querySelector('.workspace').hidden=true;root.hidden=false;document.body.dataset.reading='true';window.dispatchEvent(new Event('sail-reader-open'));render();window.scrollTo(0,0);root.querySelector('#reader-step-title').focus({preventScroll:true});}};
}
