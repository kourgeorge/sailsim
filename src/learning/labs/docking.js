// Lab 11: docking forces under engine. The real simulator boat with sails down,
// north up, beside a fixed dock line. The learner gives short bursts ahead or
// astern and moves the helm while it runs: in reverse the propeller walks the
// stern to port, and in a turn the stern swings out the opposite way to the bow.
// Wind across the berth uses hullWindage(), a hull-wind force in the physics
// that only this lab switches on; the course exercises are tuned without it.
import {initialState,step,angleDifference,KNOT} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,polar,svgText,hullTop,ltr,round,RAD} from './kit.js';

const ENGINE={astern:-.6,neutral:0,ahead:.6};
// The dock lies north of the boat: wind from 000° blows off it, from 180° onto it.
const WIND={none:[0,0],offDock:[15,0],onDock:[15,180]};
const CX=260,CY=250,SCALE=9,DURATION=90,STERN=5.2;
export function createDockingSim({speed=0,wind='none'}){
 const s=initialState();s.worldBodies=[];
 Object.assign(s,{x:0,z:0,heading:90,hullWindage:true,windSpeed:(WIND[wind]||WIND.none)[0],windDirection:(WIND[wind]||WIND.none)[1],currentSpeed:0,mainHoist:0,jibHoist:0,speed,leeway:0,rudder:0,yawRate:0,throttle:0});
 return {s,time:0,startHeading:90,peakSpeed:Math.abs(speed),asternFrom:null};
}
export function stepDockingSim(sim,dt,settings){
 const {s}=sim;
 s.throttle=ENGINE[settings.engine];s.rudder=settings.helm;
 [s.windSpeed,s.windDirection]=WIND[settings.wind]||WIND.none;
 // Remember the heading when reverse thrust starts, to measure the walk it causes.
 if(s.throttle<0&&sim.asternFrom===null)sim.asternFrom=s.heading;
 if(s.throttle>=0)sim.asternFrom=null;
 step(s,dt);sim.time+=dt;sim.peakSpeed=Math.max(sim.peakSpeed,Math.abs(s.speed));
}
// The run ends after 90 s or once the boat leaves the drawing.
export const dockingDone=sim=>sim.time>=DURATION||Math.abs(sim.s.x)>26||Math.abs(sim.s.z)>24;
const sternOf=s=>{const h=s.heading*RAD;return {x:s.x-Math.sin(h)*STERN,z:s.z+Math.cos(h)*STERN};};

/** Pure snapshot of the run: which force is showing right now. */
export function dockingModel(settings,sim){
 sim??=createDockingSim(settings);
 const {s}=sim,throttle=ENGINE[settings.engine],rate=s.yawRate,speed=s.speed;
 const walked=sim.asternFrom===null?0:angleDifference(s.heading,sim.asternFrom);
 let status;
 if(throttle<0&&speed>.1)status='braking';
 else if(throttle<0&&speed>-3&&Math.abs(settings.helm)<5)status='walk';
 else if(throttle<0)status='goingAstern';
 else if(settings.wind!=='none'&&Math.abs(speed)<1.2&&Math.abs(rate)>.3)status='blowOff';
 else if(Math.abs(rate)>1&&Math.abs(speed)>.3)status='swing';
 else if(throttle>0)status=Math.abs(settings.helm)>=5?'aheadTurning':'aheadStraight';
 else status=Math.abs(speed)<.1?'atRest':'drift';
 return {status,time:sim.time,speed,turnRate:rate,heading:s.heading,x:s.x,z:s.z,stern:sternOf(s),walked,throttle,helm:settings.helm,peakSpeed:sim.peakSpeed,wind:settings.wind,turned:angleDifference(s.heading,sim.startHeading)};
}

