import { initialState, angleDifference, refreshDerived } from '../physics.js';
import { applyControlPatch } from '../vessel-controls.js';
import { COLLISION_FAILURE_MESSAGE, playerCollisionCount, hasPlayerCollision, collisionEvidence } from './practice-assessment.js';

// These exercises assess maneuvering in open water, never contact with a dock.
// Display strings are English translation keys; metrics remain language-independent.
export const maneuverDrills = [
  {
    id:'engine-stop', title:'Ahead and controlled stop',
    description:'Build controlled ahead speed, pause in neutral, then use astern thrust to stop. Finish in neutral.',
    stages:[
      {label:'Hold 2–3 knots on 000° for 5 seconds.',duration:5},
      {label:'Pause in neutral for at least 0.4 seconds.',duration:.4},
      {label:'Use astern thrust, then hold neutral below 0.25 knots for 3 seconds.',duration:3},
    ],
    heading:0,origin:{x:0,z:900},maxSpeed:4.5,areaRadius:200,
  },
  {
    id:'astern-track', title:'Astern steering corridor',
    description:'Establish sternway, turn the bow from 000° to 340° while backing at least 35 metres, then use ahead thrust to stop.',
    stages:[
      {label:'Hold 0.8–1.8 knots astern on 000° for 3 seconds.',duration:3},
      {label:'Under sternway, turn the bow to 340° and hold for 5 seconds after backing 35 metres.',duration:5},
      {label:'Pause in neutral, use ahead thrust, then stop in neutral on 340° for 3 seconds.',duration:3},
    ],
    heading:0,origin:{x:0,z:900},maxSpeed:2.5,areaRadius:100,trackLength:35,corridorHalfWidth:15,limitAstern:65,targetHeading:340,
  },
  {
    id:'precision-approach', title:'Precision approach and stop',
    description:'Cross a virtual gate at 0.5–1.5 knots, then stop in the marked zone. This is open-water speed control, not a docking qualification.',
    stages:[
      {label:'Cross the gate on 000° at 0.5–1.5 knots, within 5 metres of its centre.',duration:0},
      {label:'Stop inside the 12-metre zone and hold neutral below 0.25 knots for 3 seconds.',duration:3},
    ],
    heading:0,origin:{x:0,z:900},maxSpeed:3.5,areaRadius:180,
    gate:{x:0,z:820,halfWidth:5},target:{x:0,z:785,radius:12},
  },
];
for(const drill of maneuverDrills){
  drill.summary=drill.description;
  drill.briefing=[drill.description,'Keep both sails lowered and the anchor stowed. Conditions remain fixed.', 'Pause in neutral for at least 0.4 seconds before reversing thrust. This is a drill convention, not a universal gearbox specification.'];
  if(drill.id==='astern-track')drill.briefing.push('Use positive helm under sternway to turn the bow toward 340°. Stay within 15 metres of the centreline and stop before backing 65 metres.');
  drill.steps=drill.stages.map(stage=>({...stage,hint:stage.label}));
  drill.cues={
    ...(drill.gate?{gate:{...drill.gate,width:drill.gate.halfWidth*2,heading:0}}:{}),...(drill.target?{target:drill.target}:{}),
    ...(drill.corridorHalfWidth?{corridor:{x:drill.origin.x,z:drill.origin.z+drill.limitAstern/2,width:drill.corridorHalfWidth*2,length:drill.limitAstern,heading:0}}:{}),
  };
}
export const drills = maneuverDrills;
const failureMessages=[
  COLLISION_FAILURE_MESSAGE,
  'Reset the drill before starting a measured attempt.',
  'Drill interrupted. Restart for a new measured attempt.',
  'Maneuvering drill complete. Review the measured results.',
  'Insufficient depth. Restart with clear water.',
  'Keep the anchor stowed during engine maneuvering.',
  'Keep both sails lowered during this engine drill.',
  'Conditions changed. Restart in the prescribed conditions.',
  'Speed limit exceeded. Anticipate the stopping distance.',
  'You left the practice area. Restart and plan the maneuver.',
  'Pause in neutral for 0.4 seconds before reversing thrust.',
  'The boat left the astern corridor. Use small helm corrections.',
  'You passed the astern stopping limit. Start braking earlier.',
  'You overshot the stopping zone. Reduce speed sooner.',
  'Gate missed: cross within 5 metres at 0.5–1.5 knots on 000°.',
];
export const MANEUVER_TEXT=[...new Set([...maneuverDrills.flatMap(d=>[d.title,d.summary,...d.briefing,...d.steps.flatMap(s=>[s.label,s.hint])]),...failureMessages])];

