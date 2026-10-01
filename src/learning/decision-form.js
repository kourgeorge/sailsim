import {submitDecision} from './decision-engine.js';

export function decisionFormGuidance(stage){
 const ids=new Set(stage.fields.map(f=>f.id));
 if(ids.has('apparentSpeed'))return {submitLabel:'Check answer',instruction:ids.has('source')?
  'Enter apparent wind speed as zero or a positive number. Choose where the wind comes from, then press Check answer.':ids.has('relative')?
  'Enter apparent wind speed as zero or a positive number. Choose its direction relative to the bow, then press Check answer.':
  'Enter apparent wind speed as zero or a positive number. Choose the wind reference used for sail trim, then press Check answer.'};
 if(stage.fields.some(f=>f.type==='number'))return {submitLabel:'Check answer',instruction:'Enter the requested numbers and choices below, then press Check answer.'};
 if(stage.fields.some(f=>f.type==='route'))return {submitLabel:'Commit actions',instruction:'Add the route waypoints in order, then press Commit actions.'};
 if(stage.fields.some(f=>f.type==='order'))return {submitLabel:'Commit actions',instruction:'Add actions in order. Use the arrows to rearrange them, then press Commit actions.'};
 return {submitLabel:'Commit actions',instruction:'Select your actions below, then press Commit actions.'};
}

export const decisionNumberMinimum=field=>field.min??(field.id==='apparentSpeed'?0:undefined);
export function decisionRequirementStatus(stage,attempt){
 const required=stage.requiredFacts||[],unread=required.filter(id=>!attempt.inspected.includes(id)).map(id=>stage.facts.find(f=>f.id===id)).filter(Boolean);
 const missing=(attempt.message?.fields||[]).map(id=>stage.fields.find(f=>f.id===id)).filter(Boolean);
 return {total:required.length,read:required.length-unread.length,unread,missing};
}
export function decisionDraftErrors(stage,values){
 return stage.fields.filter(f=>f.type==='number').flatMap(field=>{
  const raw=values[field.id],minimum=decisionNumberMinimum(field);
  const usable=(typeof raw==='number'||typeof raw==='string'&&raw.trim()!=='')&&Number.isFinite(Number(raw));
  let key,params={};
  if(field.id==='apparentSpeed'&&(!usable||Number(raw)<0))key='Wind speed must be zero or a positive number. Choose the direction separately.';
  else if(!usable)key='Enter a valid number.';
  else if(minimum!==undefined&&Number(raw)<minimum){key='Enter a number of at least {min}.';params={min:minimum};}
  else if(field.max!==undefined&&Number(raw)>field.max){key='Enter a number no greater than {max}.';params={max:field.max};}
  return key?[{fieldId:field.id,key,params}]:[];
 });
}

// Form validation never reaches the assessment engine. Valid answers retain
// every existing rubric, tolerance, inspection requirement and revision cost.
export function submitDecisionForm(attempt,scenario){
 if(attempt.status!=='active')return {kind:'inactive'};
 const errors=decisionDraftErrors(scenario.stages[attempt.index],attempt.values);
 if(errors.length){attempt.message={kind:'invalid',fields:errors.map(e=>e.fieldId),errors};return attempt.message;}
 return submitDecision(attempt,scenario);
}
