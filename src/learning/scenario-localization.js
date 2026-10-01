import {decisionScenarios} from './decision-scenarios.js';
export function validateScenarioLocale(pack){
 const required=(object,key,path)=>{if(typeof object?.[key]!=='string'||!object[key].trim())throw new Error(`Missing scenario text: ${path}.${key}`);};
 for(const scenario of decisionScenarios){const tr=pack?.[scenario.id];for(const key of ['title','brief','limitations'])required(tr,key,scenario.id);
  for(const stage of scenario.stages){const st=tr?.stages?.[stage.id];for(const key of ['title','brief','goal','success','retry'])required(st,key,stage.id);
   for(const fact of stage.facts)for(const key of ['label','text'])required(st?.facts?.[fact.id],key,fact.id);
   for(const field of stage.fields){const ft=st?.fields?.[field.id];required(ft,'label',field.id);for(const option of field.options||[])required(ft.options,option.id,field.id);}
  }
 }
 return true;
}
export function localizeScenario(scenario,pack){
 if(!pack)return scenario;const tr=pack[scenario.id];
 return {...scenario,title:tr.title,brief:tr.brief,limitations:tr.limitations,stages:scenario.stages.map(stage=>{const st=tr.stages[stage.id];return {...stage,...Object.fromEntries(['title','brief','goal','success','retry'].map(key=>[key,st[key]])),facts:stage.facts.map(f=>({...f,label:st.facts[f.id].label,text:st.facts[f.id].text})),fields:stage.fields.map(f=>({...f,label:st.fields[f.id].label,options:f.options?.map(o=>({...o,label:st.fields[f.id].options[o.id]}))}))};})};
}
