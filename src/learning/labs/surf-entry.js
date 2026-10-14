// Lab 13: entering a harbor through breaking waves. Swell rolls in from
// the bottom of the drawing in sets of four, with a long lull between sets. In
// the shallow water before the entrance each wave grows and breaks. The learner
// sets the engine and which way the boat faces; the boat only moves along the
// line to the entrance. This is a teaching model, not part of the full simulator:
// a breaking wave from behind broaches the boat, one on the side rolls it, and
// one on the bow is survived only with the engine pushing.
import {defineLab,TOKENS as C,svgText,hullTop,round} from './kit.js';

// Distances in metres from the entrance; positive is out to sea.
const START=150,SURF=120,SAFE=-25,ORIGIN=440,WAVE_SPEED=8,DURATION=300;
const SET_SIZE=4,WAVE_GAP=10,SET_PERIOD=80,FIRST=-30;
const ENGINE={neutral:0,slow:1,full:3};
const HEADING={in:0,out:180,side:90};
// Seconds of warning the lookout gives before the next breaking wave reaches the boat.
const WARNING=12;

/** Where each wave crest is at time t, with its set and place in the set. */
export function wavesAt(t){
 const waves=[];
 for(let set=0;set<=Math.ceil(DURATION/SET_PERIOD)+1;set++)for(let i=0;i<SET_SIZE;i++){
  const born=FIRST+set*SET_PERIOD+i*WAVE_GAP,y=ORIGIN-WAVE_SPEED*(t-born);
  if(t>=born&&y>SAFE)waves.push({set,index:i,y,breaking:y<=SURF});
 }
 return waves;
}
const height=y=>y>SURF?2:round(2+1.4*Math.min(1,(SURF-y)/60),1);

export function createSurfSim(){
 return {time:0,y:START,result:null,faced:0,passedOutside:0,pushedBack:0,lastHit:null};
}
export function stepSurfSim(sim,dt,settings){
 if(sim.result)return;
 const power=ENGINE[settings.engine]??0,before=wavesAt(sim.time),toward=settings.heading==='in'?-1:settings.heading==='out'?1:0;
 // Inside the surf zone the white water carries a boat without power toward the shore.
 const drift=sim.y<=SURF&&sim.y>0&&power===0?-.6:0;
 sim.y+=(toward*power+drift)*dt;sim.time+=dt;
 const after=wavesAt(sim.time);
 for(const wave of after){
  const prev=before.find(w=>w.set===wave.set&&w.index===wave.index);
  if(!prev||!(prev.y>sim.y&&wave.y<=sim.y))continue;
  if(!wave.breaking){if(sim.y>SURF)sim.passedOutside++;continue;}
  if(sim.y<0)continue;
  sim.lastHit=sim.time;
  if(settings.heading==='side')sim.result='rolled';
  else if(settings.heading==='in')sim.result='broached';
  else if(power===0)sim.result='swung';
  else{sim.faced++;sim.y+=6;}
  if(sim.result)return;
 }
 if(sim.y<=SAFE)sim.result='inside';
}
export const surfDone=sim=>Boolean(sim.result)||sim.time>=DURATION||sim.y>ORIGIN-20;

/** Pure snapshot: where the boat is and what the sea is doing to it. */
export function surfModel(settings,sim){
 sim??=createSurfSim(settings);
 const waves=wavesAt(sim.time),power=ENGINE[settings.engine]??0,y=sim.y;
 const behind=waves.filter(w=>w.y>y);
 // Time until the next wave reaches the boat, if it will be breaking there.
 const next=behind.length?Math.min(...behind.map(w=>w.y)):null;
 const closing=WAVE_SPEED-(settings.heading==='in'?power:settings.heading==='out'?-power:0);
 const eta=next===null?null:(next-y)/Math.max(1,closing);
 const inSurf=y<=SURF&&y>0;
 const justFaced=sim.lastHit!==null&&sim.time-sim.lastHit<4&&!sim.result;
 let status;
 if(sim.result)status=sim.result;
 else if(sim.time>=DURATION)status='timeUp';
 else if(y<=0)status='entrance';
 else if(justFaced)status='faced';
 else if(inSurf&&settings.heading!=='out'&&eta!==null&&eta<=WARNING)status='setComing';
 else if(inSurf&&settings.heading==='out'&&power>0)status='facing';
 else if(inSurf&&power===0)status='drifting';
 else if(inSurf)status='inSurf';
 else if(behind.some(w=>w.y-y<30)||waves.some(w=>!w.breaking&&Math.abs(w.y-y)<15))status='swellPass';
 else if(settings.heading==='in'&&power>0)status='approaching';
 else status='waiting';
 return {status,time:sim.time,y,engine:settings.engine,heading:settings.heading,power,waves,inSurf,eta,faced:sim.faced,passedOutside:sim.passedOutside,result:sim.result,waveHeight:height(Math.max(y,0))};
}