function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="520" height="470" rx="16" fill="${C.water}"/>`;
 // Dock along the north side of the start position, fixed to the water.
 const dockY=CY-SCALE*9;
 body+=`<rect data-lab-part="dock" x="20" y="${dockY-26}" width="480" height="22" fill="${C.seabed}" stroke="#8a7350" stroke-width="2"/>`;
 for(let x=50;x<500;x+=70)body+=`<rect x="${x}" y="${dockY-8}" width="10" height="8" fill="#5c4a33"/>`;
 body+=svgText(260,dockY-10,t('docking.dock'),{size:12,fill:C.ink,lang,weight:600});
 const px=x=>CX+x*SCALE,py=z=>CY+z*SCALE;
 // Trails: the boat's centre (grey) and its stern (red), so the stern swing is visible.
 const trail=(key,color,dash)=>{const points=history.filter((_,i)=>i%3===0||i===history.length-1).map(f=>key?f[key]:f).map(p=>`${round(px(p.x),1)},${round(py(p.z),1)}`);return points.length>1?`<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5"${dash?` stroke-dasharray="${dash}"`:''} opacity=".85"/>`:'';};
 body+=trail(null,C.muted,'5 5')+trail('stern',C.port,'');
 body+=hullTop({x:px(m.x),y:py(m.z),heading:m.heading,scale:SCALE*11.85/124});
 const stern=m.stern;body+=`<circle data-lab-part="stern" cx="${round(px(stern.x),1)}" cy="${round(py(stern.z),1)}" r="5" fill="${C.port}"/>`;
 // Prop-walk arrow at the stern while it acts: stern pushed to port of the boat.
 if(m.status==='walk'){
  const left=(m.heading-90)*RAD,sx=px(stern.x),sy=py(stern.z);
  body+=arrow(sx,sy,sx+Math.sin(left)*40,sy-Math.cos(left)*40,{color:C.side,width:5,part:'prop-walk'});
 }
 if(m.throttle!==0){
  const back=(m.heading+(m.throttle>0?180:0))*RAD,sx=px(stern.x),sy=py(stern.z);
  body+=arrow(sx,sy,sx+Math.sin(back)*28,sy-Math.cos(back)*28,{color:C.keel,width:4,part:'propwash'});
 }
 if(m.wind!=='none'){const down=m.wind==='offDock';body+=arrow(70,down?190:330,70,down?260:260,{color:C.wind,width:5,part:'wind'})+svgText(70,down?280:350,t('docking.windArrow'),{size:12,fill:C.wind,lang});}
 body+=svgText(500,40,t('kit.knots',{value:round(m.speed,1).toFixed(1)}),{size:20,anchor:'end',numeric:true});
 body+=svgText(500,62,t(m.speed<-.05?'docking.movingAstern':m.speed>.05?'docking.movingAhead':'docking.stopped'),{size:12,anchor:'end',fill:C.muted,lang,weight:500});
 body+=svgText(500,440,t('docking.turnRate',{rate:ltr(round(m.turnRate,1).toFixed(1))}),{size:13,anchor:'end',lang,weight:500});
 // Legend.
 body+=`<path d="M24 432H52" stroke="${C.port}" stroke-width="3"/>`+svgText(60,436,t('docking.sternTrail'),{size:12,anchor:'start',lang,weight:500});
 body+=`<path d="M24 452H52" stroke="${C.muted}" stroke-width="2.5" stroke-dasharray="5 5"/>`+svgText(60,456,t('docking.centreTrail'),{size:12,anchor:'start',lang,weight:500});
 return body;
}

export const dockingLab=defineLab({
 id:'docking',viewBox:'0 0 520 470',
 initial:{engine:'neutral',helm:0,speed:0,wind:'none'},
 controls:[
  {key:'engine',kind:'choice',live:true,label:'docking.engine',options:[{value:'astern',label:'docking.astern'},{value:'neutral',label:'docking.neutral'},{value:'ahead',label:'docking.ahead'}]},
  {key:'wind',kind:'choice',live:true,label:'docking.wind',options:[{value:'none',label:'docking.windNone'},{value:'offDock',label:'docking.windOff'},{value:'onDock',label:'docking.windOn'}]},
  {key:'helm',label:'docking.helm',live:true,min:-30,max:30,step:1,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:v>0?`+${v}`:v})},
 ],
 loop:{dt:.1,create:createDockingSim,step:stepDockingSim,done:dockingDone},
 compute:dockingModel,
 draw,
 readout:(m,t)=>t(`docking.${m.status}`),
 tasks:{
  walk:{label:'docking.taskWalk',check:m=>m.status==='walk'&&Math.abs(m.helm)<3&&m.walked>=5},
  blowOff:{label:'docking.taskBlowOff',check:m=>m.wind!=='none'&&Math.abs(m.speed)<1.2&&Math.abs(m.turned)>=10&&m.throttle>=0},
  swing:{label:'docking.taskSwing',check:m=>m.status==='swing'&&m.throttle>0},
  stop:{label:'docking.taskStop',check:(m,s,ctx)=>m.peakSpeed>=.8&&Math.abs(m.speed)<.15&&m.throttle===0&&ctx.history().some(f=>f.throttle<0)},
 },
});