export const maneuverStrings=MANEUVER_TEXT;
const lookup=id=>{const drill=maneuverDrills.find(d=>d.id===id);if(!drill)throw new RangeError(`Unknown maneuvering drill: ${id}`);return drill;};
const gear=s=>Math.abs(s.throttle??0)<.01?0:Math.sign(s.throttle);
const bare=s=>(s.mainHoist??s.sails??0)<.01&&(s.jibHoist??s.sails??0)<.01;
const still=s=>Math.abs(s.speed)<.25&&gear(s)===0;
const environment=s=>Object.fromEntries(['windSpeed','windDirection','currentSpeed','currentDirection'].map(k=>[k,s[k]??0]));

export function createDrillState(id) {
  const d=lookup(id),s=Object.assign(initialState(),{x:d.origin.x,z:d.origin.z,heading:d.heading,windSpeed:8,windDirection:315,currentSpeed:0,currentDirection:0});
  applyControlPatch(s,{sails:0,throttle:0,rudder:0,anchor:false,reefLevel:0});
  return refreshDerived(s);
}
export function beginManeuver(id,state) {
  const d=lookup(id);state??=createDrillState(id);
  const attempt={drillId:id,status:'active',index:0,held:0,elapsed:0,completed:[],events:[],metrics:{},message:'',weather:environment(state),collisionBaseline:playerCollisionCount(state),criticalFailure:null,
    previous:{x:state.x,z:state.z,speed:state.speed,heading:state.heading},neutralHeld:0,lastGear:0,reverseSeconds:0,aheadBrakeSeconds:0,asternSteeringSeconds:0,minAsternYaw:0,maxAstern:0,overshoot:0,stopStartTime:null,entrySpeed:null,
    distance:0,stopStartDistance:null,stopDistance:0,peakSpeed:Math.abs(state.speed),maxCrossTrack:0,maxHeadingError:0,minDepth:state.depth,gateCrossing:null};
  if(Math.hypot(state.x-d.origin.x,state.z-d.origin.z)>1||Math.abs(state.speed)>.1||Math.abs(angleDifference(state.heading,d.heading))>1||gear(state)!==0||!bare(state)||state.anchor||state.grounded){
    attempt.status='failed';attempt.message='Reset the drill before starting a measured attempt.';
  }
  if(state.contactActive===true)return failCollision(attempt,state);
  updateMetrics(attempt);return attempt;
}
function fail(a,message){a.status='failed';a.message=message;updateMetrics(a);return a;}
function failCollision(a,state){const collision=collisionEvidence(state.collision);a.criticalFailure={code:'collision',message:COLLISION_FAILURE_MESSAGE,collision};a.events.push({type:'collision',time:a.elapsed,collision});return fail(a,COLLISION_FAILURE_MESSAGE);}
export function cancelManeuver(attempt){if(attempt?.status==='active')fail(attempt,'Drill interrupted. Restart for a new measured attempt.');return attempt;}
function completeStage(a,d){a.completed.push({stage:a.index,time:a.elapsed});a.events.push({type:'checkpoint',index:a.index,time:a.elapsed});a.index++;a.held=0;if(a.index===d.stages.length){a.status='passed';a.message='Maneuvering drill complete. Review the measured results.';}}

