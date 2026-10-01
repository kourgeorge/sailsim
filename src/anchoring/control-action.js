import {anchorSnapshot} from '../anchor.js';

/** The dock shortcut always provides a stop while the windlass is running. */
export function anchorControlAction(state){
 const snapshot=anchorSnapshot(state);
 if(!snapshot.deployed)return {label:'Drop anchor',patch:{anchor:true},needsTarget:snapshot.targetRode<=0};
 if(state.anchorWinchRunning)return {label:'Stop windlass',patch:{anchorWinchRunning:false}};
 if(Math.abs(snapshot.targetRode-snapshot.rode)>1e-6)return {label:'Resume windlass',patch:{anchorWinchRunning:true}};
 return {label:'Weigh anchor',patch:{anchor:false}};
}
