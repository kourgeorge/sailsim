// Lab 4: heel and reef. Stern view of the boat stopped on a close reach with
// the sails trimmed for that angle. Wind speed and reef set the heel the
// simulator settles to; the push of the wind grows with the square of its speed.
import {sailCoefficients,noGoFactor,suggestedSheet,clamp,KNOT} from '../../physics.js';
import {MONOHULL} from '../../vessels.js';
import {defineLab,TOKENS as C,arrow,svgText,ltr,round,RAD} from './kit.js';

export const HEEL_LAB_ANGLE=55;
export const REEF_AREA=[1,.72,.48];
const CX=190,WATER=300;
/** Pure: the steady heel of integrate() (targetHeel) with the boat held still. */
export function heelReefModel({windSpeed,reef}){
 const angle=HEEL_LAB_ANGLE,sheet=suggestedSheet(angle),reefArea=REEF_AREA[reef]??1;
 const pressure=.5*MONOHULL.airDensity*(windSpeed*KNOT)**2;
 // Same sail shape factor as sailDynamics() with the default outhaul (.5) and vang (.45).
 const shape=1-.18*Math.abs(.5-clamp(windSpeed/25,0,1))-.12*Math.abs(.45-clamp(angle/140,.2,.85));
 const c=sailCoefficients(angle,sheet),noGo=noGoFactor(angle);
 const side=pressure*c.side*noGo*(MONOHULL.mainArea*reefArea*shape+MONOHULL.jibArea);
 const heel=clamp(side*.011*reefArea,0,38);
 const ratio=(windSpeed/10)**2,loss=1-Math.max(.65,Math.cos(heel*RAD));
 const status=heel<12?'easy':heel<=25?'powered':reef<2?'reefNow':'tooMuch';
 return {status,windSpeed,reef,reefArea,pressure,side,heel,ratio,loss};
}
const params=m=>({heel:ltr(Math.round(m.heel)),ratio:ltr(round(m.ratio,m.ratio<10?1:0)),loss:ltr(Math.round(m.loss*100)),wind:ltr(m.windSpeed)});
const remember=(m,s,ctx)=>{ctx.winds??=new Set();ctx.reefWinds??=new Set();ctx.winds.add(s.windSpeed);if(m.status==='reefNow'||m.status==='tooMuch')ctx.reefWinds.add(`${s.windSpeed}:${s.reef}`);};

function draw(m,settings,t,history,lang){
 let body=`<rect x="0" y="0" width="560" height="420" rx="16" fill="#e6eef0"/><rect x="0" y="${WATER}" width="560" height="${420-WATER}" fill="${C.water}"/>`;
 body+=`<path d="M0 ${WATER}H560" stroke="${C.waterLine}" stroke-width="2"/>`;
 body+=svgText(CX,30,t('heel-reef.stern'),{size:13,fill:C.muted,weight:500,lang});
 // Hull, keel, mast and sail rotate together; wind from the right heels the boat to the left.
 const head=25+195*[1,.8,.62][m.reef],ce=25+(head-25)*.4;
 let rig=`<path d="M-62 -18C-60 20 -30 38 0 40C30 38 60 20 62 -18Z" fill="${C.hull}" stroke="${C.hullLine}" stroke-width="2.5"/><path d="M-6 40L-4 110H4L6 40Z" fill="${C.hullLine}"/>`;
 rig+=`<path d="M0 -18V-245" stroke="${C.ink}" stroke-width="4"/><path d="M2 -${round(head+18,1)}L2 -43L${round(14+16*m.reefArea,1)} -43Z" fill="${C.sail}" stroke="${C.sailLine}" stroke-width="2"/>`;
 rig+=`<circle cx="4" cy="-${round(ce+18,1)}" r="6" fill="${C.side}" data-lab-part="centre-of-effort"/>`;
 body+=`<g transform="translate(${CX} ${WATER}) rotate(${round(-m.heel,1)})" data-lab-part="boat">${rig}</g>`;
 // Sideways push at the centre of effort (drawn level), and the heel angle.
 const ceX=CX+Math.sin(-m.heel*RAD)*(ce+18),ceY=WATER-Math.cos(m.heel*RAD)*(ce+18);
 body+=arrow(ceX+20,ceY,ceX+20-Math.min(150,m.side/35),ceY,{color:C.side,width:5,part:'side'});
 body+=arrow(470,70,375,70,{color:C.wind,width:5,part:'wind'})+svgText(470,95,t('kit.knots',{value:m.windSpeed}),{size:13,anchor:'end',fill:C.wind,numeric:true});
 body+=svgText(CX,WATER+95,t('heel-reef.heel',{heel:Math.round(m.heel)}),{size:18,fill:m.heel>25?C.danger:C.ink,lang});
 // Wind push bar: 10 knots is the 1× mark.
 const x=340,y=170,unit=21;
 body+=svgText(x,y-20,t('heel-reef.push'),{size:14,anchor:'start',lang});
 body+=`<rect x="${x}" y="${y}" width="${9*unit}" height="22" rx="4" fill="#ffffff" stroke="${C.waterLine}"/><rect data-lab-part="push-bar" x="${x}" y="${y}" width="${round(m.ratio*unit,1)}" height="22" rx="4" fill="${C.side}"/>`;
 body+=`<path d="M${x+unit} ${y-4}V${y+26}" stroke="${C.ink}" stroke-width="2"/>`+svgText(x+unit,y+42,t('heel-reef.mark10'),{size:12,fill:C.muted,weight:500,lang});
 body+=svgText(x,y+70,t('heel-reef.ratio',{ratio:round(m.ratio,m.ratio<10?1:0)}),{size:16,anchor:'start',lang});
 body+=svgText(x,y+98,t('heel-reef.reefLabel',{reef:m.reef}),{size:14,anchor:'start',fill:C.muted,weight:500,lang});
 return body;
}

export const heelReefLab=defineLab({
 id:'heel-reef',viewBox:'0 0 560 420',
 initial:{windSpeed:10,reef:0},
 controls:[
  {key:'windSpeed',label:'heel-reef.windControl',min:5,max:30,step:1,nudge:[-5,5],format:(v,t)=>t('kit.knots',{value:v})},
  {key:'reef',label:'heel-reef.reefControl',kind:'choice',options:[{value:0,label:'heel-reef.reef0'},{value:1,label:'heel-reef.reef1'},{value:2,label:'heel-reef.reef2'}]},
 ],
 compute:heelReefModel,
 draw,
 readout:(m,t)=>`${t(`heel-reef.${m.status}`,params(m))} ${t('heel-reef.pushReadout',params(m))}`,
 tasks:{
  double:{label:'heel-reef.taskDouble',check:(m,s,ctx)=>{remember(m,s,ctx);return [...ctx.winds].some(w=>ctx.winds.has(w*2));}},
  reefPoint:{label:'heel-reef.taskReefPoint',check:(m,s,ctx)=>{remember(m,s,ctx);return m.status==='reefNow';}},
  compare:{label:'heel-reef.taskCompare',check:(m,s,ctx)=>{remember(m,s,ctx);return s.reef>0&&m.heel<=25&&[...ctx.reefWinds].some(k=>k.startsWith(`${s.windSpeed}:`)&&Number(k.split(':')[1])<s.reef);}},
 },
});
