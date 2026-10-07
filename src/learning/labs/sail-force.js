// Lab 1: sail force. Top view, bow up, wind from starboard. The learner sets
// the wind angle and the sheet; the drawing splits the sail force into
// forward drive and sideways push using the simulator's own coefficients.
import {sailCoefficients,noGoFactor,suggestedSheet} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,wedge,polar,svgText,hullTop,ltr,round,RAD} from './kit.js';

const NO_GO=38,CX=250,CY=235,SCALE=95;
/** Pure: forces for a wind angle (0–180° from the bow) and sheet angle (0–90°). */
export function sailForceModel({windAngle,sheet}){
 const angle=Math.max(0,Math.min(180,windAngle)),c=sailCoefficients(angle,sheet),noGo=noGoFactor(angle);
 const drive=c.drive*noGo,side=c.side*noGo,bestSheet=suggestedSheet(angle);
 const best=sailCoefficients(angle,bestSheet).drive*noGo;
 const status=noGo<.1?'nogo':c.alpha<5?'luffing':c.alpha>40&&angle<120?'stalled':angle>=120&&c.alpha>40?'parachute':'working';
 return {status,windAngle:angle,sheet,alpha:c.alpha,drive,side,noGo,bestSheet,best,efficiency:best>0?drive/best:0};
}
const nearBest=(m,from,to)=>m.windAngle>=from&&m.windAngle<=to&&m.best>0&&m.drive>=.95*m.best;

