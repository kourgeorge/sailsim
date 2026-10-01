const RAD=Math.PI/180;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// The traveler control is normalized by tack: positive means ease leeward.
// THREE local +X is starboard, so starboard wind puts boom and car to port.
export function rigVisualState(state) {
 const wind=state.apparentWindAngle??(((state.windDirection-state.heading+540)%360+360)%360-180);
 const side=Math.sign(wind)||1;
 return {
  boomAngle:-side*clamp((state.mainSheet??state.trim??45)+(state.traveler??0),0,90)*RAD,
  travelerX:-side*clamp(state.traveler??0,-20,20)/20,
  windVaneAngle:-wind*RAD,
 };
}

// Matches the original 12% response at 60 Hz, while remaining independent of
// render frequency. A repeated/invalid timestamp must not advance the boom.
export function smoothBoomAngle(current,target,elapsed) {
 if(!Number.isFinite(elapsed)||elapsed<=0)return current;
 const response=1-Math.exp(Math.log(.88)*60*elapsed);
 return current+(target-current)*response;
}