const PX=260,py=y=>110+y*.8;
function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="520" height="470" rx="16" fill="${C.water}"/>`;
 // Shallow water before the entrance is lighter; the surf zone is where waves break.
 body+=`<rect x="0" y="${py(SURF)}" width="520" height="${round(470-py(SURF))}" fill="#b9d1d0"/>`;
 body+=`<rect x="0" y="${py(0)}" width="520" height="${round(py(SURF)-py(0))}" fill="#eef5f2" data-lab-part="surf-zone"/>`;
 body+=svgText(500,py(SURF)-6,t('surf-entry.surfZone'),{size:12,anchor:'end',fill:C.muted,lang,weight:600});
 // Harbor basin, shore and the two breakwater arms with a gap for the entrance.
 body+=`<rect x="0" y="0" width="520" height="34" fill="${C.seabed}"/>`;
 body+=`<rect x="0" y="34" width="520" height="${round(py(0)-34)}" fill="${C.water}"/>`;
 body+=svgText(260,24,t('surf-entry.harbor'),{size:12,fill:C.ink,lang,weight:600});
 for(const [x1,x2] of [[0,232],[288,520]])body+=`<rect data-lab-part="breakwater" x="${x1}" y="${py(0)-12}" width="${x2-x1}" height="16" rx="5" fill="#8f8a7d" stroke="#5f5b52" stroke-width="2"/>`;
 // Wave crests: blue lines while they are swell, broad white foam once they break.
 for(const w of m.waves){
  const y=round(py(w.y),1);
  if(w.y<0)continue;
  body+=w.breaking
   ?`<path data-lab-part="breaker" d="M0 ${y}Q65 ${y-7} 130 ${y}T260 ${y}T390 ${y}T520 ${y}" stroke="#ffffff" stroke-width="9" fill="none" opacity=".95"/><path d="M0 ${y+6}H520" stroke="#ffffff" stroke-width="3" stroke-dasharray="6 9" opacity=".7"/>`
   :`<path data-lab-part="swell" d="M0 ${y}Q65 ${y-4} 130 ${y}T260 ${y}T390 ${y}T520 ${y}" stroke="${C.keel}" stroke-width="3" fill="none" opacity=".55"/>`;
 }
 // Light panels keep the labels readable over the wave lines.
 body+=`<rect x="24" y="384" width="120" height="62" rx="8" fill="#ffffff" opacity=".7"/><rect x="336" y="410" width="174" height="46" rx="8" fill="#ffffff" opacity=".7"/>`;
 // The waves travel toward the shore, up the drawing.
 body+=`<path d="M40 440V400" stroke="${C.keel}" stroke-width="3"/><path d="M40 392L33 404H47Z" fill="${C.keel}"/>`+svgText(52,430,t('surf-entry.waveDirection'),{size:12,anchor:'start',fill:C.keel,lang,weight:600});
 const failed=['broached','rolled','swung'].includes(m.status);
 const heading=m.status==='rolled'?90:m.status==='broached'||m.status==='swung'?60:HEADING[m.heading];
 body+=hullTop({x:PX,y:py(m.y),heading,scale:.26,fill:failed?'#f3c6bd':C.hull,stroke:failed?C.danger:C.hullLine});
 if(m.status==='setComing')body+=svgText(PX+30,py(m.y)+4,'!',{size:22,anchor:'start',fill:C.danger,numeric:true});
 body+=svgText(500,446,t('surf-entry.waveHeight',{value:m.waveHeight}),{size:13,anchor:'end',lang,weight:500});
 body+=svgText(500,428,t('surf-entry.distance',{value:Math.max(0,round(m.y))}),{size:13,anchor:'end',lang,weight:500});
 return body;
}

export const surfEntryLab=defineLab({
 id:'surf-entry',viewBox:'0 0 520 470',
 initial:{engine:'neutral',heading:'in'},
 controls:[
  {key:'engine',kind:'choice',live:true,label:'surf-entry.engine',options:[{value:'neutral',label:'surf-entry.neutral'},{value:'slow',label:'surf-entry.slow'},{value:'full',label:'surf-entry.full'}]},
  {key:'heading',kind:'choice',live:true,label:'surf-entry.heading',options:[{value:'in',label:'surf-entry.headIn'},{value:'out',label:'surf-entry.headOut'},{value:'side',label:'surf-entry.headSide'}]},
 ],
 loop:{dt:.1,speed:2,create:createSurfSim,step:stepSurfSim,done:surfDone},
 compute:surfModel,
 draw,
 readout:(m,t)=>t(`surf-entry.${m.status}`),
 tasks:{
  watch:{label:'surf-entry.taskWatch',check:m=>m.passedOutside>=SET_SIZE},
  face:{label:'surf-entry.taskFace',check:m=>m.faced>=1},
  enter:{label:'surf-entry.taskEnter',check:m=>m.status==='inside'},
 },
});