export function advanceManeuver(a,s,dt) {
  if(!a||a.status!=='active'||!Number.isFinite(dt)||dt<=0||dt>.25)return a;
  const d=lookup(a.drillId),speed=Math.abs(s.speed),cross=s.x-d.origin.x,headingError=Math.abs(angleDifference(s.heading,d.heading));
  a.elapsed+=dt;a.distance+=Math.hypot(s.x-a.previous.x,s.z-a.previous.z);
  a.maxAstern=Math.max(a.maxAstern,-s.speed);
  if(s.speed<-.5&&s.rudder>3&&s.yawRate<-.05){a.asternSteeringSeconds+=dt;a.minAsternYaw=Math.min(a.minAsternYaw,s.yawRate);}
  a.peakSpeed=Math.max(a.peakSpeed,speed);a.maxCrossTrack=Math.max(a.maxCrossTrack,Math.abs(cross));a.maxHeadingError=Math.max(a.maxHeadingError,headingError);a.minDepth=Math.min(a.minDepth,s.depth);
  if(a.stopStartDistance!==null)a.stopDistance=a.distance-a.stopStartDistance;
  if(hasPlayerCollision(s,a.collisionBaseline))return failCollision(a,s);
  if(s.grounded||s.depth<3)return fail(a,'Insufficient depth. Restart with clear water.');
  if(s.anchor)return fail(a,'Keep the anchor stowed during engine maneuvering.');
  if(!bare(s))return fail(a,'Keep both sails lowered during this engine drill.');
  if(Object.entries(a.weather).some(([k,v])=>Math.abs((s[k]??0)-v)>.001))return fail(a,'Conditions changed. Restart in the prescribed conditions.');
  if(speed>d.maxSpeed)return fail(a,'Speed limit exceeded. Anticipate the stopping distance.');
  if(Math.hypot(s.x-d.origin.x,s.z-d.origin.z)>d.areaRadius)return fail(a,'You left the practice area. Restart and plan the maneuver.');
  // A visible 0.4-second neutral dwell is a drill convention, not a universal gearbox specification.
  const nextGear=gear(s);
  if(nextGear===0)a.neutralHeld+=dt;
  else {
    if(a.lastGear!==0&&nextGear!==a.lastGear&&a.neutralHeld<.4-1e-8)return fail(a,'Pause in neutral for 0.4 seconds before reversing thrust.');
    a.lastGear=nextGear;a.neutralHeld=0;
  }
  let satisfied=false;
  if(d.id==='engine-stop'){
    if(a.index===0)satisfied=s.speed>=2&&s.speed<=3&&headingError<=5&&nextGear===1;
    else if(a.index===1)satisfied=nextGear===0;
    else {if(nextGear===-1)a.reverseSeconds+=dt;satisfied=a.reverseSeconds>=1&&still(s)&&headingError<=8;}
  }else if(d.id==='astern-track'){
    if(Math.abs(cross)>d.corridorHalfWidth)return fail(a,'The boat left the astern corridor. Use small helm corrections.');
    if(s.z-d.origin.z>d.limitAstern)return fail(a,'You passed the astern stopping limit. Start braking earlier.');
    if(a.index===0)satisfied=s.speed<=-.8&&s.speed>=-1.8&&headingError<=6&&nextGear===-1;
    else if(a.index===1)satisfied=s.z-d.origin.z>=d.trackLength&&s.speed<=-.8&&s.speed>=-1.8&&Math.abs(angleDifference(s.heading,d.targetHeading))<=5&&a.asternSteeringSeconds>=1;
    else {if(nextGear===1)a.aheadBrakeSeconds+=dt;satisfied=a.aheadBrakeSeconds>=1&&still(s)&&Math.abs(angleDifference(s.heading,d.targetHeading))<=6;}
  }else {
    const targetAlong=d.origin.z-d.target.z,along=d.origin.z-s.z,previousAlong=d.origin.z-a.previous.z,gateAlong=d.origin.z-d.gate.z;
    a.overshoot=Math.max(a.overshoot,along-targetAlong);
    if(along>targetAlong+d.target.radius)return fail(a,'You overshot the stopping zone. Reduce speed sooner.');
    if(a.index===0&&previousAlong<gateAlong&&along>=gateAlong){
      const fraction=(gateAlong-previousAlong)/(along-previousAlong),crossAtGate=a.previous.x+(s.x-a.previous.x)*fraction-d.gate.x;
      const speedAtGate=a.previous.speed+(s.speed-a.previous.speed)*fraction;
      a.gateCrossing={crossTrack:crossAtGate,speed:speedAtGate,time:a.elapsed-dt+fraction*dt};
      if(Math.abs(crossAtGate)>d.gate.halfWidth||speedAtGate<.5||speedAtGate>1.5||headingError>8)return fail(a,'Gate missed: cross within 5 metres at 0.5–1.5 knots on 000°.');
      satisfied=true;
    }else if(a.index===1)satisfied=Math.hypot(s.x-d.target.x,s.z-d.target.z)<=d.target.radius&&still(s)&&headingError<=8;
  }
  a.held=satisfied?a.held+dt:0;
  if(satisfied&&a.held+1e-8>=d.stages[a.index].duration){
    if((d.id==='engine-stop'&&a.index===0)||(d.id==='astern-track'&&a.index===1)||(d.id==='precision-approach'&&a.index===0)){a.stopStartDistance=a.distance;a.stopStartTime=a.elapsed;a.entrySpeed=s.speed;}
    completeStage(a,d);
  }
  a.previous={x:s.x,z:s.z,speed:s.speed,heading:s.heading};
  updateMetrics(a);return a;
}

