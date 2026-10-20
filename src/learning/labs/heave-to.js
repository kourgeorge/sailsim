// Lesson view of the production sailing engine, starting just after the tack.
import {defineLab,TOKENS as C,arrow,polar,svgText,hullTop,ltr,round} from './kit.js';
import {initialState,step,sailDynamics,KNOT,windOverWater} from '../../physics.js';

const CX=250,CY=215;
function createSim(settings){
 const s=Object.assign(initialState(),{x:0,z:1200,heading:50,windDirection:0,windSpeed:12,currentSpeed:0,speed:3.5,sailBalance:true,worldBodies:[],jibSheet:22,jibSide:settings.backed?-1:0,mainSheet:settings.ease,trim:settings.ease,rudder:settings.helm});
 return {s,time:0};
}
export function heaveToModel(settings,sim){
 sim??=createSim(settings);
 const {s}=sim,angle=Math.abs(windOverWater(s).angle),backed=sailDynamics(s).jib.flow==='Backed';
 const speed=Math.hypot(s.speed*KNOT,s.leeway)/KNOT;
 const balanced=backed&&angle>=40&&angle<=70&&speed<=1.5&&Math.abs(s.yawRate)<=.2;
 return {status:!backed?'sailing':balanced?'balanced':angle>=35&&angle<=80?'settling':'unbalanced',time:sim.time,
  x:s.x,z:s.z,heading:s.heading,speed,drift:s.z-1200,backed,ease:settings.ease,helm:settings.helm};
}
function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="500" height="430" rx="16" fill="${C.water}"/>`;
 body+=arrow(CX,34,CX,82,{color:C.wind,width:5,part:'wind'});
 body+=svgText(CX,24,t('heave-to.wind'),{size:12,fill:C.wind,lang});
 // Track of the yacht's leeward drift.
 const pts=history.slice(-600).filter((_,i)=>i%3===0).map(p=>`${round(CX+(p.x-m.x)*2,1)},${round(CY+(p.z-m.z)*2,1)}`);
 if(pts.length>1)body+=`<polyline data-lab-part="drift-trail" points="${pts.join(' ')}" fill="none" stroke="${C.keel}" stroke-width="3" stroke-dasharray="5 5" opacity=".8"/>`;
 const heading=polar(CX,CY,93,m.heading);
 body+=`<path d="M${CX} ${CY}L${round(heading.x,1)} ${round(heading.y,1)}" stroke="${C.ink}" stroke-dasharray="4 4" opacity=".55"/>`;
 body+=hullTop({x:CX,y:CY,heading:m.heading,scale:.83});
 // Backed headsail is drawn to windward; eased main is drawn to leeward.
 const mast=polar(CX,CY,12,m.heading),jib=polar(mast.x,mast.y,43,m.heading+(m.backed?-145:145));
 const boom=polar(mast.x,mast.y,49,m.heading+180-(20+m.ease*48));
 body+=`<path data-lab-part="backed-headsail" d="M${round(mast.x,1)} ${round(mast.y,1)}L${round(jib.x,1)} ${round(jib.y,1)}" stroke="${m.backed?C.wind:C.muted}" stroke-width="5" stroke-dasharray="${m.backed?'0':'5 4'}"/>`;
 body+=`<path data-lab-part="mainsail" d="M${round(mast.x,1)} ${round(mast.y,1)}L${round(boom.x,1)} ${round(boom.y,1)}" stroke="${C.sailLine}" stroke-width="5"/>`;
 body+=arrow(...(()=>{const a=polar(CX,CY,62,m.heading+90);const b=polar(CX,CY,86,m.heading+90);return [a.x,a.y,b.x,b.y]})(),{color:C.side,width:4,part:'leeward-drift'});
 body+=svgText(18,365,t('heave-to.readings',{heading:ltr(Math.round(m.heading)),speed:ltr(round(m.speed,1)),drift:ltr(round(m.drift,1))}),{size:13,anchor:'start',lang,weight:500});
 body+=svgText(250,405,t('kit.seconds',{value:round(m.time,1)}),{size:17,fill:m.status==='balanced'?C.ok:C.ink,lang});
 return body;
}
export const heaveToLab=defineLab({
 id:'heave-to',viewBox:'0 0 500 430',initial:{backed:false,ease:40,helm:-30},
 controls:[
  {key:'backed',kind:'toggle',label:'heave-to.backed'},
  {key:'ease',label:'heave-to.ease',min:0,max:90,step:1,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:Math.round(v)})},
  {key:'helm',label:'heave-to.helm',min:-35,max:35,step:1,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:Math.round(v)})},
 ],
 compute:heaveToModel,draw,readout:(m,t)=>t(`heave-to.${m.status}`),
 describe:(m,t)=>`${t(`heave-to.${m.status}`)} ${t('heave-to.readings',{heading:Math.round(m.heading),speed:round(m.speed,1),drift:round(m.drift,1)})}`,
 loop:{dt:.1,speed:1,create:createSim,step(sim,dt,settings){
  const s=sim.s;
  s.jibSide=settings.backed?-1:0;s.jibSheet=22;
  s.mainSheet=s.trim=settings.ease;s.rudder=settings.helm;
  step(s,dt);
  sim.time+=dt;
 },done:()=>false},
 tasks:{
  balance:{label:'heave-to.taskBalance',check:m=>m.status==='balanced'},
  wait:{label:'heave-to.taskWait',check:(m,s,ctx)=>m.status==='balanced'&&m.time>=15&&m.drift>1},
 },
});
