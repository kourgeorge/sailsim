import { depthAt } from './water-depth.js';

/** Local vessel coordinates: +x starboard, +y up, -z bow. Metres. */
export const BOW_FAIRLEAD=Object.freeze({x:0,y:1.2,z:-6.6});
export function bowFairlead(state) {
  const angle=state.heading*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  return {x:state.x+c*BOW_FAIRLEAD.x-s*BOW_FAIRLEAD.z,y:BOW_FAIRLEAD.y,z:state.z+s*BOW_FAIRLEAD.x+c*BOW_FAIRLEAD.z};
}

/** Pure public geometry. All coordinates are fresh values; no deployment is captured here.
 * Paused control edits preview their geometry; adjustmentPending marks a lifecycle change
 * that will be committed on the next running tick. Decorative hull motion is excluded.
 */
export function anchorSnapshot(state) {
  const fairlead=bowFairlead(state),deployed=Boolean(state.anchor),record=deployed?state._anchor:null;
  const rode=Math.max(0,Math.min(250,Number.isFinite(state.anchorRode)?state.anchorRode:0));
  const wasOnBottom=Boolean(record)&&record.onBottom!==false;
  const lifted=wasOnBottom&&rode<record.depth+BOW_FAIRLEAD.y;
  const anchorDepth=wasOnBottom&&!lifted?record.depth:depthAt(fairlead.x,fairlead.z,state.locationId);
  const vertical=anchorDepth+BOW_FAIRLEAD.y,scope=deployed?rode/vertical:0;
  const reachesBottom=rode>=vertical,seabedContact=deployed&&wasOnBottom&&!lifted;
  const swingRadius=deployed&&reachesBottom?Math.sqrt(Math.max(0,rode*rode-vertical*vertical)):0;
  const seabedPoint=seabedContact?{x:record.x,y:-record.depth,z:record.z}:null;
  const anchorPoint=!deployed||!record?null:seabedPoint?{...seabedPoint}:{x:fairlead.x,y:fairlead.y-Math.min(rode,vertical),z:fairlead.z};
  const distance=seabedPoint?Math.hypot(fairlead.x-seabedPoint.x,fairlead.z-seabedPoint.z):0;
  const taut=seabedContact&&distance>=swingRadius-.2;
  const shortScope=deployed&&scope<3;
  const dragging=taut&&shortScope&&Boolean(state.anchorDragging);
  const status=!deployed?'stowed':!record?'pending':!seabedContact?'suspended':dragging?'dragging':taut?'taut':'slack';
  return {status,deployed,captured:seabedContact,seabedContact,fairlead,anchorPoint,seabedPoint,anchorDepth,
    rode,vertical,scope,swingRadius,distance,shortScope,reachesBottom,tension:taut?Math.max(0,state.anchorTension??0):0,
    adjustmentPending:deployed&&(!record||lifted||(!wasOnBottom&&reachesBottom))};
}

/** Compatibility labels for existing instruments and lesson evidence. */
export function anchorStatusText(snapshot) {
  if(snapshot.status==='stowed')return 'Stowed';
  if(snapshot.status==='pending')return 'Deployment pending';
  if(snapshot.status==='suspended')return snapshot.reachesBottom?'Deployment pending':'Rode too short';
  if(snapshot.status==='dragging')return 'Dragging · add scope';
  if(snapshot.shortScope)return 'Short scope · poor holding';
  return snapshot.status==='taut'?'Holding':'Deployed · settling';
}
