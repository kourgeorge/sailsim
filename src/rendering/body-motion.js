// Cosmetic motion is applied on top of solver positions, never fed back into
// collision geometry. The impulse reaction decays in simulation time, so pause
// freezes an impact rather than replaying it on every animation frame.
export function impactMotion(body,elapsed) {
  const impact=body.lastImpact;
  if(!impact)return{roll:0,pitch:0};
  const age=elapsed-impact.time;
  if(age<0||age>2)return{roll:0,pitch:0};
  const angle=body.heading*Math.PI/180,dx=impact.point.x-body.x,dz=impact.point.z-body.z;
  const side=Math.cos(angle)*dx+Math.sin(angle)*dz;
  const aft=-Math.sin(angle)*dx+Math.cos(angle)*dz;
  const strength=Math.min(.085,impact.impulse/Math.max(400,body.mass)*.035);
  const wave=Math.sin(age*13+.25)*Math.exp(-age*2.8)*strength;
  return{roll:-Math.sign(side)*wave,pitch:Math.sign(aft)*wave*.6};
}

export function syncBodyTransform(group,body,elapsed,time,index=0) {
  const impact=impactMotion(body,elapsed),buoy=body.visual?.type==='buoy';
  group.position.set(body.x,Math.sin(time*(buoy?1.2:.9)+index)*(buoy?.07:.045),body.z);
  group.rotation.set(impact.pitch,-body.heading*Math.PI/180,
    Math.sin(time*(buoy?.9:.7)+index)*(buoy?.045:.009)+impact.roll);
}
