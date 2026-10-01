import {lessons,modules} from './curriculum.js';
import {STORAGE_KEY,restoreProgress,recordFor,masteredIds,lessonReady,checkKnowledge,beginAttempt,advanceAttempt,invalidateAttempt,recordEvent,useHint,coachingTip} from './engine.js';
import './learning.css';
import {createLessonReader} from './reader.js';
import {levelFor,COURSE_LEVELS} from './levels.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createLearning({getState,resetScenario,openModal,toast,onSelect,getMode,openManeuvers,openGuide,openFigure}){
 let progress;try{progress=restoreProgress(localStorage.getItem(STORAGE_KEY));}catch{progress=restoreProgress(null);}
 let selected=lessons.findIndex(l=>l.id===progress.selected),attempt=null,lastStatus='',lastCheckpoint=-1,saveErrorShown=false;
 const current=()=>lessons[selected];
 function save(){progress.selected=current().id;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{if(!saveErrorShown){toast('Browser storage is unavailable. Keep this tab open and export your course record.');saveErrorShown=true;}}}
 function completed(){return masteredIds(progress);}
 function renderLibrary(){
  const mastered=completed();$('#progress-label').textContent=`${mastered.size} / ${lessons.length}`;$('#progress-fill').style.width=`${mastered.size/lessons.length*100}%`;
  $('#lessons').innerHTML=modules.map((m,mi)=>{const group=lessons.filter(l=>l.module===m.id);return `<details class="course-module" ${current().module===m.id?'open':''}><summary><span>${String(mi+1).padStart(2,'0')} ${esc(m.title)}</span><small dir="ltr">${group.filter(l=>mastered.has(l.id)).length}/${group.length}</small></summary>${group.map(l=>{const i=lessons.indexOf(l),done=mastered.has(l.id);return `<button class="lesson-row ${selected===i&&getMode()==='learn'?'current':''} ${done?'complete':''}" data-course-lesson="${i}" ${selected===i?'aria-current="step"':''}><span class="lesson-index">${done?'✓':String(i+1).padStart(2,'0')}</span><span><strong>${esc(l.title)}</strong><small>${l.practice?'SAILING PRACTICE':'KNOWLEDGE'} · ${l.minutes} MIN${!lessonReady(progress,l)?' · PREVIEW':''}</small></span></button>`;}).join('')}</details>`;}).join('');
  document.querySelectorAll('[data-course-lesson]').forEach(b=>b.onclick=()=>select(+b.dataset.courseLesson));
 }
 function select(index){reader.close();cancel('Lesson changed. Restart practice when you return.');selected=Math.max(0,Math.min(lessons.length-1,index));attempt=null;save();onSelect(selected);renderLibrary();renderCard();}
 function renderCard(){
  const l=current(),r=recordFor(progress,l.id),mastered=completed().has(l.id),active=attempt?.status==='active';
  $('#card-eyebrow').textContent=`${modules.find(m=>m.id===l.module).title.toUpperCase()} · ${l.minutes} MIN`;
  $('#card-title').textContent=active?'Your live practice':mastered?'Lesson mastered in simulation':l.title;
  $('#card-body').textContent=active?'Complete each checkpoint in order. Conditions are fixed for this attempt.':l.concepts[0];
  $('#objective-check').textContent=mastered?'✓':active?'◉':'○';
  $('#objective-text').textContent=attempt?.status==='invalid'?attempt.message:attempt?.status==='passed'?'Practice passed. Complete the knowledge check to earn mastery.':active?l.practice.steps[attempt.index].label:!lessonReady(progress,l)?'Preview and practice freely. Earlier lessons must be mastered for course credit.':l.practice?(r.practice?'Practice evidence saved. Complete the knowledge check.':'Read the briefing, then begin an assessed practice.'):'Read the briefing, then answer both knowledge questions.';
  let panel=$('#training-actions');if(!panel){panel=document.createElement('div');panel.id='training-actions';$('.lesson-copy').append(panel);}panel.hidden=getMode()!=='learn';
  panel.innerHTML=`<div class="training-actions"><button id="lesson-briefing" class="training-button">${active?'Briefing':'Open lesson'}</button>${l.practice?`<button id="practice-start" class="training-button primary">${active?'Restart':r.practice?'Practice again':'Begin practice'}</button>`:''}<button id="course-library" class="training-button">Course</button></div>${active?`<div class="checkpoint-progress"><div id="checkpoint-fill"></div></div><div class="checkpoint-meta"><span id="checkpoint-status"></span><button id="practice-hint">Show hint</button></div><p id="practice-tip" hidden></p>`:''}`;
  $('#lesson-briefing').onclick=briefing;$('#course-library').onclick=libraryModal;if($('#practice-start'))$('#practice-start').onclick=()=>active?start():briefing();
  if($('#practice-hint'))$('#practice-hint').onclick=()=>{useHint(attempt,progress);$('#practice-tip').hidden=false;$('#practice-tip').textContent=coachingTip(l,attempt,getState());save();};
  $('#next-lesson').hidden=selected===lessons.length-1;$('#next-lesson').setAttribute('aria-label','Browse next lesson (does not award credit)');
  tickPanel();
 }
 function start(){
  reader.close();cancel('Practice restarted.');const l=current();if(!l.practice)return;
  resetScenario(l.practice.setup);attempt=beginAttempt(l,getState(),progress);lastStatus='active';lastCheckpoint=0;save();if($('#modal').open)$('#modal').close();renderCard();toast('Practice started. Complete the ordered checklist; changing modes or conditions ends this attempt.');
 }
 const reader=createLessonReader({
  onCheck:(answers,index)=>{if(answers[index]!==current().quiz[index].correct)recordFor(progress,current().id).wrongAnswers++;const result=checkKnowledge(progress,current(),answers,{countWrongAnswers:false});save();if(result.complete){renderLibrary();renderCard();}return result;},
  onPractice:start,onCourse:libraryModal,onRecord:recordModal,
  onNext:()=>{select(Math.min(selected+1,lessons.length-1));briefing();},
  onGuide:openGuide,onFigure:openFigure,getEvidence:()=>({...recordFor(progress,current().id),ready:lessonReady(progress,current()),mastered:completed().has(current().id)})
 });
 function briefing(){reader.open(current());}
 function libraryModal(){
  reader.close();const mastered=completed();openModal(`<div class="eyebrow">YOUR SAILING SCHOOL</div><h2>From first principles to first passage.</h2><p>${lessons.length} lessons · ${modules.length} modules · ${lessons.filter(l=>l.practice).length} practical exercises. Study any lesson; earn mastery in sequence.</p><div class="training-actions"><button id="resume-course" class="training-button primary">Resume next unmastered lesson</button><button id="view-record" class="training-button">My record</button><button id="open-maneuvers" class="training-button">Maneuvering lab</button></div><div class="course-levels">${COURSE_LEVELS.map(level=>`<button data-level="${level.id}" class="training-button"><strong>${level.title}</strong><span dir="ltr">${level.range}</span><small>${level.description}</small></button>`).join('')}</div><p class="training-notice">Study levels follow common training themes. Licensing and ICC requirements depend on the jurisdiction and vessel.</p><div class="course-library">${modules.map((m,mi)=>`<section data-course-level="${levelFor(lessons.find(l=>l.module===m.id)).id}"><div class="eyebrow">${levelFor(lessons.find(l=>l.module===m.id)).title}</div><h3>${mi+1}. ${esc(m.title)}</h3><p>${esc(m.outcome)}</p>${lessons.filter(l=>l.module===m.id).map(l=>`<button data-library-lesson="${lessons.indexOf(l)}"><span>${mastered.has(l.id)?'✓':'○'} ${esc(l.title)}</span><small>${l.practice?'Practice + quiz':'Knowledge check'}</small></button>`).join('')}</section>`).join('')}</div><p class="training-notice">Model-based practice supports supervised sailing instruction. It does not assess real line loads, crew coordination, traffic interaction, or casualty recovery.</p>`);
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-course-level]').forEach(section=>section.hidden=section.dataset.courseLevel!==b.dataset.level);document.querySelectorAll('[data-level]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===b)));});
  document.querySelectorAll('[data-library-lesson]').forEach(b=>b.onclick=()=>{select(+b.dataset.libraryLesson);briefing();});$('#resume-course').onclick=()=>{select(Math.max(0,lessons.findIndex(l=>!mastered.has(l.id))));briefing();};$('#view-record').onclick=recordModal;$('#open-maneuvers').onclick=openManeuvers;
 }
 function recordModal(){
  reader.close();const mastered=completed();openModal(`<div class="eyebrow">YOUR LEARNING LOG</div><h2>${mastered.size} of ${lessons.length} lessons mastered.</h2><p>Saved in this browser. Practice attempts and hints help identify useful review; they do not reduce your credit. An interrupted practice must restart.</p><button id="export-record" class="training-button primary">Export course record</button><div class="record-table"><table><thead><tr><th>Lesson</th><th>Evidence</th><th>Attempts / hints</th></tr></thead><tbody>${lessons.map(l=>{const r=recordFor(progress,l.id);return `<tr><td><button data-review="${lessons.indexOf(l)}">${esc(l.title)}</button></td><td>${mastered.has(l.id)?'Mastered':r.knowledge||r.practice?'In progress':'Not started'}<small>${r.knowledge?'✓ Quiz':'○ Quiz'}${l.practice?` · ${r.practice?'✓':'○'} Practice`:''}</small></td><td>${r.attempts} / ${r.hints}${r.wrongAnswers?`<small>${r.wrongAnswers} revised answers</small>`:''}</td></tr>`;}).join('')}</tbody></table></div><p class="training-notice">This is a self-study record, not a certificate of sailing competence.</p>`);
  document.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>{select(+b.dataset.review);briefing();});$('#export-record').onclick=()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),notice:'Self-study record; not a sailing qualification',...progress},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='sail-learning-record.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 }
 function cancel(reason){if(attempt?.status==='active'){invalidateAttempt(attempt,progress,reason);save();}if($('#training-actions'))$('#training-actions').hidden=getMode()!=='learn';}
 function event(type,value){recordEvent(attempt,type,value);}
 function tickPanel(){if(attempt?.status!=='active'||!$('#checkpoint-status'))return;const s=current().practice.steps[attempt.index];$('#checkpoint-status').textContent=`Step ${attempt.index+1}/${current().practice.steps.length}${s.duration?` · ${attempt.held.toFixed(1)} / ${s.duration}s`:''}`;$('#checkpoint-fill').style.width=`${s.duration?Math.min(100,attempt.held/s.duration*100):0}%`;if($('#practice-tip')&&!$('#practice-tip').hidden)$('#practice-tip').textContent=coachingTip(current(),attempt,getState());}
 function tick(dt){if(getMode()!=='learn'||attempt?.status!=='active')return;advanceAttempt(attempt,current(),getState(),dt,progress);if(lastStatus!==attempt.status||lastCheckpoint!==attempt.index){lastStatus=attempt.status;lastCheckpoint=attempt.index;save();renderLibrary();renderCard();if(attempt.status==='passed'){toast('Practical exercise passed. Open the lesson for your debrief and knowledge check.');}else if(attempt.status==='invalid')toast(attempt.message);else toast(`Checkpoint complete. ${current().practice.steps[attempt.index].label}`);}tickPanel();}
 function refresh(){renderLibrary();if(getMode()==='learn')renderCard();else if($('#training-actions'))$('#training-actions').hidden=true;}
 return {get reading(){return reader.isOpen;},closeReader:reader.close,get selected(){return selected;},get active(){return attempt?.status==='active';},current,select,refresh,briefing,libraryModal,tick,event,cancel};
}
