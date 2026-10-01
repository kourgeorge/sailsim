import {practiceConditions} from './practice-conditions.js';
import {translate as t} from '../i18n/runtime.js';
import {angleDifference} from '../physics.js';
import './practice-requirements.css';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valueText=value=>typeof value==='boolean'?(value?'✓':'○'):typeof value==='number'?(Number.isFinite(value)?value.toFixed(1):'—'):t(value);
// These rows come from the same predicates the assessment engine evaluates.
export function updatePracticeRequirements(root,check,state,attempt,paused){
 if(!root)return;
 const rows=practiceConditions(check,state,attempt),allMet=rows.every(row=>row.met);
 const displayRows=rows.filter(row=>!['rode-valid','target-rode-valid','anchor-operation'].includes(row.id));
 const markup=`<table aria-label="${esc(t('Live requirements'))}"><thead><tr><th>${esc(t('Live requirements'))}</th><th>${esc(t('Now'))}</th><th>${esc(t('Target'))}</th></tr></thead><tbody>${displayRows.map(row=>`<tr data-requirement="${esc(row.id)}" data-met="${row.met}"><th scope="row"><span aria-hidden="true">${row.met?'✓':'○'}</span> ${esc(t(row.label))}</th><td><bdi dir="ltr">${esc(typeof row.actual==='number'&&row.unit==='kn'?row.actual.toFixed(2):valueText(row.actual))}${typeof row.actual==='boolean'?'':` ${esc(row.unit||'')}`}</bdi></td><td>${typeof row.target==='boolean'?esc(t('Required')):`<bdi dir="ltr">${esc(valueText(row.target))} ${esc(row.unit||'')}</bdi>`}</td></tr>`).join('')}</tbody></table>`;
 if(root._markup!==markup){root._markup=markup;root.querySelector('.requirement-table').innerHTML=markup;}
 const status=paused?'Simulation paused. Resume to continue the hold.':allMet?'All conditions met. Keep steady.':'Adjust the unmet conditions to start the timer.';
 const notice=root.querySelector('.requirement-notice');if(notice.textContent!==t(status))notice.textContent=t(status);
 const guidance=root.querySelector('.requirement-guidance');let text='';
 if(check.kind==='windAngle'&&!rows.find(row=>row.id==='true-wind-angle')?.met){
  const relative=angleDifference(state.heading,state.windDirection),middle=(check.value[0]+check.value[1])/2;
  const target=(state.windDirection+(relative<0?-middle:middle)+360)%360;
  text=t('Turn gently toward {heading}°, then center the helm.').replace('{heading}',String(Math.round(target)).padStart(3,'0'));
 }
 if(guidance.textContent!==text)guidance.textContent=text;guidance.hidden=!text;root.dataset.holding=String(!paused&&allMet);
}
export const practiceRequirementsMarkup=()=>`<section id="practice-requirements" data-no-translate><div class="requirement-table"></div><p class="requirement-notice" role="status"></p><p class="requirement-guidance" hidden></p></section>`;
