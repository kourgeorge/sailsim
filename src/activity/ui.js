import {activityState} from './state.js';
import {translate as t} from '../i18n/runtime.js';
import './activity.css';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createActivityStatus({getContext,onStart,onPause,onResume}){
 const root=document.createElement('section');root.id='activity-status';root.className='activity-status';root.setAttribute('aria-label',t('Simulation status'));root.dataset.noTranslate='true';document.querySelector('.topbar .brand').after(root);
 let previous='';
 function update(){const state=activityState(getContext()),key=JSON.stringify(state);if(key===previous)return;previous=key;root.dataset.state=state.id;root.dataset.tone=state.tone;root.title=t(state.message);document.body.dataset.activity=state.id;const names={ready:'Ready',study:'Study material','scenario-running':'Scenario active','training-running':'In simulation','training-paused':'Paused','free-running':'Free sailing','free-paused':'Paused',review:'Review'};const action=state.command==='pause'?'Pause':state.command==='resume'||state.action==='Resume training'?'Resume':'Start';
  root.innerHTML=`<div class="activity-symbol" aria-hidden="true">${state.tone==='running'?'●':state.tone==='study'?'▤':state.tone==='review'?'≡':state.tone==='ready'?'○':'Ⅱ'}</div><div class="activity-copy" role="status"><strong>${esc(t(names[state.id]))}</strong><span>${esc(t(state.message))}</span></div>${state.action?`<button id="activity-action" type="button" aria-label="${esc(t(state.action))}" title="${esc(t(state.action))}"><svg viewBox="0 0 12 12" aria-hidden="true">${state.command==='pause'?'<path d="M2 1h3v10H2zm5 0h3v10H7z"/>':'<path d="m3 1 8 5-8 5z"/>'}</svg><span>${esc(t(action))}</span></button>`:''}`;
  const button=root.querySelector('button');if(button)button.onclick=()=>{if(state.command==='start')onStart();else if(state.command==='pause')onPause();else onResume();update();};
 }
 update();return {update};
}
