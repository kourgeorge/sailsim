import { depthAt } from './water-depth.js';

/** Local vessel coordinates: +x starboard, +y up, -z bow. Metres. */
export const BOW_FAIRLEAD=Object.freeze({x:0,y:1.2,z:-6.6});
// Fictional powered operating rates, not measured loaded windlass performance.
export const ANCHOR_RATES=Object.freeze({lowering:.4,retrieving:.25});
const EPS=1e-8,MAX_RODE=250,BREAKOUT_DISTANCE=.5,BREAKOUT_SLACK=.1;
const length=value=>Math.max(0,Math.min(MAX_RODE,Number.isFinite(value)?value:0));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export function bowFairlead(state) {
  const angle=state.heading*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  return {x:state.x+c*BOW_FAIRLEAD.x-s*BOW_FAIRLEAD.z,y:BOW_FAIRLEAD.y,z:state.z+s*BOW_FAIRLEAD.x+c*BOW_FAIRLEAD.z};
}
const recordPoint=(record,fairlead)=>record&&record.onBottom!==false?{x:record.x,y:-record.depth,z:record.z}:record?.point?{...record.point}:{...fairlead};
const onBottom=record=>Boolean(record)&&record.onBottom!==false;
function canBreakOut(state,fairlead,point) {
  return Math.hypot(fairlead.x-point.x,fairlead.z-point.z)<=BREAKOUT_DISTANCE&&
    state.anchorPaidRode<=fairlead.y-point.y+BREAKOUT_SLACK&&state.anchorRode<fairlead.y-point.y;
}
function rememberCommands(state) {
  state._anchorControls={anchor:Boolean(state.anchor),anchorRode:state.anchorRode,anchorWinchRunning:Boolean(state.anchorWinchRunning)};
}

/** Idempotent requests. Actual paid length and bottom position are never edited. */
export function applyAnchorControlPatch(state,patch) {
  state.anchorPaidRode=length(state.anchorPaidRode);
  if('anchorRode' in patch&&Number.isFinite(patch.anchorRode))state.anchorRode=length(patch.anchorRode);
  if('anchor' in patch){
    if(patch.anchor===true&&state.anchorRode>EPS){state.anchor=true;state.anchorWinchRunning=true;}
    else if(patch.anchor===true&&state.anchorPaidRode<=EPS&&!state._anchor){state.anchor=false;state.anchorWinchRunning=false;}
    else if(patch.anchor===false&&(state.anchor||state.anchorPaidRode>EPS)){
      state.anchor=true;state.anchorRode=0;state.anchorWinchRunning=true;
    }
  }
  if('anchorWinchRunning' in patch)state.anchorWinchRunning=Boolean(patch.anchorWinchRunning)&&Boolean(state.anchor);
  if(!state.anchor)state.anchorWinchRunning=false;
  rememberCommands(state);
}

/** Legacy direct writes become requests; they cannot force gear to stow instantly. */
export function reconcileAnchorControls(state) {
  const old=state._anchorControls,patch={};
  if(old){
    if(state.anchor!==old.anchor){patch.anchor=state.anchor;state.anchor=old.anchor;}
    if(state.anchorRode!==old.anchorRode)patch.anchorRode=state.anchorRode;
    if(state.anchorWinchRunning!==old.anchorWinchRunning)patch.anchorWinchRunning=state.anchorWinchRunning;
  }else if(state.anchor){patch.anchor=true;}
  state.anchorRode=length(state.anchorRode);state.anchorPaidRode=length(state.anchorPaidRode);
  applyAnchorControlPatch(state,patch);
}

/** Reset/scenario setup only. Create a genuinely deployed, stationary windlass. */
export function initializeAnchoredScenario(state,{rode=state.anchorRode}={}) {
  const fairlead=bowFairlead(state),depth=depthAt(fairlead.x,fairlead.z,state.locationId);
  if(!Number.isFinite(rode)||rode>MAX_RODE||rode<depth+fairlead.y||depth<=0||state.grounded)throw new RangeError('Predeployed anchor needs valid rode, water depth, and an afloat vessel');
  state.anchor=true;state.anchorRode=rode;state.anchorPaidRode=rode;state.anchorWinchRunning=false;
  state._anchor={x:fairlead.x,z:fairlead.z,depth,onBottom:true,point:{x:fairlead.x,y:-depth,z:fairlead.z}};
  state.anchorDragging=false;state.anchorTension=0;state.anchorScope=rode/(depth+fairlead.y);
  state.anchorStatus=rode<=depth+fairlead.y+.2?'Holding':'Deployed · settling';
  rememberCommands(state);return state;
}

