import {translate as t} from '../i18n/runtime.js';
import './practice-briefing.css';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=value=>esc(t(value));

// A separate dialog keeps the prepared boat visible. Opening or dismissing it
// never starts an attempt; only its explicit primary action does.
export function createPracticeBriefing({onBegin,onResume,onEnd,onStudy,onClose=()=>{}}){
 const root=document.createElement('dialog');root.id='practice-briefing';root.dataset.noTranslate='true';root.setAttribute('aria-labelledby','practice-briefing-title');root.setAttribute('aria-describedby','practice-briefing-state');document.body.append(root);
 let opener;
 function close(){if(!root.open)return;root.close();onClose();if(opener?.isConnected)opener.focus({preventScroll:true});}
 root.addEventListener('cancel',event=>{event.preventDefault();close();});
 function open({lesson,goals,active=false,score=0,completed=0,preview=false,conditions=''}){
  if(!root.open)opener=document.activeElement;
  root.innerHTML=`<header class="practice-briefing-header"><span class="practice-kind"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2v15H3L12 2Zm3 5 6 10h-6V7ZM3 21h18"/></svg>${label('Simulation practice')}</span><button id="practice-briefing-close" aria-label="${label('Back to simulator')}">×</button></header><div class="practice-briefing-content"><div class="eyebrow">${label(active?'Paused · review your task':'Practice briefing')}</div><h2 id="practice-briefing-title" tabindex="-1">${esc(lesson.title)}</h2><p id="practice-briefing-state" class="practice-ready">${label(active?'Review the task. Your simulation is paused.':'Exercise loaded. The boat is paused; scoring starts when you press Start simulation.')}</p>${conditions?`<p class="practice-conditions">${esc(conditions)}</p>`:''}<h3>${label('Your task')}</h3><p>${label(lesson.practice?'Complete the goals in order. Keep clear of boats and shallow water.':'Interactive scenario. Inspect the scene and commit your decisions to complete each goal.')}</p><ol class="practice-briefing-goals">${goals.map((goal,i)=>`<li ${active&&i===completed?'aria-current="step"':''} class="${i<completed?'complete':''}"><span aria-hidden="true">${i<completed?'✓':i+1}</span><div>${esc(goal.label||goal.goal)}${goal.requiredSeconds?`<small>${label('{seconds} s continuous').replace('{seconds}',goal.requiredSeconds)}</small>`:''}</div></li>`).join('')}</ol><div class="practice-pass"><h3>${label('How you pass')}</h3><p>${label('All goals + 80/100 + no critical failure')}</p>${active?`<p>${label('Live score')}: <bdi dir="ltr">${score} / 100</bdi> · ${label('Goals completed')}: <bdi dir="ltr">${completed} / ${goals.length}</bdi></p>`:''}</div>${preview?`<p class="practice-preview">${label('Preview and practice freely. Earlier lessons must be mastered for course credit.')}</p>`:''}</div><footer class="practice-briefing-actions"><button id="practice-launch" class="training-button primary">▶ ${label(active?'Continue simulation':'Start simulation')}</button><div><button id="practice-briefing-study" class="training-button">${label('Study material')}</button>${active?`<button id="practice-briefing-end" class="training-button">${label('End simulation')}</button>`:''}</div></footer>`;
  root.querySelector('#practice-launch').onclick=()=>{close();active?onResume():onBegin();};
  root.querySelector('#practice-briefing-study').onclick=()=>{close();onStudy();};
  root.querySelector('#practice-briefing-close').onclick=close;
  const end=root.querySelector('#practice-briefing-end');if(end)end.onclick=()=>{close();onEnd();};
  if(!root.open)root.showModal();window.dispatchEvent(new Event('sail-practice-briefing-open'));root.querySelector('#practice-briefing-title').focus({preventScroll:true});
 }
 return {open,close,get isOpen(){return root.open;}};
}
