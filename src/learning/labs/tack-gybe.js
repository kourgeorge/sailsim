// Lab 3: tack and gybe player. A scripted helmsman turns the real simulator
// boat through the wind at a chosen rate. Top view plus a speed graph: on a slow
// tack the boat runs out of speed head to wind (in irons); in a gybe the sails
// stay full and the boom swings across, less far when the sheet is pulled in first.
import {initialState,step,angleDifference,noGoFactor} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,wedge,polar,svgText,hullTop,ltr,round} from './kit.js';

const WIND=0,CX=250,CY=170,DURATION=90,IRONS_SPEED=2;
const RATES={slow:3,normal:12,sharp:35};
const COURSES={tack:{start:45,target:315,turn:-1},gybe:{start:135,target:225,turn:1}};
const settled={},previews={};

// Open deep water, no current, no traffic or land to collide with: only sail, hull and rudder.
function settledState(maneuver){
 if(!settled[maneuver]){
  const s=initialState();s.worldBodies=[];
  Object.assign(s,{x:0,z:100,heading:COURSES[maneuver].start,windDirection:WIND,windSpeed:12,currentSpeed:0,throttle:0,mainSheet:30,trim:30,jibSheet:28});
  for(let i=0;i<600;i++){step(s,.1);trim(s,null);}
  settled[maneuver]=s;
 }
 return structuredClone(settled[maneuver]);
}
// The crew trims to the simulator's suggested sheet, except a mainsheet pulled in before a gybe.
function trim(s,sim){
 const holdIn=sim&&sim.maneuver==='gybe'&&sim.sheetIn&&!sim.completed&&Math.abs(s.apparentWindAngle)>120;
 s.mainSheet=s.trim=holdIn?6:s.suggestedMainSheet;s.jibSheet=s.suggestedJibSheet;
}

export function createTackSim({maneuver,rate,sheetIn}){
 const s=settledState(maneuver),course=COURSES[maneuver];
 const sim={s,maneuver,rate,sheetIn,time:0,completed:false,completedAt:null,irons:false,boom:boomTarget(s),swing:0,swingStart:null,swingAt:null,minSpeed:s.speed,startSpeed:s.speed,turned:0};
 return sim;
}
const boomTarget=s=>-Math.sign(s.apparentWindAngle||1)*s.mainSheet;
export function stepTackSim(sim,dt){
 const {s}=sim,course=COURSES[sim.maneuver],before=s.heading;
 const error=angleDifference(course.target,s.heading);
 if(!sim.completed&&Math.abs(error)<8){sim.completed=true;sim.completedAt=sim.time;}
 s.rudder=sim.completed?Math.max(-35,Math.min(35,error*1.5)):course.turn*RATES[sim.rate];
 step(s,dt);trim(s,sim);
 sim.time+=dt;sim.turned+=angleDifference(s.heading,before)*course.turn;
 sim.minSpeed=Math.min(sim.minSpeed,s.speed);
 const inNoGo=noGoFactor(s.waterWindAngle)<.1;
 if(inNoGo&&s.speed<IRONS_SPEED&&!sim.completed)sim.irons=true;
 // The boom follows the sail to leeward: slowly while it flaps, fast when the wind is behind it.
 const target=boomTarget(s),crossing=Math.sign(target)!==Math.sign(sim.boom)&&Math.abs(sim.boom)>1;
 if(crossing&&sim.swingStart===null)sim.swingStart=sim.boom;
 const speed=(s.mainFlow==='Luffing'?50:220)*dt,delta=target-sim.boom;
 sim.boom+=Math.max(-speed,Math.min(speed,delta));
 if(sim.swingStart!==null&&Math.abs(target-sim.boom)<1){sim.swing=Math.max(sim.swing,Math.abs(sim.boom-sim.swingStart));sim.swingStart=null;sim.swingAt=sim.time;}
}
export const tackDone=sim=>sim.time>=DURATION||(sim.completed&&sim.time-sim.completedAt>=12);

function preview(settings){
 const key=`${settings.maneuver}-${settings.rate}-${settings.sheetIn}`;
 if(!previews[key]){const sim=createTackSim(settings),points=[{time:0,speed:sim.s.speed}];while(!tackDone(sim)){stepTackSim(sim,.1);if(Math.round(sim.time*10)%5===0)points.push({time:sim.time,speed:sim.s.speed});}previews[key]=points;}
 return previews[key];
}

/** Pure snapshot of a run for the drawing and readout. */
export function tackModel(settings,sim){
 sim??=createTackSim(settings);
 const {s}=sim,inNoGo=noGoFactor(s.waterWindAngle)<.1,swinging=sim.swingStart!==null||(sim.swingAt!==null&&sim.time-sim.swingAt<4);
 let status;
 if(sim.maneuver==='tack'){
  status=sim.irons?'irons':sim.completed?'tackDone':inNoGo?'noGo':Math.abs(s.rudder)>=30&&sim.time>0?'braking':'tackStart';
 }else{
  status=swinging?(sim.sheetIn?'boomShort':'boomCross'):sim.completed?'gybeDone':'gybeStart';
 }
 return {status,time:sim.time,maneuver:sim.maneuver,rate:sim.rate,sheetIn:sim.sheetIn,heading:s.heading,speed:s.speed,rudder:s.rudder,
  flow:s.mainFlow,boom:sim.boom,swing:Math.round(sim.swing),completed:sim.completed,irons:sim.irons,minSpeed:sim.minSpeed,startSpeed:sim.startSpeed};
}

