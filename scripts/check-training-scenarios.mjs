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
// Verification pilot uses only the same throttle/helm controls as the learner.
// It never moves the boat or completes an objective directly.
export function steerMarina(state,lesson,index){
 if(!['engineWaypoint','engineStop'].includes(lesson.practice.steps[index].kind))return;
 const check=lesson.practice.steps[index],p=check.value,dx=p.x-state.x,dz=p.z-state.z,distance=Math.hypot(dx,dz);
 const reversing=check.kind==='engineWaypoint'?p.speed[1]<0:lesson.practice.steps[index-1]?.value.speed?.[1]<0;
 const sign=reversing?-1:1,bearing=wrap(Math.atan2(dx,-dz)*180/Math.PI+(reversing?180:0));
 const heading=distance<Math.max(9,p.radius)?p.heading:bearing;
 if(state.vesselId==='catamaran'&&index===0){
  const error=angleDifference(p.heading,state.heading);
  const turn=clamp(error*.025-state.yawRate*.18,-.6,.6);
  state.rudder=0;
  if(Math.abs(error)<3&&Math.abs(state.yawRate)<.3)applyControlPatch(state,{throttle:0});
  else applyControlPatch(state,{portThrottle:turn>0?turn*2/3:turn,starboardThrottle:turn>0?-turn:-turn*2/3});
  return;
 }
 state.rudder=clamp((angleDifference(heading,state.heading)*1.8-state.yawRate*5)*sign,-35,35);
 let desired=check.kind==='engineStop'?sign*Math.min(.8,distance*.09):p.speed.reduce((a,b)=>a+b)/2;
 if(check.kind==='engineStop'&&distance<p.radius*.7)desired=0;
 const u=desired*.514444,feed=(58*u+38*u*Math.abs(u))/(desired<0?1050:1650);
 applyControlPatch(state,{throttle:desired===0&&Math.abs(state.speed)<(state.vesselId==='catamaran'?.11:.08)?0:clamp((desired-state.speed)*1.5+feed,-.7,.7)});
}
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
  if(lesson.practice.propulsion==='engine')steerMarina(state,lesson,attempt.index);else steer(state,target);
  step(state,dt);
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
