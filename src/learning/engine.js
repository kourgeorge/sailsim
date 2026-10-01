import { lessons } from './curriculum.js';

export const STORAGE_KEY='sail-training-v1';
const angle=(a,b)=>((a-b+540)%360)-180;
const count=v=>Number.isSafeInteger(v)&&v>=0?Math.min(v,100000):0;
const blank=()=>({version:1,selected:lessons[0].id,records:{}});
/** Accept only known lesson ids and typed evidence. Old six-click progress cannot become credit. */
export function restoreProgress(raw){
 let value;try{value=typeof raw==='string'?JSON.parse(raw):raw;}catch{return blank();}
 const result=blank();if(!value||value.version!==1||!value.records||typeof value.records!=='object')return result;
 if(lessons.some(l=>l.id===value.selected))result.selected=value.selected;
 for(const l of lessons){const r=value.records[l.id];if(!r||typeof r!=='object')continue;
  const practice=r.practice===true&&count(r.attempts)>0;
  result.records[l.id]={practice,knowledge:r.knowledge===true,attempts:count(r.attempts),hints:count(r.hints),wrongAnswers:count(r.wrongAnswers),lastResult:typeof r.lastResult==='string'?r.lastResult.slice(0,240):'',passedAt:typeof r.passedAt==='string'&&Number.isFinite(Date.parse(r.passedAt))?r.passedAt:null};
 }
 return result;
}
export function recordFor(progress,id){return progress.records[id]??(progress.records[id]={practice:false,knowledge:false,attempts:0,hints:0,wrongAnswers:0,lastResult:'',passedAt:null});}
export function masteredIds(progress){const ids=new Set();for(const l of lessons){const r=progress.records[l.id];if(r?.knowledge&&(!l.practice||r.practice)&&(!l.prerequisite||ids.has(l.prerequisite)))ids.add(l.id);}return ids;}
export function lessonReady(progress,lesson){return !lesson.prerequisite||masteredIds(progress).has(lesson.prerequisite);}
export function checkKnowledge(progress,lesson,answers,{countWrongAnswers=true}={}){
 if(!Array.isArray(answers)||answers.length!==lesson.quiz.length||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=lesson.quiz[i].options.length))return {complete:false,correct:false,results:[]};
 const results=lesson.quiz.map((q,i)=>answers[i]===q.correct),r=recordFor(progress,lesson.id);if(countWrongAnswers)r.wrongAnswers+=results.filter(v=>!v).length;
 if(results.every(Boolean)){r.knowledge=true;if((!lesson.practice||r.practice)&&lessonReady(progress,lesson))r.passedAt=new Date().toISOString();}
 return {complete:true,correct:results.every(Boolean),results};
}
/** Sign change near 0 is a bow crossing; a wrap at +/-180 is a stern crossing. */
export function crossingKind(previous,current){
 if(!Number.isFinite(previous)||!Number.isFinite(current)||!previous||!current||Math.sign(previous)===Math.sign(current))return null;
 return Math.abs(previous)+Math.abs(current)<180?'tack':'gybe';
}
export function beginAttempt(lesson,state,progress){
 if(!lesson.practice)return null;
 const r=recordFor(progress,lesson.id);r.attempts++;r.lastResult='Practice in progress';
 return {lessonId:lesson.id,status:'active',index:0,held:0,elapsed:0,completed:[],events:new Set(),maneuver:null,maneuverSide:0,previousAngle:angle(state.heading,state.windDirection),weather:{windSpeed:state.windSpeed,windDirection:state.windDirection,currentSpeed:state.currentSpeed??0,currentDirection:state.currentDirection??0},message:'',hints:0};
}
export function invalidateAttempt(attempt,progress,reason){if(!attempt||attempt.status!=='active')return;attempt.status='invalid';attempt.message=reason;recordFor(progress,attempt.lessonId).lastResult=reason;}
export function recordEvent(attempt,type,value){if(attempt?.status==='active')attempt.events.add(`${type}:${value}`);}
export function useHint(attempt,progress){if(attempt?.status==='active'){attempt.hints++;recordFor(progress,attempt.lessonId).hints++;}}
function satisfied(check,state,attempt){
 const twa=Math.abs(angle(state.heading,state.windDirection));const speed=Math.abs(state.speed);
 const sails=state.mainHoist!==undefined?(state.mainHoist+state.jibHoist)/2:state.sails;
 switch(check.kind){
 case 'camera':return attempt.events.has(`camera:${check.value}`);
 case 'event':return attempt.events.has(`event:${check.value}`);
 case 'sails':return check.value===0?sails<.01:sails>.95;
 case 'speedAbove':return speed>check.value&&!state.anchor&&sails>.1&&(state.throttle??0)===0;
 case 'heading':return Math.abs(angle(state.heading,check.value))<=5&&speed>2;
 case 'windAngle':return twa>=check.value[0]&&twa<=check.value[1]&&speed>2;
 case 'trim':return (state.mainHoist??state.sails)>.95&&state.mainFlow==='Drawing'&&Math.abs((state.mainSheet??state.trim)-(state.suggestedMainSheet??Math.max(5,Math.min(88,(twa-35)/1.6))))<=check.value&&speed>2;
 case 'tack':case 'gybe':return attempt.maneuver===check.kind&&Math.sign(angle(state.heading,state.windDirection))===attempt.maneuverSide&&speed>2&&(check.kind==='tack'?twa>=40&&twa<=100:twa>=105&&twa<=175);
 case 'recover':return twa>=40&&twa<=100&&speed>2;
 case 'reef':return (state.reefLevel>0||state.reef)&&(state.mainHoist??state.sails)>.95&&speed>1;
 case 'coast':return sails<.01&&!state.anchor&&speed<check.value;
 case 'anchor':return check.value?state.anchor&&state.anchorScope>=1&&speed<.2&&sails<.01&&!state.anchorDragging:!state.anchor;
 case 'waypoint':return Math.hypot(state.x-check.value.x,state.z-check.value.z)<=check.value.radius&&state.depth>=3;
 default:return false;
 }
}
export function advanceAttempt(attempt,lesson,state,dt,progress){
 if(!attempt||attempt.status!=='active')return attempt;
 if(!Number.isFinite(dt)||dt<=0||dt>.25)return attempt; // No wall-clock credit after sleeping or tab suspension.
 if(state.grounded){invalidateAttempt(attempt,progress,'Grounding ended this attempt. Review the chart and restart with sea room.');return attempt;}
 if(Object.entries(attempt.weather).some(([key,value])=>Math.abs((state[key]??0)-value)>.001)){invalidateAttempt(attempt,progress,'Conditions changed. Restart to assess in the prescribed weather.');return attempt;}
 const current=lesson.practice.steps[attempt.index];
 const departure=lesson.practice.setup.anchor===true&&attempt.index===0;
 if(state.anchor&&current.kind!=='anchor'&&!departure){invalidateAttempt(attempt,progress,'Anchor deployed before the stopping stage. Slow under control and restart.');return attempt;}
 if((state.throttle??0)!==0){invalidateAttempt(attempt,progress,'This sailing exercise requires the engine in neutral. Restart under sail.');return attempt;}
 const relative=angle(state.heading,state.windDirection),crossing=crossingKind(attempt.previousAngle,relative);
 if(crossing&&['tack','gybe'].includes(current.kind)){attempt.maneuver=crossing;attempt.maneuverSide=Math.sign(relative);}
 if(Math.abs(relative)>.05)attempt.previousAngle=relative;
 attempt.elapsed+=dt;
 attempt.held=satisfied(current,state,attempt)?attempt.held+dt:0;
 if(attempt.held>=Math.max(.001,current.duration)){
  attempt.completed.push({index:attempt.index,time:attempt.elapsed});attempt.index++;attempt.held=0;attempt.events.clear();attempt.maneuver=null;attempt.maneuverSide=0;
  if(attempt.index===lesson.practice.steps.length){attempt.status='passed';const r=recordFor(progress,lesson.id);r.practice=true;r.lastResult=`Practice passed in ${Math.round(attempt.elapsed)} seconds; ${attempt.hints} hints this attempt.`;if(r.knowledge&&lessonReady(progress,lesson))r.passedAt=new Date().toISOString();}
 }
 return attempt;
}
export function coachingTip(lesson,attempt,state){
 if(!attempt||attempt.status!=='active')return lesson.observe[0];
 const current=lesson.practice.steps[attempt.index];
 if(state.grounded)return 'You are aground. Restart the exercise and check the chart for a clear route.';
 if(current.kind==='camera')return 'Select Cockpit in the camera controls, then inspect the instruments.';
 if(current.kind==='event')return 'Select the chart card or press M to inspect your position.';
 if(['trim','reef'].includes(current.kind)&&(state.mainHoist??state.sails)<.95)return 'Hoist both sails using the sail controls.';
 if(current.hint)return current.hint;
 if(current.kind==='coast')return 'Lower both sails, keep the engine neutral and the anchor up. Allow momentum to decay.';
 if(current.kind==='anchor')return current.value?'With sails lowered and the boat slow, drop the anchor. Check rode and wait for the boat to settle.':'Weigh the anchor before setting the sails.';
 if(current.kind==='sails')return current.value?'Hoist both sails using the sail controls.':'Lower both mainsail and headsail.';
 if(current.kind==='reef')return 'Select at least one reef and maintain more than 1 knot of speed.';
 if(Math.abs(angle(state.heading,state.windDirection))<38)return 'The bow is in the no-go zone. Bear away while you still have steerage.';
 if(Math.abs(state.speed)<2)return 'Let speed build on a reach. Check the sails, anchor, and both sheet settings.';
 if(current.kind==='heading')return `Steer ${String(current.value).padStart(3,'0')}°. Use small corrections and center before overshooting.`;
 if(current.kind==='trim')return 'Use the suggested mainsheet angle, then wait for the speed response.';
 if(current.kind==='windAngle')return `Aim for a true wind angle of ${current.value[0]}–${current.value[1]}°, keeping more than 2 knots.`;
 if(current.kind==='waypoint')return 'Open the chart, find the numbered buoy, and keep at least 3 m water depth.';
 return lesson.observe[0];
}
