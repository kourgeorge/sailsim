// Lab 6: apparent wind triangle. Top view, bow up, true wind from the right.
// The true wind plus the breeze made by the boat's own motion add up to the
// apparent wind, which is the wind the sails feel. Uses the simulator's apparentWind().
import {apparentWind} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,svgText,hullTop,ltr,round,RAD} from './kit.js';

const CX=250,CY=255;
/** Pure: boat speed (knots), true wind angle from the bow (0–180°) and speed. */
export function apparentWindModel({boatSpeed,trueAngle,trueSpeed}){
 const aw=apparentWind({windDirection:trueAngle,windSpeed:trueSpeed,heading:0,speed:boatSpeed,leeway:0,currentSpeed:0,currentDirection:0});
 const angle=Math.abs(aw.angle);
 const status=boatSpeed<.25?'still':trueAngle<.5?'headOn':trueAngle>179.5?'downwind':angle<trueAngle-.5?(aw.speed>trueSpeed?'forwardStronger':'forwardWeaker'):'same';
 return {status,boatSpeed,trueAngle,trueSpeed,speed:aw.speed,angle,shift:trueAngle-angle};
}
const params=m=>({speed:ltr(round(m.speed,1)),angle:ltr(Math.round(m.angle)),shift:ltr(Math.round(m.shift)),trueSpeed:ltr(round(m.trueSpeed,1))});
// Air velocity "toward" vector (x right, y down) for wind arriving from a bearing off the bow.
const toward=(from,speed)=>({x:-Math.sin(from*RAD)*speed,y:Math.cos(from*RAD)*speed});

function draw(m,settings,t,history,lang){
 // One scale for all three arrows, so the triangle keeps its true shape.
 const truth=toward(m.trueAngle,m.trueSpeed),motion={x:0,y:m.boatSpeed},moving=m.boatSpeed>=.25;
 // Triangle: true wind A→B, boat-motion wind B→C, apparent wind A→C, meeting at the mast C.
 const c={x:CX,y:CY-35};
 // Largest scale (at most 14 px per knot) that keeps every corner inside the drawing.
 const corners=[{x:0,y:-m.boatSpeed},{x:-truth.x,y:-m.boatSpeed-truth.y}];
 let scale=14;
 for(const p of corners){
  if(p.y<0)scale=Math.min(scale,(c.y-24)/-p.y);if(p.y>0)scale=Math.min(scale,(380-c.y)/p.y);
  if(p.x>0)scale=Math.min(scale,(536-c.x)/p.x);if(p.x<0)scale=Math.min(scale,(c.x-24)/-p.x);
 }
 const b={x:c.x-motion.x*scale,y:c.y-motion.y*scale},a={x:b.x-truth.x*scale,y:b.y-truth.y*scale};
 let body=`<rect x="0" y="0" width="560" height="470" rx="16" fill="${C.water}"/>`;
 body+=hullTop({x:CX,y:CY,scale:1.1});
 if(moving)body+=arrow(a.x,a.y,b.x,b.y,{color:C.keel,width:5,part:'true-wind'});
 if(moving)body+=arrow(b.x,b.y,c.x,c.y,{color:C.muted,width:5,dash:'8 5',part:'motion-wind'});
 body+=arrow(a.x,a.y,c.x,c.y,{color:C.wind,width:6,part:'apparent-wind'});
 // Each label sits just outside its side of the triangle, away from the opposite corner.
 const tag=(p,q,other,key,color)=>{
  const len=Math.hypot(q.x-p.x,q.y-p.y)||1,mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
  let nx=-(q.y-p.y)/len,ny=(q.x-p.x)/len;
  if(nx*(mx-other.x)+ny*(my-other.y)<0){nx=-nx;ny=-ny;}
  if(Math.hypot(mx-other.x,my-other.y)<1){nx=0;ny=-1;}
  const anchor=nx>.35?'start':nx<-.35?'end':'middle';
  return svgText(mx+nx*16,my+ny*16+(ny>.35?10:ny<-.35?-2:5),t(key),{size:13,fill:color,anchor,lang});
 };
 if(moving){body+=tag(a,b,c,'apparent-wind.trueLabel',C.keel);body+=tag(b,c,a,'apparent-wind.motionLabel',C.muted);}
 body+=tag(a,c,b,'apparent-wind.feltLabel',C.wind);
 // Readings along the bottom.
 const cell=(x,key,value,color)=>svgText(x,418,t(key),{size:12,fill:C.muted,weight:500,lang})+svgText(x,444,value,{size:17,fill:color,numeric:true});
 body+=`<rect x="12" y="398" width="536" height="60" rx="10" fill="#ffffffb3"/>`;
 body+=cell(100,'apparent-wind.trueLabel',`${t('kit.knots',{value:round(m.trueSpeed,1)})} · ${Math.round(m.trueAngle)}°`,C.keel);
 body+=cell(280,'apparent-wind.motionLabel',t('kit.knots',{value:round(m.boatSpeed,1)}),C.muted);
 body+=cell(460,'apparent-wind.feltLabel',`${t('kit.knots',{value:round(m.speed,1)})} · ${Math.round(m.angle)}°`,C.wind);
 return body;
}

export const apparentWindLab=defineLab({
 id:'apparent-wind',viewBox:'0 0 560 470',
 initial:{boatSpeed:6,trueAngle:90,trueSpeed:12},
 controls:[
  {key:'boatSpeed',label:'apparent-wind.speedControl',min:0,max:30,step:.5,nudge:[-1,1],format:(v,t)=>t('kit.knots',{value:v})},
  {key:'trueAngle',label:'apparent-wind.angleControl',min:0,max:180,step:5,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:v})},
 ],
 compute:apparentWindModel,
 draw,
 readout:(m,t)=>t(`apparent-wind.${m.status}`,params(m)),
 tasks:{
  speedUp:{label:'apparent-wind.taskSpeedUp',check:(m,s,ctx)=>ctx.events.has('changed:boatSpeed')&&m.trueAngle>=80&&m.trueAngle<=100&&m.boatSpeed>=ctx.initial.boatSpeed+2&&m.status==='forwardStronger'},
  bearAway:{label:'apparent-wind.taskBearAway',check:m=>m.trueAngle>=135&&m.boatSpeed>=3&&m.speed<m.trueSpeed},
  faster:{label:'apparent-wind.taskFaster',check:m=>m.boatSpeed>m.trueSpeed&&m.trueAngle>=90&&m.angle<90},
 },
});
