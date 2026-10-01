import {translate as t} from '../i18n/runtime.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function decisionDebriefReason(report,scenario){
 if(report.criticalFailure)return `${t('Critical safety decision')}. ${scenario.stages[report.objectives.findIndex(o=>o.status!=='complete')]?.retry||''}`;
 if(report.debrief.reason==='ended')return t('Training ended before all goals were achieved.');
 if(report.debrief.reason==='below-score')return t('All goals completed; the score must also reach 80.');
 return report.status==='passed'?scenario.stages.at(-1).success:t('Training not passed');
}
export function decisionEvidenceMarkup(report,scenario){return report.objectives.map((row,i)=>{const stage=scenario.stages[i];return `<li><strong>${row.status==='complete'?'✓':'○'} ${esc(stage.goal)}</strong><span dir="ltr">${row.points} / ${row.maxPoints}</span><details><summary>${esc(t('Your recorded actions'))}</summary>${stage.fields.filter(f=>Object.hasOwn(row.evidence,f.id)).map(field=>{const value=row.evidence[field.id],format=v=>field.options?.find(o=>o.id===v)?.label??v;return `<p><strong>${esc(field.label)}:</strong> ${esc(Array.isArray(value)?value.map(format).join(' → '):format(value))} ${field.unit?esc(field.unit):''}</p>`;}).join('')||`<p>${esc(t('Not completed'))}</p>`}<p>${esc(t('Required reports'))}: ${row.inspected.length} / ${stage.requiredFacts.length}</p></details></li>`;}).join('');}
