// Lab 7: current and track. Chart view, north up. The boat motors at a fixed
// speed through the water; the learner sets the heading and where the current
// flows toward, and sees where the boat actually goes over the ground.
import {groundVelocity,angleDifference,KNOT} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,polar,svgText,hullTop,ltr,pad3,round,RAD} from './kit.js';

const SX=80,SY=235,SPAN=360;
/** Pure: heading, water speed and current to ground track and closest approach to a mark due east. */
export function currentTrackModel({heading,waterSpeed,currentSpeed,currentDirection,markDistance}){
 const v=groundVelocity({heading,speed:waterSpeed,leeway:0,currentSpeed,currentDirection,grounded:false});
 const east=v.x/KNOT,north=-v.z/KNOT,sog=Math.hypot(east,north);
 const course=sog>1e-9?((Math.atan2(east,north)/RAD)+360)%360:heading;
 // Mark at markDistance nautical miles, bearing 090° from the start.
 const along=sog>1e-9?(markDistance*east)/sog:0,hours=sog>1e-9?(markDistance*east)/(sog*sog):0;
 const miss=hours>0?Math.hypot(markDistance-east*hours,-north*hours):markDistance;
 const tolerance=Math.max(.05,markDistance*.02);
 const drift=Math.abs(angleDifference(course,heading));
 const status=hours<=0||along<=0?'away':miss<=tolerance?(drift>=2?'reachCrab':'reach'):'miss';
 return {status,heading:((heading%360)+360)%360,course,sog,waterSpeed,currentSpeed,currentDirection:((currentDirection%360)+360)%360,markDistance,hours,miss,drift,tolerance};
}
const bearing=value=>ltr(`${pad3(value)}°`);
function duration(hours,t){
 const total=Math.round(hours*60),h=Math.floor(total/60),m=total%60;
 return h?t('current-track.hoursMinutes',{h:ltr(h),m:ltr(m)}):t('current-track.minutes',{m:ltr(m)});
}

