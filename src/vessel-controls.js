import { applyAnchorControlPatch } from './anchor.js';
// Apply a control patch atomically, including the original dock's aliases.
export function applyControlPatch(state, patch) {
  const {anchor,anchorRode,anchorWinchRunning,anchorPaidRode,...direct}=patch;
  Object.assign(state,direct);
  applyAnchorControlPatch(state,patch);
  if('trim' in patch && !('mainSheet' in patch))state.mainSheet=patch.trim;
  if('mainSheet' in patch)state.trim=patch.mainSheet;
  if('sails' in patch && !('mainHoist' in patch) && !('jibHoist' in patch)){state.mainHoist=patch.sails?1:0;state.jibHoist=patch.sails?1:0;}
  if('mainHoist' in patch || 'jibHoist' in patch)state.sails=Math.max(state.mainHoist,state.jibHoist);
  if('reef' in patch && !('reefLevel' in patch))state.reefLevel=patch.reef?1:0;
  if('reefLevel' in patch)state.reef=patch.reefLevel>0;
  // Mark synchronized aliases so a later physics tick cannot overwrite independent sail choices.
  state._controls={trim:state.trim,mainSheet:state.mainSheet,sails:state.sails,reef:state.reef,reefLevel:state.reefLevel};
  return state;
}