function draw(m,settings,t,history,lang){
 const wind=m.windAngle;
 let body=`<rect x="0" y="0" width="500" height="470" rx="16" fill="${C.water}"/>`;
 // No-go zone: headings within 38° of the wind's source. The bow is in it when the wedge covers straight up.
 body+=wedge(CX,CY,205,wind-NO_GO,wind+NO_GO,C.nogo,'nogo');
 const label=polar(CX,CY,128,wind);
 body+=svgText(label.x,label.y+(label.y<CY?0:12),t('sail-force.zone'),{size:13,fill:C.side,lang});
 // Streamlines arrive from the wind's source and leave downwind.
 for(const offset of [-90,-45,0,45,90]){
  const ux=Math.sin(wind*RAD),uy=-Math.cos(wind*RAD),px=-uy,py=ux;
  const sx=CX+ux*220+px*offset,sy=CY+uy*220+py*offset,ex=CX-ux*200+px*offset,ey=CY-uy*200+py*offset;
  const bend=m.status==='working'&&Math.abs(offset)<60?14:0;
  const mx=(sx+ex)/2+px*bend*Math.sign(offset||1),my=(sy+ey)/2+py*bend*Math.sign(offset||1);
  body+=`<path d="M${round(sx,1)} ${round(sy,1)}Q${round(mx,1)} ${round(my,1)} ${round(ex,1)} ${round(ey,1)}" stroke="#ffffff" stroke-width="2" fill="none" opacity=".8" stroke-dasharray="${m.status==='stalled'&&offset<=0?'4 6':'0'}"/>`;
 }
 body+=arrow(...arrowFrom(wind,215,160),{color:C.wind,width:5,part:'wind'});
 body+=hullTop({x:CX,y:CY,scale:1.25});
 // Boom to leeward (port, left) at the sheet angle, pivoting at the mast.
 const mast={x:CX,y:CY-24},boomLength=96,tip=polar(mast.x,mast.y,boomLength,180+m.sheet);
 const fullness=m.status==='luffing'||m.status==='nogo'?0:m.status==='stalled'?10:16;
 const mid=polar((mast.x+tip.x)/2,(mast.y+tip.y)/2,fullness,270+m.sheet);
 const flap=m.status==='luffing'||m.status==='nogo'?` stroke-dasharray="7 4"`:'';
 body+=`<path data-lab-part="sail" d="M${mast.x} ${mast.y}Q${round(mid.x+(mid.x-(mast.x+tip.x)/2),1)} ${round(mid.y+(mid.y-(mast.y+tip.y)/2),1)} ${round(tip.x,1)} ${round(tip.y,1)}" stroke="${C.sailLine}" stroke-width="5" fill="none"${flap}/>`;
 body+=`<circle cx="${mast.x}" cy="${mast.y}" r="5" fill="${C.ink}"/>`;
 // Telltales near the luff: windward lifts when luffing, leeward falls when stalled.
 const luff=polar(mast.x,mast.y,22,180+m.sheet),back=180+m.sheet;
 const tell=(windward,moved)=>{const base=polar(luff.x,luff.y,7,back+(windward?-90:90)),end=polar(base.x,base.y,20,back+(moved?(windward?-65:65):0));return `<path data-lab-part="telltale-${windward?'windward':'leeward'}" data-moving="${moved}" d="M${round(base.x,1)} ${round(base.y,1)}L${round(end.x,1)} ${round(end.y,1)}" stroke="${windward?C.starboard:C.port}" stroke-width="3" stroke-linecap="round"${moved?' stroke-dasharray="3 3"':''}/>`;};
 body+=tell(true,m.status==='luffing'||m.status==='nogo')+tell(false,m.status==='stalled');
 // Forces from the sail's centre: drive forward (up), sideways push to leeward (left), keel resisting (right).
 const centre=polar(mast.x,mast.y,boomLength*.45,180+m.sheet);
 const drive=m.drive*SCALE,side=m.side*SCALE;
 body+=arrow(centre.x,centre.y,centre.x-side,centre.y-drive,{color:C.ink,width:3,dash:'6 4',part:'total'});
 body+=arrow(centre.x,centre.y,centre.x,centre.y-drive,{color:C.drive,width:6,part:'drive'});
 body+=arrow(centre.x,centre.y,centre.x-side,centre.y,{color:C.side,width:6,part:'side'});
 if(side>4)body+=arrow(CX+4,CY+32,CX+4+side*.8,CY+32,{color:C.keel,width:5,part:'keel'});
 // Legend.
 const rows=[[C.drive,'sail-force.drive',m.drive],[C.side,'sail-force.side',m.side],[C.keel,'sail-force.keel',null]];
 rows.forEach(([color,key,value],i)=>{const y=392+i*24;body+=`<rect x="22" y="${y-11}" width="16" height="10" rx="2" fill="${color}"/>`+svgText(46,y,t(key),{size:13,anchor:'start',lang,weight:500})+(value===null?'':svgText(300,y,`${round(value,2).toFixed(2)}`,{size:13,anchor:'start',numeric:true}));});
 body+=svgText(480,32,t('sail-force.readings',{wind:ltr(Math.round(wind)),sheet:ltr(Math.round(m.sheet))}),{size:14,anchor:'end',lang,weight:500});
 return body;
}
const arrowFrom=(bearing,from,to)=>{const a=polar(CX,CY,from,bearing),b=polar(CX,CY,to,bearing);return [a.x,a.y,b.x,b.y];};

export const sailForceLab=defineLab({
 id:'sail-force',viewBox:'0 0 500 470',
 initial:{windAngle:90,sheet:72},
 controls:[
  {key:'windAngle',label:'sail-force.windAngle',min:0,max:180,step:1,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:Math.round(v)})},
  {key:'sheet',label:'sail-force.sheet',min:0,max:90,step:1,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:Math.round(v)})},
 ],
 drag:{key:'windAngle',cx:CX,cy:CY,toValue:angle=>Math.min(180,Math.abs(angle))},
 compute:sailForceModel,
 draw,
 readout:(m,t)=>t(`sail-force.${m.status}`),
 describe:(m,t)=>`${t(`sail-force.${m.status}`)} ${t('sail-force.readings',{wind:Math.round(m.windAngle),sheet:Math.round(m.sheet)})}`,
 tasks:{
  luff:{label:'sail-force.taskLuff',check:m=>m.status==='luffing'},
  stall:{label:'sail-force.taskStall',check:m=>m.status==='stalled'},
  best45:{label:'sail-force.taskBest45',check:m=>nearBest(m,40,50)},
  best90:{label:'sail-force.taskBest90',check:m=>nearBest(m,85,95)},
  nogo:{label:'sail-force.taskNoGo',check:m=>m.status==='nogo'&&m.drive===0},
  run:{label:'sail-force.taskRun',check:m=>m.status==='parachute'},
 },
});
