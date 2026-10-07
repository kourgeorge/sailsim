// Lab 10: lights and leading line, as three small labs that share one string file.
// (a) lights-aspect: which navigation lights you see from each angle (COLREGs Rule 21).
// (b) lights-leading: front and rear leading lights moving apart and lining up.
// (c) lights-flash: a light's character played against a timer.
import {angleDifference} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,wedge,polar,svgText,hullTop,ltr,round,RAD} from './kit.js';

// Rule 21 arcs, measured from the vessel's bow: sidelights 112.5° each side,
// sternlight 135° astern, masthead light 225° ahead.
export const SECTORS=Object.freeze({side:112.5,masthead:112.5});
/** Pure: `aspect` is the angle from the other vessel's bow round to you, clockwise. */
export function visibleLights(aspect,vessel='sailing'){
 const r=angleDifference(aspect,0),a=Math.abs(r);
 return {green:r>=0&&r<=SECTORS.side,red:r<=0&&r>=-SECTORS.side,stern:a>=SECTORS.side,masthead:vessel==='power'&&a<=SECTORS.masthead};
}
export function lightsAspectModel({aspect,vessel}){
 const lights=visibleLights(aspect,vessel);
 const status=lights.red&&lights.green?'headOn':lights.green&&lights.stern?'edgeGreen':lights.red&&lights.stern?'edgeRed':lights.green?'green':lights.red?'red':'stern';
 return {status,aspect:((aspect%360)+360)%360,vessel,lights};
}
function drawAspect(m,settings,t,history,lang){
 const cx=190,cy=180,heading=180-m.aspect;
 let body=`<rect x="0" y="0" width="680" height="440" rx="16" fill="${C.water}"/>`;
 body+=wedge(cx,cy,120,heading,heading+112.5,'#2a8a3e44','green-sector')+wedge(cx,cy,120,heading-112.5,heading,'#c8352b44','red-sector')+wedge(cx,cy,120,heading+112.5,heading+247.5,'#ffffff88','stern-sector');
 if(m.vessel==='power'){const p=polar(cx,cy,140,heading-112.5),q=polar(cx,cy,140,heading+112.5);body+=`<path data-lab-part="masthead-sector" d="M${round(p.x,1)} ${round(p.y,1)}A140 140 0 1 1 ${round(q.x,1)} ${round(q.y,1)}" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 5"/>`;}
 body+=hullTop({x:cx,y:cy,heading,scale:.6,fill:'#f2d7cf',stroke:C.danger});
 body+=svgText(cx,30,t('lights-aspect.other'),{size:13,lang});
 // You, looking at it from the south.
 body+=`<path d="M${cx} ${cy+40}V${cy+190}" stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="4 5"/>`+hullTop({x:cx,y:405,scale:.32});
 body+=svgText(cx+50,410,t('lights-aspect.you'),{size:13,lang});
 // Night view: what you see, laid out as you see it (no mirroring in any language).
 body+=`<rect x="380" y="60" width="270" height="250" rx="12" fill="#0f2430"/>`+svgText(515,48,t('lights-aspect.night'),{size:13,lang,fill:C.muted});
 const h=heading*RAD,place=(across,along)=>515+(Math.cos(h)*across-Math.sin(h)*along)*1.6;
 const light=(on,x,y,color,part)=>on?`<circle data-lab-part="${part}" cx="${round(x,1)}" cy="${y}" r="9" fill="${color}"/><circle cx="${round(x,1)}" cy="${y}" r="18" fill="${color}" opacity=".25"/>`:'';
 body+=light(m.lights.red,place(-28,-10),230,'#ff4a3d','red-light')+light(m.lights.green,place(28,-10),230,'#43e06a','green-light')+light(m.lights.stern,place(0,55),222,'#ffffff','stern-light')+light(m.lights.masthead,place(0,-20),150,'#ffffff','masthead-light');
 const names=[['red','lights-aspect.redName'],['green','lights-aspect.greenName'],['stern','lights-aspect.sternName'],['masthead','lights-aspect.mastheadName']].filter(([k])=>m.lights[k]).map(([,key])=>t(key)).join(' · ');
 body+=svgText(515,290,names,{size:13,lang,fill:'#e3eeeb',weight:500});
 body+=svgText(515,345,t('lights-aspect.angle',{angle:ltr(Math.round(m.aspect))}),{size:15,lang});
 return body;
}
export const lightsAspectLab=defineLab({
 id:'lights-aspect',viewBox:'0 0 680 440',
 initial:{aspect:0,vessel:'sailing'},
 controls:[
  {key:'aspect',label:'lights-aspect.aspectControl',min:0,max:355,step:5,wrap:360,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:Math.round(v)})},
  {kind:'choice',key:'vessel',label:'lights-aspect.vesselControl',options:[{value:'sailing',label:'lights-aspect.sailing'},{value:'power',label:'lights-aspect.power'}]},
 ],
 drag:{key:'aspect',cx:190,cy:180,toValue:angle=>((180-angle)%360+360)%360},
 compute:lightsAspectModel,draw:drawAspect,
 readout:(m,t)=>`${t(`lights-aspect.${m.status}`)}${m.lights.masthead?` ${t('lights-aspect.mastheadNote')}`:''}`,
 tasks:{
  sternOnly:{label:'lights-aspect.taskStern',check:m=>m.status==='stern'},
  headOn:{label:'lights-aspect.taskHeadOn',check:m=>m.status==='headOn'},
  redOnly:{label:'lights-aspect.taskRed',check:m=>m.status==='red'},
  power:{label:'lights-aspect.taskPower',check:m=>m.vessel==='power'&&m.lights.masthead&&m.status!=='headOn'},
 },
});

