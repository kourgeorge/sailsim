// Lab 2: live compass and wind. The north-up dial from the app with a movable
// boat and wind. Point of sail and tack come from the simulator's own rules.
import {pointOfSail,angleDifference} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,wedge,polar,svgText,hullTop,ltr,pad3} from './kit.js';

const CX=225,CY=230,R=185,NO_GO=38;
const POINTS={'In irons':'irons','Close hauled':'closeHauled','Close reach':'closeReach','Beam reach':'beam','Broad reach':'broad','Running':'running'};
/** Pure: heading and wind source (both compass bearings) to point of sail and tack. */
export function compassWindModel({heading,windFrom}){
 const angle=angleDifference(windFrom,heading),point=POINTS[pointOfSail(angle)];
 return {status:point,heading:((heading%360)+360)%360,windFrom:((windFrom%360)+360)%360,angle,offWind:Math.abs(angle),tack:point==='irons'?null:angle>0?'starboard':'port'};
}
const bearingText=value=>ltr(`${pad3(value)}°`);

function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="720" height="460" rx="16" fill="${C.water}"/>`;
 body+=`<circle cx="${CX}" cy="${CY}" r="${R}" fill="${C.dial}" stroke="${C.dialLine}" stroke-width="2"/>`;
 for(let b=0;b<360;b+=10){const a=polar(CX,CY,R-4,b),z=polar(CX,CY,R-(b%90===0?18:b%30===0?13:9),b);body+=`<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${z.x.toFixed(1)} ${z.y.toFixed(1)}" stroke="#849fa7" stroke-width="${b%90===0?2.5:1}"/>`;}
 for(const [b,name] of [[0,'N'],[90,'E'],[180,'S'],[270,'W']]){const p=polar(CX,CY,R-36,b);body+=svgText(p.x,p.y+7,name,{size:21,fill:C.dialText,numeric:true});}
 for(const b of [30,60,120,150,210,240,300,330]){const p=polar(CX,CY,R-34,b);body+=svgText(p.x,p.y+5,String(b),{size:12,fill:'#b3c9cf',weight:500,numeric:true});}
 body+=wedge(CX,CY,R-48,m.windFrom-NO_GO,m.windFrom+NO_GO,'#de9f7766','nogo');
 const tip=polar(CX,CY,R-6,m.windFrom),tail=polar(CX,CY,R-120,m.windFrom);
 body+=arrow(tail.x,tail.y,tip.x,tip.y,{color:C.windSoft,width:5,head:16,part:'wind-from'});
 body+=hullTop({x:CX,y:CY,heading:m.heading,scale:.95});
 const bow=polar(CX,CY,92,m.heading);body+=`<circle cx="${bow.x.toFixed(1)}" cy="${bow.y.toFixed(1)}" r="4" fill="${C.dialText}"/>`;
 // Side panel: what the dial means right now.
 const x=575,line=(y,key,value,opts={})=>svgText(x,y,t(key),{size:14,fill:C.muted,weight:500,lang})+svgText(x,y+28,value,{size:22,lang,...opts});
 body+=line(60,'compass-wind.heading',bearingText(m.heading),{numeric:true});
 body+=line(130,'compass-wind.windFrom',bearingText(m.windFrom),{numeric:true,fill:C.wind});
 body+=line(200,'compass-wind.offWind',ltr(`${Math.round(m.offWind)}°`),{numeric:true});
 body+=line(270,'compass-wind.pointLabel',t(`compass-wind.${m.status}`),{size:19});
 body+=line(350,'compass-wind.tackLabel',m.tack?t(`compass-wind.${m.tack}Tack`):t('compass-wind.noTack'),{size:19,fill:m.tack==='port'?C.port:m.tack==='starboard'?C.starboard:C.ink});
 return body;
}

export const compassWindLab=defineLab({
 id:'compass-wind',viewBox:'0 0 720 460',
 initial:{heading:45,windFrom:315},
 controls:[
  {key:'heading',label:'compass-wind.headingControl',min:0,max:355,step:5,wrap:360,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:pad3(v)})},
  {key:'windFrom',label:'compass-wind.windControl',min:0,max:355,step:5,wrap:360,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:pad3(v)})},
 ],
 drag:{key:'heading',cx:CX,cy:CY,toValue:angle=>((angle%360)+360)%360},
 compute:compassWindModel,
 draw,
 readout:(m,t)=>t(m.tack?'compass-wind.readout':'compass-wind.readoutIrons',{heading:bearingText(m.heading),wind:bearingText(m.windFrom),point:t(`compass-wind.${m.status}`).toLocaleLowerCase(),tack:m.tack?t(`compass-wind.${m.tack}Tack`).toLocaleLowerCase():''}),
 tasks:{
  beamPort:{label:'compass-wind.taskBeamPort',check:m=>m.status==='beam'&&m.tack==='port'},
  beamStarboard:{label:'compass-wind.taskBeamStarboard',check:m=>m.status==='beam'&&m.tack==='starboard'},
  edge:{label:'compass-wind.taskEdge',check:m=>m.offWind>=NO_GO&&m.offWind<=45},
  shift:{label:'compass-wind.taskShift',check:(m,s,ctx)=>ctx.events.has('changed:windFrom')&&s.heading===ctx.initial.heading&&m.status!==compassWindModel(ctx.initial).status},
  irons:{label:'compass-wind.taskIrons',check:m=>m.status==='irons'},
 },
});
