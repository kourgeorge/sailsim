import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {step,angleDifference,clamp,wrap,apparentWind,suggestedSheet} from '../src/physics.js';
import {lessons} from '../src/learning/curriculum.js';
import {createPracticeState} from '../src/learning/scenario-state.js';
import {applyControlPatch} from '../src/vessel-controls.js';
import {anchorSnapshot} from '../src/anchor.js';
import {restoreProgress,beginAttempt,advanceAttempt,recordEvent} from '../src/learning/engine.js';

export const scenarioState=createPracticeState;
/** A feedback helm controller, not a perfect trajectory: all motion goes through step(). */
export function steer(s,heading){s.rudder=clamp(angleDifference(heading,s.heading)*1.8-s.yawRate*5,-35,35);}
function hoist(s,value){s.mainHoist=s.jibHoist=s.sails=value;}
export function runScenario(lesson,{maxSeconds=1200,dt=.1}={}){
 const state=scenarioState(lesson.practice.setup),progress=restoreProgress(null),attempt=beginAttempt(lesson,state,progress),checkpoints=[];
 let target=null,previousIndex=-1,minDepth=Infinity,maxSpeed=0,crossings=[];let previousRelative=angleDifference(state.heading,state.windDirection);
 for(let t=0;t<maxSeconds&&attempt.status==='active';t+=dt){
  const check=lesson.practice.steps[attempt.index],relative=angleDifference(state.heading,state.windDirection),side=Math.sign(relative)||1;
  if(attempt.index!==previousIndex){previousIndex=attempt.index;
   switch(check.kind){
   case 'heading':target=check.value;break;
   case 'windAngle':target=wrap(state.windDirection+side*(check.value[0]+check.value[1])/2);break;
   case 'tack':target=wrap(state.windDirection-side*50);break;
   case 'gybe':target=wrap(state.windDirection-side*140);break;
   case 'recover':target=wrap(state.windDirection+side*55);break;
   default:target=state.heading;
   }
  }
  const aw=apparentWind(state);state.mainSheet=state.trim=suggestedSheet(aw.angle);state.jibSheet=suggestedSheet(aw.angle);
  switch(check.kind){
  case 'camera':recordEvent(attempt,'camera',check.value);break;
  case 'event':recordEvent(attempt,'event',check.value);break;
  case 'sails':hoist(state,check.value);break;
  case 'speedAbove':hoist(state,1);break;
  case 'reef':state.reef=true;state.reefLevel=1;break;
  case 'coast':hoist(state,0);break;
  case 'anchor':if(check.value){if(!state.anchor)applyControlPatch(state,{anchor:true});hoist(state,0);}else if(state.anchor&&state.anchorRode!==0)applyControlPatch(state,{anchor:false});break;
  case 'waypoint':target=wrap(Math.atan2(check.value.x-state.x,state.z-check.value.z)*180/Math.PI);break;
  }
  steer(state,target);step(state,dt);
  minDepth=Math.min(minDepth,state.depth);maxSpeed=Math.max(maxSpeed,state.speed);
  const nowRelative=angleDifference(state.heading,state.windDirection);
  if(Math.sign(previousRelative)!==Math.sign(nowRelative))crossings.push({time:+t.toFixed(1),kind:Math.abs(previousRelative)+Math.abs(nowRelative)<180?'bow':'stern'});
  if(Math.abs(nowRelative)>.05)previousRelative=nowRelative;
  const before=attempt.index;advanceAttempt(attempt,lesson,state,dt,progress);
  if(attempt.index!==before)checkpoints.push({label:check.label,at:+attempt.elapsed.toFixed(1),x:+state.x.toFixed(1),z:+state.z.toFixed(1)});
 }
 return {id:lesson.id,title:lesson.title,status:attempt.status==='active'?'timeout':attempt.status,seconds:+attempt.elapsed.toFixed(1),minDepth:+minDepth.toFixed(1),maxSpeed:+maxSpeed.toFixed(1),checkpoint:attempt.index,checkpoints,crossings,reason:attempt.message||null,anchorGeometry:anchorSnapshot(state),final:{heading:+state.heading.toFixed(1),speed:+state.speed.toFixed(2),x:+state.x.toFixed(1),z:+state.z.toFixed(1),anchor:state.anchor,anchorStatus:state.anchorStatus,collisionCount:state.collisionCount,grounded:state.grounded}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const results=lessons.filter(l=>l.practice).map(l=>runScenario(l));
 if(process.argv.includes('--json'))console.log(JSON.stringify(results,null,2));
 else {console.table(results.map(({id,title,status,seconds,minDepth,checkpoint})=>({id,title,status,seconds,minDepth,checkpoint})));for(const result of results.filter(r=>r.status!=='passed'))console.log(JSON.stringify(result,null,2));}
 if(results.some(r=>r.status!=='passed'))process.exitCode=1;
}
