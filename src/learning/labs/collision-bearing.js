// Lab 9: collision bearing. Two boats on straight courses, north up. A line of
// sight is drawn every 30 seconds; when its direction stays the same while the
// boats get closer, they are on a collision course. Plain kinematics.
import {angleDifference} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,polar,svgText,hullTop,ltr,pad3,round,RAD} from './kit.js';

const OX=200,OY=375,SCALE=170,SIGHT_EVERY=30,STEADY=1.5,CONTACT=.04;
const velocity=(course,knots)=>({x:Math.sin(course*RAD)*knots/3600,y:Math.cos(course*RAD)*knots/3600});
const bearingTo=(from,to)=>((Math.atan2(to.x-from.x,to.y-from.y)/RAD)+360)%360;

/** The other boat starts where it meets the planned own course after meetMinutes. */
export function createEncounter(settings){
 const T=settings.meetMinutes*60,own=velocity(settings.plannedCourse,settings.plannedSpeed),other=velocity(settings.otherCourse,settings.otherSpeed);
 const meet={x:own.x*T,y:own.y*T};
 const sim={t:0,own:{x:0,y:0},other:{x:meet.x-other.x*T,y:meet.y-other.y*T},sightings:[],minRange:Infinity,startCourse:settings.ownCourse,bigTurnRange:null,collided:false};
 sight(sim);return sim;
}
function sight(sim){
 const range=Math.hypot(sim.other.x-sim.own.x,sim.other.y-sim.own.y);
 sim.sightings.push({t:sim.t,bearing:bearingTo(sim.own,sim.other),range,own:{...sim.own},other:{...sim.other}});
}
/** Advances both boats by dt seconds with the learner's current course and speed. */
export function stepEncounter(sim,dt,settings){
 if(sim.collided)return sim;
 const own=velocity(settings.ownCourse,settings.ownSpeed),other=velocity(settings.otherCourse,settings.otherSpeed);
 sim.own.x+=own.x*dt;sim.own.y+=own.y*dt;sim.other.x+=other.x*dt;sim.other.y+=other.y*dt;sim.t+=dt;
 const range=Math.hypot(sim.other.x-sim.own.x,sim.other.y-sim.own.y);
 sim.minRange=Math.min(sim.minRange,range);
 if(range<CONTACT)sim.collided=true;
 if(sim.bigTurnRange===null&&Math.abs(angleDifference(settings.ownCourse,sim.startCourse))>=40)sim.bigTurnRange=range;
 if(sim.t+1e-9>=sim.sightings.at(-1).t+SIGHT_EVERY)sight(sim);
 return sim;
}
export function collisionBearingModel(settings,sim=createEncounter(settings)){
 const own=velocity(settings.ownCourse,settings.ownSpeed),other=velocity(settings.otherCourse,settings.otherSpeed);
 const r={x:sim.other.x-sim.own.x,y:sim.other.y-sim.own.y},v={x:other.x-own.x,y:other.y-own.y},vv=v.x*v.x+v.y*v.y;
 const range=Math.hypot(r.x,r.y),tcpa=vv>0?-(r.x*v.x+r.y*v.y)/vv:0,cpa=tcpa>0?Math.hypot(r.x+v.x*tcpa,r.y+v.y*tcpa):range;
 const recent=sim.sightings.at(-1),earlier=sim.sightings.length>2?sim.sightings.at(-3):null;
 const drift=earlier?angleDifference(recent.bearing,earlier.bearing):null;
 const minRange=Math.min(sim.minRange,range);
 const status=sim.collided?'collision':tcpa<=0&&sim.t>0?(minRange>=.25?'clear':'nearMiss'):drift===null?'watch':Math.abs(drift)<STEADY?'risk':'changing';
 return {status,time:sim.t,own:{...sim.own},other:{...sim.other},ownCourse:settings.ownCourse,ownSpeed:settings.ownSpeed,otherCourse:settings.otherCourse,
  bearing:bearingTo(sim.own,sim.other),range,drift,cpa,tcpa,minRange,sightings:sim.sightings.slice(),bigTurnEarly:sim.bigTurnRange!==null&&sim.bigTurnRange>=1};
}