export function maneuverTelemetry(a,s) {
  const d=lookup(a.drillId);
  return {drillId:d.id,status:a.status,stage:a.index,label:d.stages[a.index]?.label??a.message,
    elapsed:a.elapsed,held:a.held,required:d.stages[a.index]?.duration??0,
    speed:s.speed,headingTarget:d.targetHeading!==undefined&&a.index>=1?d.targetHeading:d.heading,headingError:angleDifference(s.heading,d.targetHeading!==undefined&&a.index>=1?d.targetHeading:d.heading),crossTrack:s.x-d.origin.x,
    asternDistance:s.z-d.origin.z,distanceToGate:d.gate?Math.hypot(s.x-d.gate.x,s.z-d.gate.z):null,
    distanceToTarget:d.target?Math.hypot(s.x-d.target.x,s.z-d.target.z):null,
    peakSpeed:a.peakSpeed,maxCrossTrack:a.maxCrossTrack,maxHeadingError:a.maxHeadingError,minDepth:a.minDepth,
    distance:a.distance,stoppingDistance:a.stopDistance,gateCrossing:a.gateCrossing,message:a.message};
}
export function maneuverResult(a) {
  return {drillId:a.drillId,status:a.status,elapsed:a.elapsed,stagesCompleted:a.completed.length,peakSpeed:a.peakSpeed,criticalFailure:a.criticalFailure?{...a.criticalFailure,collision:collisionEvidence(a.criticalFailure.collision)}:null,
    maxCrossTrack:a.maxCrossTrack,maxHeadingError:a.maxHeadingError,minDepth:a.minDepth,stoppingDistance:a.stopDistance,stopDistance:a.stopDistance,stopSeconds:a.stopStartTime===null?0:a.elapsed-a.stopStartTime,entrySpeed:a.entrySpeed,overshoot:a.overshoot,maxAstern:a.maxAstern,asternSteeringSeconds:a.asternSteeringSeconds,minAsternYaw:a.minAsternYaw,gateCrossing:a.gateCrossing,message:a.message};
}

function updateMetrics(a){a.metrics=maneuverResult(a);}