function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="520" height="470" rx="16" fill="${C.water}"/>`;
 body+=wedge(CX,CY,112,WIND-38,WIND+38,C.nogo,'nogo');
 body+=svgText(CX,26,t('tack-gybe.wind'),{size:13,fill:C.wind,lang});
 body+=arrow(CX,34,CX,72,{color:C.wind,width:5,part:'wind'});
 body+=svgText(CX+105,96,t('sail-force.zone'),{size:12,fill:C.side,lang,weight:500});
 body+=hullTop({x:CX,y:CY,heading:m.heading,scale:.85});
 // Boom drawn in boat coordinates: positive is to starboard.
 const mast=polar(CX,CY,18,m.heading),tip=polar(mast.x,mast.y,66,m.heading+180-m.boom);
 const flapping=m.flow==='Luffing';
 body+=`<path data-lab-part="boom" data-flapping="${flapping}" d="M${round(mast.x,1)} ${round(mast.y,1)}L${round(tip.x,1)} ${round(tip.y,1)}" stroke="${C.sailLine}" stroke-width="5" stroke-linecap="round"${flapping?' stroke-dasharray="7 4"':''}/>`;
 body+=`<circle cx="${round(mast.x,1)}" cy="${round(mast.y,1)}" r="4.5" fill="${C.ink}"/>`;
 // Rudder at the stern, angled by the helm.
 const post=polar(CX,CY,-51,m.heading),blade=polar(post.x,post.y,20,m.heading+180-m.rudder);
 body+=`<path data-lab-part="rudder" d="M${round(post.x,1)} ${round(post.y,1)}L${round(blade.x,1)} ${round(blade.y,1)}" stroke="${Math.abs(m.rudder)>=30?C.danger:C.keel}" stroke-width="5" stroke-linecap="round"/>`;
 body+=svgText(470,40,t('kit.knots',{value:round(m.speed,1).toFixed(1)}),{size:22,anchor:'end',lang});
 body+=svgText(470,64,t('tack-gybe.helm',{value:ltr(Math.round(Math.abs(m.rudder)))}),{size:13,anchor:'end',fill:C.muted,lang,weight:500});
 if(m.swing)body+=svgText(470,86,t('tack-gybe.swing',{value:ltr(m.swing)}),{size:13,anchor:'end',fill:C.side,lang,weight:500});
 // Speed graph: the faint line is the whole run, the solid line is the run so far.
 const gx=50,gy=300,gw=440,gh=130,maxT=DURATION,maxV=8;
 const point=p=>`${round(gx+Math.min(1,p.time/maxT)*gw,1)} ${round(gy+gh-Math.min(1,Math.max(0,p.speed)/maxV)*gh,1)}`;
 body+=`<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#ffffff80" stroke="${C.waterLine}"/>`;
 body+=`<path d="M${gx} ${round(gy+gh-IRONS_SPEED/maxV*gh,1)}H${gx+gw}" stroke="${C.danger}" stroke-dasharray="4 4" opacity=".6"/>`;
 body+=svgText(gx+gw-4,gy+gh-IRONS_SPEED/maxV*gh-5,t('tack-gybe.ironsLine'),{size:11,anchor:'end',fill:C.danger,lang,weight:500});
 const ghost=preview(settings);
 body+=`<path data-lab-part="speed-preview" d="M${ghost.map(point).join('L')}" fill="none" stroke="${C.muted}" stroke-width="2" opacity=".35"/>`;
 if(history.length>1)body+=`<path data-lab-part="speed" d="M${history.map(point).join('L')}" fill="none" stroke="${C.drive}" stroke-width="3"/>`;
 body+=svgText(gx,gy-8,t('tack-gybe.graph'),{size:13,anchor:'start',lang});
 body+=svgText(gx-6,gy+5,'8',{size:11,anchor:'end',numeric:true,fill:C.muted})+svgText(gx-6,gy+gh+4,'0',{size:11,anchor:'end',numeric:true,fill:C.muted});
 body+=svgText(gx+gw,gy+gh+18,t('kit.seconds',{value:maxT}),{size:11,anchor:'end',fill:C.muted,lang});
 return body;
}

export const tackGybeLab=defineLab({
 id:'tack-gybe',viewBox:'0 0 520 470',
 initial:{maneuver:'tack',rate:'normal',sheetIn:false},
 controls:[
  {key:'maneuver',kind:'choice',label:'tack-gybe.maneuver',options:[{value:'tack',label:'tack-gybe.tack'},{value:'gybe',label:'tack-gybe.gybe'}]},
  {key:'rate',kind:'choice',label:'tack-gybe.rate',options:[{value:'slow',label:'tack-gybe.slow'},{value:'normal',label:'tack-gybe.normal'},{value:'sharp',label:'tack-gybe.sharp'}]},
  {key:'sheetIn',kind:'toggle',label:'tack-gybe.sheetIn'},
 ],
 loop:{dt:.1,speed:3,create:createTackSim,step:stepTackSim,done:tackDone},
 compute:tackModel,
 draw,
 readout:(m,t)=>t(`tack-gybe.${m.status}`,{swing:ltr(m.swing)}),
 tasks:{
  tack:{label:'tack-gybe.taskTack',check:m=>m.maneuver==='tack'&&m.completed},
  irons:{label:'tack-gybe.taskIrons',check:m=>m.irons},
  gybe:{label:'tack-gybe.taskGybe',check:m=>m.maneuver==='gybe'&&!m.sheetIn&&m.completed&&m.swing>0},
  gybeSheet:{label:'tack-gybe.taskGybeSheet',check:m=>m.maneuver==='gybe'&&m.sheetIn&&m.completed&&m.swing>0},
 },
});
