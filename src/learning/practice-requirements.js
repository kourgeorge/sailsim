import {practiceConditions,practiceHeadingTarget} from './practice-conditions.js';
import {translate as t} from '../i18n/runtime.js';
import './practice-requirements.css';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valueText=value=>typeof value==='boolean'?(value?'✓':'○'):typeof value==='number'?(Number.isFinite(value)?value.toFixed(1):'—'):t(value);
const notices=['Adjust the unmet conditions to start the timer.','All conditions met. Keep steady.','Simulation paused. Resume to continue the hold.'];
const measurement=(value,unit)=>`${typeof value==='number'&&unit==='kn'?value.toFixed(2):valueText(value)}${typeof value==='boolean'||!unit?'':` ${unit}`}`;
const setText=(element,text)=>{if(element.textContent!==text)element.textContent=text;};
// These rows come from the same predicates the assessment engine evaluates.
export function updatePracticeRequirements(root,check,state,attempt,paused){
 if(!root)return;
 const rows=practiceConditions(check,state,attempt),allMet=rows.every(row=>row.met);
 const displayRows=rows.filter(row=>!['rode-valid','target-rode-valid','anchor-operation'].includes(row.id));
 // Keep the rows mounted while readings change; only a new goal replaces them.
 const structure=JSON.stringify(displayRows.map(({id,label})=>[id,t(label)]));
 if(root._structure!==structure){
  root._structure=structure;
  root.querySelector('.requirement-table').innerHTML=`<table aria-label="${esc(t('Live requirements'))}"><caption>${esc(t('Live requirements'))}</caption><colgroup><col class="requirement-label-column"><col class="requirement-now-column"><col class="requirement-target-column"></colgroup><thead><tr><th>${esc(t('Live requirements'))}</th><th>${esc(t('Now'))}</th><th>${esc(t('Target'))}</th></tr></thead><tbody>${displayRows.map(row=>`<tr data-requirement="${esc(row.id)}"><th scope="row"><span class="requirement-marker" aria-hidden="true"></span> ${esc(t(row.label))}</th><td><span class="requirement-cell-label" aria-hidden="true">${esc(t('Now'))}</span><bdi class="requirement-actual" dir="ltr"></bdi></td><td><span class="requirement-cell-label" aria-hidden="true">${esc(t('Target'))}</span><bdi class="requirement-target"></bdi></td></tr>`).join('')}</tbody></table>`;
  root._rows=[...root.querySelectorAll('tbody tr')].map(element=>({element,marker:element.querySelector('.requirement-marker'),actual:element.querySelector('.requirement-actual'),target:element.querySelector('.requirement-target')}));
 }
 displayRows.forEach((row,index)=>{
  const cells=root._rows[index];cells.element.dataset.met=String(row.met);
  setText(cells.marker,row.met?'✓':'○');setText(cells.actual,measurement(row.actual,row.unit));
  setText(cells.target,typeof row.target==='boolean'?t('Required'):`${valueText(row.target)}${row.unit?` ${row.unit}`:''}`);
  cells.target.dir=typeof row.target==='boolean'?'auto':'ltr';
 });
 const status=notices[paused?2:allMet?1:0];
 const notice=root.querySelector('.requirement-notice');if(notice.textContent!==t(status))notice.textContent=t(status);
 const guidance=root.querySelector('.requirement-guidance');
 const target=practiceHeadingTarget(check,state);
 guidance.hidden=check?.kind!=='windAngle';
 if(!guidance.hidden){
  const heading=String(Math.round(target??0)).padStart(3,'0');
  const text=esc(t('Turn gently toward {heading}°, then center the helm.')).replace('{heading}',`<bdi dir="ltr">${heading}</bdi>`);
  if(guidance.innerHTML!==text)guidance.innerHTML=text;
  guidance.classList.toggle('is-inactive',target===null||Boolean(rows.find(row=>row.id==='true-wind-angle')?.met));
 }
 root.dataset.holding=String(!paused&&allMet);
}
export const practiceRequirementsMarkup=()=>`<section id="practice-requirements" data-no-translate><div class="requirement-table"></div><div class="requirement-notices"><p class="requirement-notice" role="status"></p>${notices.map(text=>`<p class="requirement-notice-reserve" aria-hidden="true">${esc(t(text))}</p>`).join('')}</div><p class="requirement-guidance" hidden></p></section>`;
