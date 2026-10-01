import {activityState} from './state.js';
import {translate as t} from '../i18n/runtime.js';
import './activity.css';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createActivityStatus({getContext,onStart,onPause,onResume}){
 const root=document.createElement('section');root.id='activity-status';root.className='activity-status';root.setAttribute('aria-label',t('Simulation status'));root.dataset.noTranslate='true';document.querySelector('.topbar').after(root);
 let previous='';
 function update(){const state=activityState(getContext()),key=JSON.stringify(state);if(key===previous)return;previous=key;root.dataset.state=state.id;root.dataset.tone=state.tone;document.body.dataset.activity=state.id;
  root.innerHTML=`<div class="activity-symbol" aria-hidden="true">${state.tone==='running'?'●':state.tone==='study'?'▤':state.tone==='review'?'≡':state.tone==='ready'?'○':'Ⅱ'}</div><div class="activity-copy" role="status"><strong>${esc(t(state.label))}</strong><span>${esc(t(state.message))}</span></div>${state.action?`<button id="activity-action" type="button">${state.command==='start'||state.command==='resume'?'▶ ':''}${esc(t(state.action))}</button>`:''}`;
  const button=root.querySelector('button');if(button)button.onclick=()=>{if(state.command==='start')onStart();else if(state.command==='pause')onPause();else onResume();update();};
 }
 update();return {update};
}
