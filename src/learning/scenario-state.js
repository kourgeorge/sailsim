import {initialState,refreshDerived} from '../physics.js';
import {initializeAnchoredScenario} from '../anchor.js';

/** Shared authored starting conditions for the app and scenario verifier. */
export function createPracticeState(setup={}){
 const state=Object.assign(initialState(),{x:0,z:0,heading:45,speed:0,rudder:0,trim:34,mainSheet:34,jibSheet:28,sails:1,mainHoist:1,jibHoist:1,reef:false,reefLevel:0,anchor:false,throttle:0,currentSpeed:0,currentDirection:0,windSpeed:12,windDirection:315},setup);
 if(setup.sails!==undefined)state.mainHoist=state.jibHoist=setup.sails;
 if(setup.trim!==undefined)state.mainSheet=setup.trim;
 if(setup.reef!==undefined)state.reefLevel=setup.reef?1:0;
 if(setup.anchor)initializeAnchoredScenario(state,{rode:state.anchorRode});
 return refreshDerived(state);
}