/** Integrate paid length, never the requested target, at bounded powered rates. */
export function advanceAnchorWinch(state,dt) {
  if(!state.anchor)return;
  const fairlead=bowFairlead(state);
  if(!state._anchor&&state.anchorWinchRunning&&state.anchorRode>EPS){
    state._anchor={x:fairlead.x,z:fairlead.z,depth:depthAt(fairlead.x,fairlead.z,state.locationId),onBottom:false,point:{...fairlead}};
  }
  if(state.anchorWinchRunning){
    const paid=state.anchorPaidRode,target=state.anchorRode,point=recordPoint(state._anchor,fairlead);
    if(target>paid+EPS)state.anchorPaidRode=Math.min(target,paid+ANCHOR_RATES.lowering*dt);
    else if(target<paid-EPS){
      if(onBottom(state._anchor)&&canBreakOut(state,fairlead,point)){state._anchor.point={...point};state._anchor.onBottom=false;}
      const requested=Math.max(target,paid-ANCHOR_RATES.retrieving*dt);
      // Retrieve slack, then wait for the learner to unload the rode. A winch
      // target must not shrink the swing circle through the vessel's position.
      state.anchorPaidRode=onBottom(state._anchor)?Math.max(requested,Math.min(paid,distance(fairlead,point))):requested;
    }
    if(Math.abs(state.anchorPaidRode-target)<=EPS){state.anchorPaidRode=target;state.anchorWinchRunning=false;}
  }
  if(state.anchorPaidRode<=EPS&&state.anchorRode<=EPS){
    state.anchorPaidRode=0;state.anchor=false;state.anchorWinchRunning=false;state._anchor=null;state.anchorDragging=false;state.anchorTension=0;
  }
  rememberCommands(state);
}

/** Continuous airborne endpoint: settling and the paid-length sphere move the
 * anchor; changing a target or releasing the bottom never replaces its x/z. */
export function updateAirborneAnchor(state,dt) {
  const record=state._anchor;
  if(!state.anchor||!record||onBottom(record))return;
  const fairlead=bowFairlead(state),paid=state.anchorPaidRode,point=recordPoint(record,fairlead);
  point.y-=ANCHOR_RATES.lowering*dt;
  const span=distance(fairlead,point);
  if(span>paid&&span>EPS){const ratio=paid/span;point.x=fairlead.x+(point.x-fairlead.x)*ratio;point.y=fairlead.y+(point.y-fairlead.y)*ratio;point.z=fairlead.z+(point.z-fairlead.z)*ratio;}
  const depth=depthAt(point.x,point.z,state.locationId);
  if(point.y<=-depth&&distance(fairlead,{...point,y:-depth})<=paid+EPS){point.y=-depth;record.onBottom=true;}
  record.point=point;record.x=point.x;record.z=point.z;record.depth=depth;
}

/** Pure public geometry: commands never preview physical deployment or length. */
export function anchorSnapshot(state) {
  const fairlead=bowFairlead(state),deployed=Boolean(state.anchor),record=deployed?state._anchor:null;
  const rode=length(state.anchorPaidRode),targetRode=length(state.anchorRode),seabedContact=deployed&&onBottom(record);
  const anchorPoint=record?recordPoint(record,fairlead):null;
  const anchorDepth=record?.depth??depthAt(fairlead.x,fairlead.z,state.locationId);
  const vertical=anchorDepth+fairlead.y,scope=deployed?rode/vertical:0,reachesBottom=rode>=vertical;
  const swingRadius=deployed&&reachesBottom?Math.sqrt(Math.max(0,rode*rode-vertical*vertical)):0;
  const seabedPoint=seabedContact?{x:record.x,y:-record.depth,z:record.z}:null;
  const horizontalDistance=seabedPoint?Math.hypot(fairlead.x-seabedPoint.x,fairlead.z-seabedPoint.z):0;
  const taut=seabedContact&&horizontalDistance>=swingRadius-.2,shortScope=deployed&&scope<3;
  const dragging=taut&&shortScope&&Boolean(state.anchorDragging);
  const status=!deployed?'stowed':!record?'pending':!seabedContact?'suspended':dragging?'dragging':taut?'taut':'slack';
  let operation='stopped',reason=null;
  if(deployed&&state.anchorWinchRunning){
    if(targetRode>rode+EPS)operation='lowering';
    else if(targetRode<rode-EPS){
      const loaded=seabedContact&&distance(fairlead,anchorPoint)>=rode-EPS&&!canBreakOut(state,fairlead,anchorPoint);
      operation=loaded?'blocked':'retrieving';if(loaded)reason='rode-loaded';
    }
  }
  return {status,deployed,captured:seabedContact,seabedContact,fairlead,anchorPoint,seabedPoint,anchorDepth,
    rode,targetRode,operation,reason,vertical,scope,swingRadius,distance:horizontalDistance,shortScope,reachesBottom,
    tension:taut?Math.max(0,state.anchorTension??0):0,adjustmentPending:deployed&&state.anchorWinchRunning&&Math.abs(targetRode-rode)>EPS};
}

export function anchorStatusText(snapshot) {
  if(snapshot.status==='stowed')return 'Stowed';
  if(snapshot.operation==='blocked')return 'Retrieval blocked · unload rode';
  if(snapshot.operation==='lowering')return 'Lowering anchor';
  if(snapshot.operation==='retrieving')return 'Retrieving anchor';
  if(snapshot.status==='pending')return 'Deployment pending';
  if(snapshot.status==='suspended')return 'Anchor suspended';
  if(snapshot.status==='dragging')return 'Dragging · add scope';
  if(snapshot.shortScope)return 'Short scope · poor holding';
  return snapshot.status==='taut'?'Holding':'Deployed · settling';
}