const toScreen=p=>({x:OX+p.x*SCALE,y:OY-p.y*SCALE});
function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="680" height="440" rx="16" fill="${C.water}"/>`,chart='';
 // Before the run starts, predict the sightings so the still picture teaches the idea.
 let sightings=m.sightings;
 if(history.length<=1&&m.time===0){
  const sim=createEncounter(settings);sightings=[];
  for(let i=0;i<5;i++){sightings.push({...sim.sightings.at(-1)});for(let k=0;k<6;k++)stepEncounter(sim,SIGHT_EVERY,settings);}
  sightings.forEach(s=>{s.predicted=true;});
 }
 sightings.forEach((s,i)=>{
  const prev=sightings[s.predicted?i-1:i-2],steady=prev?Math.abs(angleDifference(s.bearing,prev.bearing))<STEADY&&s.range<prev.range:false;
  const a=toScreen(s.own),b=toScreen(s.other);
  chart+=`<path data-lab-part="sight" data-steady="${steady}" d="M${round(a.x,1)} ${round(a.y,1)}L${round(b.x,1)} ${round(b.y,1)}" stroke="${steady?C.danger:'#5f7f86'}" stroke-width="${steady?2.5:1.5}" opacity="${s.predicted?.55:.85}"${s.predicted?' stroke-dasharray="5 5"':''}/>`;
 });
 const trail=key=>history.length>1?`<path d="M${history.map(f=>{const p=toScreen(f[key]);return `${round(p.x,1)} ${round(p.y,1)}`;}).join('L')}" stroke="${C.ink}" stroke-width="1.5" fill="none" stroke-dasharray="2 4"/>`:'';
 chart+=trail('own')+trail('other');
 const own=toScreen(m.own),other=toScreen(m.other);
 chart+=hullTop({x:own.x,y:own.y,heading:m.ownCourse,scale:.34});
 chart+=hullTop({x:other.x,y:other.y,heading:m.otherCourse,scale:.34,fill:'#f2d7cf',stroke:C.danger});
 const ahead=polar(own.x,own.y,60,m.ownCourse);chart+=arrow(own.x,own.y,ahead.x,ahead.y,{color:C.ink,width:2.5,head:9});
 chart+=svgText(own.x,own.y+42,t('collision-bearing.you'),{size:13,lang});
 chart+=svgText(other.x,other.y-30,t('collision-bearing.other'),{size:13,lang,fill:C.danger});
 body+=`<svg x="0" y="0" width="480" height="440" viewBox="0 0 480 440" overflow="hidden">${chart}</svg>`;
 body+=arrow(455,62,455,24,{color:C.ink,width:2.5,head:9})+svgText(455,80,'N',{size:14,numeric:true});
 const x=580,line=(y,key,value,opts={})=>svgText(x,y,t(key),{size:13,fill:C.muted,weight:500,lang})+svgText(x,y+26,value,{size:20,lang,...opts});
 body+=line(50,'collision-bearing.bearing',ltr(`${pad3(m.bearing)}°`),{numeric:true});
 body+=line(120,'collision-bearing.change',m.drift===null?'—':ltr(`${m.drift>0?'+':''}${round(m.drift,1)}°`),{numeric:true,fill:m.drift!==null&&Math.abs(m.drift)<STEADY?C.danger:C.ink});
 body+=line(190,'collision-bearing.range',ltr(`${round(m.range,2).toFixed(2)} nm`),{numeric:true});
 body+=line(260,'collision-bearing.closest',ltr(`${round(m.cpa,2).toFixed(2)} nm`),{numeric:true,fill:m.cpa<.25?C.danger:C.drive});
 body+=line(330,'kit.time',t('kit.seconds',{value:Math.round(m.time)}),{size:17});
 return body;
}

export const collisionBearingLab=defineLab({
 id:'collision-bearing',viewBox:'0 0 680 440',
 initial:{ownCourse:0,ownSpeed:5,plannedCourse:0,plannedSpeed:5,otherCourse:270,otherSpeed:6,meetMinutes:12},
 controls:[
  {key:'ownCourse',label:'collision-bearing.courseControl',min:0,max:355,step:5,wrap:360,nudge:[-10,10],live:true,format:(v,t)=>t('kit.degrees',{value:pad3(v)})},
  {key:'ownSpeed',label:'collision-bearing.speedControl',min:1,max:8,step:.5,live:true,format:(v,t)=>t('kit.knots',{value:v})},
 ],
 loop:{dt:2,speed:30,create:createEncounter,step:stepEncounter,done:sim=>sim.collided||sim.t>=1200},
 compute:collisionBearingModel,
 draw,
 readout:(m,t)=>t(`collision-bearing.${m.status}`),
 describe:(m,t)=>`${t(`collision-bearing.${m.status}`)} ${t('collision-bearing.describe')}`,
 tasks:{
  spot:{label:'collision-bearing.taskSpot',check:m=>m.status==='risk'},
  bigTurn:{label:'collision-bearing.taskBigTurn',check:m=>m.bigTurnEarly&&(m.status==='changing'||m.status==='clear')},
  clear:{label:'collision-bearing.taskClear',check:m=>m.status==='clear'&&m.minRange>=.4},
 },
});
