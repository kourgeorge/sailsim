import { lessons } from './curriculum.js';
import { beginPracticeAssessment, observePracticeObjective, completePracticeObjective, practiceAssessment, practiceEvidence, restorePracticeAssessment, COLLISION_FAILURE_MESSAGE, playerCollisionCount, hasPlayerCollision, collisionEvidence, WINDLASS_ASSESSMENT_VERSION } from './practice-assessment.js';
import {practiceConditions} from './practice-conditions.js';
import {windOverWater} from '../physics.js';
import { restoreDecisionResult } from './decision-evidence.js';
import { practiceGroundSpeed } from './practice-assessment.js';
import { createSailingTrack, captureSailingTrack } from '../navigation/sailing-track.js';
export { practiceRubric, practiceAssessment, PRACTICE_SCORE_RULES } from './practice-assessment.js';

export const STORAGE_KEY='sail-training-v1';
const angle=(a,b)=>((a-b+540)%360)-180;
const windRelativeHeading=state=>{const wind=windOverWater(state);return wind.direction===null?null:angle(state.heading,wind.direction);};
const count=v=>Number.isSafeInteger(v)&&v>=0?Math.min(v,100000):0;
const blank=()=>({version:1,selected:lessons[0].id,records:{}});
/** Accept only known lesson ids and typed evidence. Old six-click progress cannot become credit. */
export function restoreProgress(raw){
 let value;try{value=typeof raw==='string'?JSON.parse(raw):raw;}catch{return blank();}
 const result=blank();if(!value||value.version!==1||!value.records||typeof value.records!=='object')return result;
 if(lessons.some(l=>l.id===value.selected))result.selected=value.selected;
 for(const l of lessons){const r=value.records[l.id];if(!r||typeof r!=='object')continue;
  const practice=r.practice===true&&count(r.attempts)>0;
  const practiceResults=Array.isArray(r.practiceResults)?r.practiceResults.slice(-5).map(value=>restorePracticeAssessment(value,l)).filter(Boolean):[];
  const lastPracticeResult=restorePracticeAssessment(r.lastPracticeResult,l)??practiceResults.at(-1)??null;
  const decisionResults=Array.isArray(r.decisionResults)?r.decisionResults.slice(-5).map(value=>restoreDecisionResult(value,l)).filter(Boolean):[];
  const lastDecisionResult=restoreDecisionResult(r.lastDecisionResult,l)??decisionResults.at(-1)??null;
  const decisionAttempts=count(r.decisionAttempts),decision=Boolean(l.decisionScenarioId)&&r.decision===true&&decisionAttempts>0;
  result.records[l.id]={practice,knowledge:r.knowledge===true,attempts:count(r.attempts),hints:count(r.hints),wrongAnswers:count(r.wrongAnswers),lastResult:typeof r.lastResult==='string'?r.lastResult.slice(0,240):'',passedAt:typeof r.passedAt==='string'&&Number.isFinite(Date.parse(r.passedAt))?r.passedAt:null,lastPracticeResult,practiceResults,decision,decisionAttempts,lastDecisionResult,decisionResults};
 }
 return result;
}
export function recordFor(progress,id){return progress.records[id]??(progress.records[id]={practice:false,knowledge:false,attempts:0,hints:0,wrongAnswers:0,lastResult:'',passedAt:null,lastPracticeResult:null,practiceResults:[],decision:false,decisionAttempts:0,lastDecisionResult:null,decisionResults:[]});}
const evidenceComplete=(record,lesson)=>record?.knowledge&&(!lesson.practice||record.practice)&&(!lesson.decisionScenarioId||record.decision===true);
export function masteredIds(progress){const ids=new Set();for(const l of lessons){const r=progress.records[l.id];if(evidenceComplete(r,l)&&(!l.prerequisite||ids.has(l.prerequisite)))ids.add(l.id);}return ids;}
export function lessonReady(progress,lesson){return !lesson.prerequisite||masteredIds(progress).has(lesson.prerequisite);}
export function checkKnowledge(progress,lesson,answers,{countWrongAnswers=true}={}){
 if(!Array.isArray(answers)||answers.length!==lesson.quiz.length||answers.some((a,i)=>!Number.isInteger(a)||a<0||a>=lesson.quiz[i].options.length))return {complete:false,correct:false,results:[]};
 const results=lesson.quiz.map((q,i)=>answers[i]===q.correct),r=recordFor(progress,lesson.id);if(countWrongAnswers)r.wrongAnswers+=results.filter(v=>!v).length;
 if(results.every(Boolean)){r.knowledge=true;if(evidenceComplete(r,lesson)&&lessonReady(progress,lesson))r.passedAt=new Date().toISOString();}
 return {complete:true,correct:results.every(Boolean),results};
}
/** Decision reports add a separate evidence requirement; quizzes cannot substitute for it. */
export function recordDecisionResult(progress,lesson,value){
 const report=restoreDecisionResult(value,lesson);if(!report)return null;
 const r=recordFor(progress,lesson.id);if(r.lastDecisionResult?.id===report.id||r.decisionResults?.some(item=>item.id===report.id))return r.decisionResults?.find(item=>item.id===report.id)??r.lastDecisionResult;
 r.decisionAttempts=Math.min(100000,count(r.decisionAttempts)+1);r.hints=Math.min(100000,count(r.hints)+report.hints);r.lastDecisionResult=report;r.decisionResults=[...(r.decisionResults??[]),report].slice(-5);
 if(report.status==='passed'){r.decision=true;if(evidenceComplete(r,lesson)&&lessonReady(progress,lesson))r.passedAt=new Date().toISOString();}
 return report;
}
/** Sign change near 0 is a bow crossing; a wrap at +/-180 is a stern crossing. */
export function crossingKind(previous,current){
 if(!Number.isFinite(previous)||!Number.isFinite(current)||!previous||!current||Math.sign(previous)===Math.sign(current))return null;
 return Math.abs(previous)+Math.abs(current)<180?'tack':'gybe';
}
export function beginAttempt(lesson,state,progress){
 if(!lesson.practice)return null;
 const r=recordFor(progress,lesson.id);r.attempts++;r.lastResult='Practice in progress';
 const attempt={id:globalThis.crypto?.randomUUID?.()??`${lesson.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,lessonId:lesson.id,windlassAssessmentVersion:WINDLASS_ASSESSMENT_VERSION,status:'active',index:0,held:0,elapsed:0,completed:[],events:new Set(),maneuver:null,maneuverSide:0,previousAngle:windRelativeHeading(state),weather:{windSpeed:state.windSpeed,windDirection:state.windDirection,currentSpeed:state.currentSpeed??0,currentDirection:state.currentDirection??0},message:'',hints:0,attemptNumber:r.attempts,objectives:beginPracticeAssessment(lesson),criticalFailure:null,collisionBaseline:playerCollisionCount(state)};
 attempt.track=createSailingTrack(state);
 if(state.contactActive===true){attempt.objectives[0].evidence=practiceEvidence(state,attempt);invalidateAttempt(attempt,progress,COLLISION_FAILURE_MESSAGE,'collision',collisionEvidence(state.collision));}
 return attempt;
}
function savePracticeResult(attempt,lesson,progress){const report=practiceAssessment(attempt,lesson);if(!report||report.status==='active')return;const r=recordFor(progress,attempt.lessonId);r.lastPracticeResult=report;r.practiceResults=[...(r.practiceResults??[]),report].slice(-5);}
export function invalidateAttempt(attempt,progress,reason,code='interrupted',collision=null){if(!attempt||attempt.status!=='active')return;attempt.status='invalid';attempt.message=reason;if(code!=='interrupted')attempt.criticalFailure={code,message:reason,...(code==='collision'?{collision:collisionEvidence(collision)}:{})};recordFor(progress,attempt.lessonId).lastResult=reason;const lesson=lessons.find(l=>l.id===attempt.lessonId);if(lesson)savePracticeResult(attempt,lesson,progress);}
export function recordEvent(attempt,type,value){if(attempt?.status==='active')attempt.events.add(`${type}:${value}`);}
export function useHint(attempt,progress){if(attempt?.status==='active'){attempt.hints++;recordFor(progress,attempt.lessonId).hints++;}}
function satisfied(check,state,attempt){
 return practiceConditions(check,state,attempt).every(condition=>condition.met);
}
export function advanceAttempt(attempt,lesson,state,dt,progress){
 if(!attempt||attempt.status!=='active')return attempt;
 if(!Number.isFinite(dt)||dt<=0||dt>.25)return attempt; // No wall-clock credit after sleeping or tab suspension.
 captureSailingTrack(attempt.track,state,attempt.elapsed+dt);
 if(attempt.objectives?.[attempt.index])attempt.objectives[attempt.index].evidence=practiceEvidence(state,attempt);
 if(hasPlayerCollision(state,attempt.collisionBaseline)){invalidateAttempt(attempt,progress,COLLISION_FAILURE_MESSAGE,'collision',collisionEvidence(state.collision));return attempt;}
 if(state.grounded){invalidateAttempt(attempt,progress,'Grounding ended this attempt. Review the chart and restart with sea room.','grounding');return attempt;}
 if(Object.entries(attempt.weather).some(([key,value])=>Math.abs((state[key]??0)-value)>.001)){invalidateAttempt(attempt,progress,'Conditions changed. Restart to assess in the prescribed weather.','conditions-changed');return attempt;}
 const current=lesson.practice.steps[attempt.index];
 const departure=lesson.practice.setup.anchor===true&&attempt.index===0;
 if(state.anchor&&current.kind!=='anchor'&&!departure){invalidateAttempt(attempt,progress,'Anchor deployed before the stopping stage. Slow under control and restart.','early-anchor');return attempt;}
 if(lesson.practice.propulsion==='engine'){
  if((state.mainHoist??state.sails)>.01||(state.jibHoist??state.sails)>.01){invalidateAttempt(attempt,progress,'Keep both sails lowered during engine practice. Restart the exercise.','sails-raised');return attempt;}
  if(practiceGroundSpeed(state)>lesson.practice.maxSpeed){invalidateAttempt(attempt,progress,'Practice speed limit exceeded. Slow earlier and restart.','speed-limit');return attempt;}
  const area=lesson.practice.area;
  if(area&&Math.hypot(state.x-area.x,state.z-area.z)>area.radius){invalidateAttempt(attempt,progress,'You left the practice area. Follow the marked route and restart.','practice-area');return attempt;}
 }else if((state.throttle??0)!==0){invalidateAttempt(attempt,progress,'This sailing exercise requires the engine in neutral. Restart under sail.','engine-engaged');return attempt;}
 const relative=windRelativeHeading(state),crossing=crossingKind(attempt.previousAngle,relative);
 if(relative===null){attempt.previousAngle=null;attempt.maneuver=null;attempt.maneuverSide=0;}
 if(crossing&&['tack','gybe'].includes(current.kind)){attempt.maneuver=crossing;attempt.maneuverSide=Math.sign(relative);}
 if(Math.abs(relative)>.05)attempt.previousAngle=relative;
 attempt.elapsed+=dt;
 const conditionMet=satisfied(current,state,attempt);
 observePracticeObjective(attempt,state,conditionMet,dt);
 attempt.held=conditionMet?attempt.held+dt:0;
 if(attempt.held>=Math.max(.001,current.duration)){
  completePracticeObjective(attempt);
  attempt.completed.push({index:attempt.index,time:attempt.elapsed});attempt.index++;attempt.held=0;attempt.events.clear();attempt.maneuver=null;attempt.maneuverSide=0;
  if(attempt.index===lesson.practice.steps.length){attempt.status='passed';const r=recordFor(progress,lesson.id);if(practiceAssessment(attempt,lesson)?.status==='passed'){r.practice=true;r.lastResult=`Practice passed in ${Math.round(attempt.elapsed)} seconds; ${attempt.hints} hints this attempt.`;if(r.knowledge&&lessonReady(progress,lesson))r.passedAt=new Date().toISOString();}else{attempt.status='invalid';attempt.message='All rubric objectives and the passing score are required.';r.lastResult=attempt.message;}savePracticeResult(attempt,lesson,progress);}
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
 if(windOverWater(state).angle!==null&&Math.abs(windOverWater(state).angle)<38)return 'The bow is in the no-go zone. Bear away while you still have steerage.';
 if(Math.abs(state.speed)<2)return 'Let speed build on a reach. Check the sails, anchor, and both sheet settings.';
 if(current.kind==='heading')return `Steer ${String(current.value).padStart(3,'0')}°. Use small corrections and center before overshooting.`;
 if(current.kind==='trim')return 'Use the suggested mainsheet angle, then wait for the speed response.';
 if(current.kind==='windAngle')return `Aim for a true wind angle of ${current.value[0]}–${current.value[1]}°, keeping more than 2 knots.`;
 if(current.kind==='waypoint')return 'Open the chart, find the numbered buoy, and keep at least 3 m water depth.';
 return lesson.observe[0];
}