function draw(m,settings,t,history,lang){
 const scale=SPAN/m.markDistance,mx=SX+SPAN,my=SY;
 let body=`<rect x="0" y="0" width="680" height="440" rx="16" fill="${C.water}"/>`;
 // Chart area, clipped so a long track never spills over the panel.
 let chart='';
 for(let x=20;x<500;x+=40)chart+=`<path d="M${x} 0V440" stroke="${C.waterLine}" stroke-width="1"/>`;
 for(let y=15;y<440;y+=40)chart+=`<path d="M0 ${y}H500" stroke="${C.waterLine}" stroke-width="1"/>`;
 // Current arrows show where the water flows toward.
 if(m.currentSpeed>0)for(const [x,y] of [[60,70],[210,70],[360,70],[60,390],[210,390],[360,390]]){
  const len=18+m.currentSpeed*14,a=polar(x,y,len/2,m.currentDirection+180),b=polar(x,y,len/2,m.currentDirection);
  chart+=arrow(a.x,a.y,b.x,b.y,{color:C.keel,width:3,head:9,part:'current'});
 }
 chart+=`<path d="M${SX} ${SY}H${mx}" stroke="${C.muted}" stroke-width="2" stroke-dasharray="3 7"/>`;
 // Ground track: where the boat really goes.
 const reach=Math.max(m.markDistance*1.6,1)*scale,end=polar(SX,SY,reach,m.course);
 chart+=`<path data-lab-part="track" d="M${SX} ${SY}L${round(end.x,1)} ${round(end.y,1)}" stroke="${m.status==='miss'||m.status==='away'?C.danger:C.drive}" stroke-width="4" stroke-dasharray="10 6"/>`;
 if(m.hours>0){
  const close=polar(SX,SY,m.sog*m.hours*scale,m.course);
  chart+=`<circle cx="${round(close.x,1)}" cy="${round(close.y,1)}" r="5" fill="${C.ink}"/>`;
  if(m.status==='miss')chart+=`<path d="M${round(close.x,1)} ${round(close.y,1)}L${mx} ${my}" stroke="${C.danger}" stroke-width="2" stroke-dasharray="2 4"/>`;
 }
 chart+=`<circle data-lab-part="mark" cx="${mx}" cy="${my}" r="12" fill="#e98a2e" stroke="${C.ink}" stroke-width="2"/><circle cx="${mx}" cy="${my}" r="${round(m.tolerance*scale+12,1)}" fill="none" stroke="#e98a2e" stroke-width="1.5" stroke-dasharray="4 4"/>`;
 const bow=polar(SX,SY,95,m.heading);
 chart+=arrow(SX,SY,bow.x,bow.y,{color:C.ink,width:4,part:'bow'});
 chart+=hullTop({x:SX,y:SY,heading:m.heading,scale:.42});
 chart+=svgText(mx,my+40,t('current-track.mark'),{size:13,lang});
 body+=`<svg x="0" y="0" width="500" height="440" viewBox="0 0 500 440" overflow="hidden">${chart}</svg>`;
 body+=arrow(470,70,470,30,{color:C.ink,width:2.5,head:9})+svgText(470,88,'N',{size:14,numeric:true});
 // Legend and panel.
 body+=`<path d="M20 418H48" stroke="${C.ink}" stroke-width="4"/>`+svgText(56,422,t('current-track.bowKey'),{size:12,anchor:'start',lang,weight:500});
 body+=`<path d="M200 418H228" stroke="${C.drive}" stroke-width="4" stroke-dasharray="8 4"/>`+svgText(236,422,t('current-track.trackKey'),{size:12,anchor:'start',lang,weight:500});
 const x=590,line=(y,key,value,opts={})=>svgText(x,y,t(key),{size:13,fill:C.muted,weight:500,lang})+svgText(x,y+26,value,{size:20,lang,...opts});
 body+=line(50,'current-track.heading',bearing(m.heading),{numeric:true});
 body+=line(120,'current-track.course',bearing(m.course),{numeric:true,fill:C.drive});
 body+=line(190,'current-track.speeds',`${round(m.waterSpeed,1)} / ${round(m.sog,1)} kn`,{numeric:true,size:17});
 body+=line(260,'current-track.current',`${round(m.currentSpeed,1)} kn → ${pad3(m.currentDirection)}°`,{numeric:true,size:17,fill:C.keel});
 body+=line(330,'current-track.time',m.status==='reach'||m.status==='reachCrab'?duration(m.hours,t):'—',{size:17});
 return body;
}

const readout=(m,t)=>t(`current-track.${m.status}`,{heading:bearing(m.heading),course:bearing(m.course),time:duration(m.hours,t),miss:ltr(round(m.miss,2))});
const sets=(m,target,within)=>m.currentSpeed>0&&Math.abs(angleDifference(m.currentDirection,target))<=within;
const reached=m=>m.status==='reach'||m.status==='reachCrab';
export const currentTrackLab=defineLab({
 id:'current-track',viewBox:'0 0 680 440',
 initial:{heading:90,currentDirection:0,currentSpeed:1.5,waterSpeed:5,markDistance:3},
 controls:[
  {key:'heading',label:'current-track.headingControl',min:0,max:359,step:1,wrap:360,nudge:[-1,1],format:(v,t)=>t('kit.degrees',{value:pad3(v)})},
  {key:'currentDirection',label:'current-track.currentControl',min:0,max:345,step:15,wrap:360,nudge:[-15,15],format:(v,t)=>t('kit.degrees',{value:pad3(v)})},
 ],
 compute:currentTrackModel,
 draw,
 readout,
 tasks:{
  cross:{label:'current-track.taskCross',check:m=>reached(m)&&sets(m,0,45)||reached(m)&&sets(m,180,45)},
  against:{label:'current-track.taskAgainst',check:m=>reached(m)&&sets(m,270,30)},
  behind:{label:'current-track.taskBehind',check:m=>reached(m)&&sets(m,90,30)},
  rightAngle:{label:'current-track.taskRightAngle',check:m=>m.heading===90&&m.drift>=5},
 },
});
