// Deterministic task judging. Only authored fixtures define accepted outcomes;
// translations and the visual workspace never supply answer keys.
export const DECISION_RULES=Object.freeze({maxScore:100,passScore:80,revisionPenalty:5,failedScoreCap:79});
const copy=value=>structuredClone(value);
const weight=(i,n)=>Math.floor(100/n)+(i<100%n?1:0);
export function beginDecision(scenario){return {version:1,id:`${scenario.id}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,scenarioId:scenario.id,lessonId:scenario.lessonId,status:'active',index:0,elapsed:0,values:{},inspected:[],completed:[],events:[],mistakes:0,hints:0,submissions:0,criticalFailure:null,message:null};}
export function tickDecision(attempt,dt){if(attempt?.status==='active'&&Number.isFinite(dt)&&dt>0&&dt<=.25)attempt.elapsed+=dt;}
export function inspectDecision(attempt,scenario,id){const stage=scenario.stages[attempt.index];if(attempt.status!=='active'||!stage?.facts.some(f=>f.id===id))return false;if(!attempt.inspected.includes(id))attempt.inspected.push(id);return true;}
export function setDecisionValue(attempt,scenario,id,value){if(attempt.status!=='active')return false;const field=scenario.stages[attempt.index]?.fields.find(f=>f.id===id);if(!field)return false;if(Array.isArray(value)&&value.length>32)return false;if(typeof value==='string'&&value.length>120)return false;attempt.values[id]=copy(value);attempt.message=null;return true;}
function valid(field,value){
 if(field.type==='number')return (typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(Number(value))&&(field.min===undefined||Number(value)>=field.min)&&(field.max===undefined||Number(value)<=field.max);
 const allowed=new Set((field.options||[]).map(o=>o.id));
 if(field.type==='select')return typeof value==='string'&&allowed.has(value);
 return Array.isArray(value)&&value.length>0&&value.every(v=>typeof v==='string'&&allowed.has(v))&&new Set(value).size===value.length;
}
// Ellipses are closed exclusion areas: a segment touching one is unsafe.
export function routeClear(points,hazards=[]){
 if(!Array.isArray(points)||points.length<2||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return false;
 for(const hazard of hazards){if(!(hazard.rx>0&&hazard.ry>0))return false;for(let i=1;i<points.length;i++){
  const a={x:(points[i-1].x-hazard.x)/hazard.rx,y:(points[i-1].y-hazard.y)/hazard.ry},b={x:(points[i].x-hazard.x)/hazard.rx,y:(points[i].y-hazard.y)/hazard.ry},dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,-(a.x*dx+a.y*dy)/d)):0;
  if(Math.hypot(a.x+t*dx,a.y+t*dy)<=1)return false;
 }}return true;
}
function correct(field,value,stage){
 if(field.type==='number')return Math.abs(Number(value)-field.expected)<=(field.tolerance??.05)+1e-9;
 if(field.type==='select')return value===field.expected;
 if(field.type==='checks')return value.length===field.expected.length&&field.expected.every(v=>value.includes(v));
 if(field.type==='route'){
  const nodes=field.options||[],selected=value.map(id=>nodes.find(n=>n.id===id));
  const start=field.start||stage.scene?.start,finish=field.finish||stage.scene?.finish,hazards=field.hazards||stage.scene?.hazards;
  if(start&&finish&&hazards){
   if(start.id&&nodes.some(n=>n.id===start.id)&&value[0]!==start.id)return false;
   if(finish.id&&nodes.some(n=>n.id===finish.id)&&value.at(-1)!==finish.id)return false;
   const required=field.requiredWaypoints||stage.scene?.requiredWaypoints||[];
   let previous=-1;for(const id of required){const index=value.indexOf(id);if(index<=previous)return false;previous=index;}
   return routeClear([start,...selected,finish],hazards);
  }
 }
 return value.length===field.expected.length&&value.every((v,i)=>v===field.expected[i]);
}
export function decisionScore(attempt,scenario){const earned=attempt.completed.reduce((total,row)=>total+weight(row.index,scenario.stages.length),0),score=Math.max(0,earned-attempt.mistakes*DECISION_RULES.revisionPenalty);return attempt.status==='failed'?Math.min(79,score):score;}
export function submitDecision(attempt,scenario){
 if(attempt.status!=='active')return {kind:'inactive'};
 const stage=scenario.stages[attempt.index],missing=stage.fields.filter(f=>!valid(f,attempt.values[f.id])).map(f=>f.id),unread=(stage.requiredFacts||[]).filter(id=>!attempt.inspected.includes(id));
 if(missing.length||unread.length){attempt.message={kind:'incomplete',fields:missing,facts:unread};return attempt.message;}
 attempt.submissions++;
 const critical=stage.fields.find(f=>(f.criticalValues||[]).some(v=>Array.isArray(attempt.values[f.id])?attempt.values[f.id].includes(v):attempt.values[f.id]===v));
 const wrong=stage.fields.filter(f=>!correct(f,attempt.values[f.id],stage)).map(f=>f.id);
 const event={stageId:stage.id,time:attempt.elapsed,values:copy(attempt.values),inspected:[...attempt.inspected],wrong,kind:critical?'critical':wrong.length?'revision':'complete'};attempt.events.push(event);if(attempt.events.length>120)attempt.events.shift();
 if(critical){attempt.status='failed';attempt.criticalFailure={code:'unsafe-decision',message:stage.retry,fieldId:critical.id};attempt.message={kind:'critical',fields:[critical.id]};return attempt.message;}
 if(wrong.length){attempt.mistakes++;attempt.message={kind:'revision',fields:wrong};return attempt.message;}
 attempt.completed.push({id:stage.id,index:attempt.index,time:attempt.elapsed,values:copy(attempt.values),inspected:[...attempt.inspected],submissions:attempt.submissions});attempt.index++;attempt.values={};attempt.inspected=[];attempt.submissions=0;attempt.message={kind:'complete',stageId:stage.id};
 if(attempt.index===scenario.stages.length){attempt.status=decisionScore(attempt,scenario)>=80?'passed':'failed';if(attempt.status==='failed')attempt.message={kind:'below-score'};}
 return attempt.message;
}
export function endDecision(attempt){if(attempt?.status==='active'){attempt.status='failed';attempt.message={kind:'ended'};}}
export function decisionReport(attempt,scenario){
 return {version:1,id:attempt.id,lessonId:scenario.lessonId,scenarioId:scenario.id,status:attempt.status==='active'?'active':attempt.status,score:decisionScore(attempt,scenario),maxScore:100,elapsed:attempt.elapsed,hints:attempt.hints,assisted:attempt.hints>0,criticalFailure:copy(attempt.criticalFailure),penalties:attempt.mistakes?[{code:'revised-decision',count:attempt.mistakes,points:attempt.mistakes*5}]:[],
  objectives:scenario.stages.map((stage,index)=>{const result=attempt.completed.find(r=>r.id===stage.id),evidence=result||(index===attempt.index?attempt:null);return {id:stage.id,label:stage.goal,status:result?'complete':index===attempt.index?(attempt.status==='active'?'active':'missed'):'upcoming',maxPoints:weight(index,scenario.stages.length),points:result?weight(index,scenario.stages.length):0,attempts:result?.submissions||(index===attempt.index?attempt.submissions:0),completedAt:result?.time??null,evidence:copy(evidence?.values||{}),inspected:[...(evidence?.inspected||[])]};}),
  events:copy(attempt.events),debrief:{reason:attempt.message?.kind||'',summary:attempt.status==='passed'?scenario.stages.at(-1).success:null,practiceTransfer:scenario.limitations}};
}