const FRONT_HEIGHT=8,REAR_HEIGHT=30,REAR_BEHIND=400,ON_LINE=.05;
/** Pure: offset in metres (+ = right of the line, facing the lights) and distance to the front light. */
export function leadingLineModel({offset,distance}){
 const front=Math.atan2(-offset,distance)/RAD,rear=Math.atan2(-offset,distance+REAR_BEHIND)/RAD;
 const split=rear-front,status=Math.abs(split)<ON_LINE?'onLine':split>0?'rearRight':'rearLeft';
 return {status,offset,distance,front,rear,split,frontUp:Math.atan2(FRONT_HEIGHT,distance)/RAD,rearUp:Math.atan2(REAR_HEIGHT,distance+REAR_BEHIND)/RAD};
}
function drawLeading(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="680" height="440" rx="16" fill="${C.water}"/>`;
 // Chart: lights to the north, the leading line running south from them.
 const lx=170,frontY=110,metres=.12,scaleY=Math.min(.18,230/m.distance);
 body+=`<rect x="20" y="20" width="300" height="60" fill="#d8c9a3"/>`+svgText(170,40,t('lights-leading.shore'),{size:12,lang,fill:C.muted});
 body+=`<path data-lab-part="line" d="M${lx} 60V420" stroke="${C.drive}" stroke-width="2" stroke-dasharray="8 6"/>`;
 body+=`<circle cx="${lx}" cy="${frontY}" r="7" fill="#f2c200" stroke="${C.ink}"/><circle cx="${lx}" cy="58" r="7" fill="#f2c200" stroke="${C.ink}"/>`;
 body+=svgText(lx+14,frontY+4,t('lights-leading.front'),{size:12,anchor:'start',lang})+svgText(lx+14,62,t('lights-leading.rear'),{size:12,anchor:'start',lang});
 const by=Math.min(400,frontY+m.distance*scaleY),bx=lx+m.offset*metres*6;
 body+=hullTop({x:bx,y:by,scale:.3})+svgText(bx,by+34,t('lights-leading.you'),{size:12,lang});
 // Eye view: looking along the line toward the lights; up is up, right is right.
 body+=`<rect x="360" y="60" width="300" height="250" rx="12" fill="#0f2430"/>`+svgText(510,48,t('lights-leading.view'),{size:13,lang,fill:C.muted});
 body+=`<path d="M360 260H660" stroke="#33505c" stroke-width="2"/><path d="M510 70V255" stroke="#33505c" stroke-dasharray="3 6"/>`;
 // Centred on the front light: the rear light's sideways split is what you steer by.
 const px=deg=>510+Math.max(-140,Math.min(140,(deg-m.front)*60)),py=deg=>245-deg*50;
 const lamp=(x,y,part)=>`<circle data-lab-part="${part}" cx="${round(x,1)}" cy="${round(y,1)}" r="8" fill="#ffe25c"/><circle cx="${round(x,1)}" cy="${round(y,1)}" r="16" fill="#ffe25c" opacity=".25"/>`;
 body+=lamp(px(m.front),py(m.frontUp),'front-light')+lamp(px(m.rear),py(m.rearUp),'rear-light');
 if(m.status!=='onLine'){const y=py(m.rearUp)-26;body+=arrow(px(m.front),y,px(m.rear),y,{color:'#ffe25c',width:2,head:8});}
 body+=svgText(510,345,t('lights-leading.offset',{offset:ltr(Math.abs(Math.round(m.offset))),side:t(m.offset>0?'lights-leading.right':m.offset<0?'lights-leading.left':'lights-leading.centre')}),{size:15,lang});
 return body;
}
export const leadingLineLab=defineLab({
 id:'lights-leading',viewBox:'0 0 680 440',
 initial:{offset:40,distance:600},
 controls:[
  {key:'offset',label:'lights-leading.offsetControl',min:-100,max:100,step:5,nudge:[-5,5],format:(v,t)=>t('kit.metres',{value:v>0?`+${v}`:v})},
  {key:'distance',label:'lights-leading.distanceControl',min:200,max:1500,step:50,format:(v,t)=>t('kit.metres',{value:v})},
 ],
 compute:leadingLineModel,draw:drawLeading,
 readout:(m,t)=>t(`lights-leading.${m.status}`),
 tasks:{
  onLine:{label:'lights-leading.taskOnLine',check:m=>m.status==='onLine'},
  left:{label:'lights-leading.taskLeft',check:m=>m.status==='rearLeft'&&m.offset<=-20},
  closer:{label:'lights-leading.taskCloser',check:(m,s,ctx)=>m.status!=='onLine'&&m.distance<=300&&ctx.events.has('changed:distance')},
 },
});

// Light characters: on-intervals within one period, in seconds.
export const CHARACTERS=Object.freeze({
 'fl6':{label:'Fl W 6s',period:6,on:[[0,.6]]},
 'fl2':{label:'Fl(2) W 10s',period:10,on:[[0,.6],[1.6,2.2]]},
 'iso4':{label:'Iso W 4s',period:4,on:[[0,2]]},
 'oc5':{label:'Oc W 5s',period:5,on:[[0,4]]},
 'q':{label:'Q W',period:1,on:[[0,.4]]},
});
export const lightOn=(character,time)=>{const c=CHARACTERS[character],phase=((time%c.period)+c.period)%c.period;return c.on.some(([a,b])=>phase>=a&&phase<b);};
export function lightsFlashModel({character},sim={t:0}){
 const c=CHARACTERS[character],on=lightOn(character,sim.t);
 return {status:on?'on':'off',character,time:sim.t,period:c.period,cycles:sim.t/c.period,phase:((sim.t%c.period)+c.period)%c.period,watched:sim.watched||{}};
}
function drawFlash(m,settings,t,history,lang){
 const c=CHARACTERS[m.character];
 let body=`<rect x="0" y="0" width="680" height="440" rx="16" fill="#0f2430"/>`;
 // Lighthouse and its beam.
 body+=`<path d="M150 330L165 150H215L230 330Z" fill="#e8e2d2"/><path d="M165 200H215M162 250H218M158 300H222" stroke="#c8352b" stroke-width="12"/><rect x="168" y="120" width="44" height="30" rx="4" fill="#33505c"/><path d="M155 120H225L190 95Z" fill="#33505c"/><path d="M60 330H330" stroke="#33505c" stroke-width="3"/>`;
 if(m.status==='on')body+=`<g data-lab-part="beam"><circle cx="190" cy="135" r="34" fill="#ffffff" opacity=".35"/><circle cx="190" cy="135" r="13" fill="#ffffff"/></g>`;
 else body+=`<circle cx="190" cy="135" r="9" fill="#46616b"/>`;
 body+=svgText(500,90,c.label,{size:34,fill:'#ffffff',numeric:true});
 {const words=t(`lights-flash.${m.character}`).split(' '),lines=[''];for(const w of words){if(lines.at(-1)&&(lines.at(-1)+' '+w).length>30)lines.push(w);else lines[lines.length-1]=(lines.at(-1)+' '+w).trim();}
 lines.forEach((line,i)=>{body+=svgText(500,122+i*17,line,{size:14,fill:'#cfe0e2',lang,weight:500});});}
 body+=svgText(500,190,t('kit.seconds',{value:round(m.phase,1).toFixed(1)}),{size:28,fill:'#ffe25c',numeric:true});
 body+=svgText(500,220,t('lights-flash.inCycle'),{size:13,fill:'#cfe0e2',lang,weight:500});
 // Timeline of two periods with the current moment marked.
 const x0=60,w=560,y=380,span=c.period*2,sx=s=>x0+s/span*w;
 body+=`<rect x="${x0}" y="${y-12}" width="${w}" height="24" fill="#1d3a46" rx="4"/>`;
 for(const k of [0,1])for(const [a,b] of c.on)body+=`<rect data-lab-part="on" x="${round(sx(k*c.period+a),1)}" y="${y-12}" width="${round(sx(b-a)-x0,1)}" height="24" fill="#ffffff"/>`;
 for(let s=0;s<=span+1e-9;s+=c.period>2?1:.5)body+=`<path d="M${round(sx(s),1)} ${y+14}v6" stroke="#8ba1a8"/>`;
 body+=svgText(sx(c.period),y+38,t('kit.seconds',{value:c.period}),{size:12,fill:'#8ba1a8',numeric:true});
 const cursor=sx(((m.time%span)+span)%span);
 body+=`<path d="M${round(cursor,1)} ${y-22}V${y+22}" stroke="#ffe25c" stroke-width="3"/>`;
 return body;
}
export const lightsFlashLab=defineLab({
 id:'lights-flash',viewBox:'0 0 680 440',
 initial:{character:'fl6'},
 controls:[{kind:'choice',key:'character',label:'lights-flash.characterControl',options:Object.entries(CHARACTERS).map(([value])=>({value,label:`lights-flash.opt-${value}`}))}],
 loop:{dt:.05,speed:1,create:()=>({t:0,watched:{}}),step:(sim,dt,s)=>{sim.t+=dt;sim.watched[s.character]=Math.max(sim.watched[s.character]||0,sim.t/CHARACTERS[s.character].period);return sim;},done:sim=>sim.t>=40},
 compute:lightsFlashModel,draw:drawFlash,
 readout:(m,t)=>`${t(`lights-flash.${m.status}`)} ${t(`lights-flash.${m.character}`)}`,
 tasks:{
  twoCycles:{label:'lights-flash.taskTwoCycles',check:m=>m.cycles>=2},
  group:{label:'lights-flash.taskGroup',check:m=>m.character==='fl2'&&m.cycles>=1},
  isoOc:{label:'lights-flash.taskIsoOc',check:m=>(m.character==='iso4'||m.character==='oc5')&&m.cycles>=1},
 },
});
