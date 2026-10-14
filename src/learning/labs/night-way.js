// Lab 14: who keeps clear, card by card, like an exam sheet of light pictures.
// Each card shows what you see from your own boat (bottom, bow up) and your own
// status. International rules, in sight, risk of collision, open water.
// The learner picks who keeps clear; the readout explains the rule.
import {defineLab,TOKENS as C,svgText,hullTop,round} from './kit.js';

// Night lights are [color, dx, level]: dx in px from the vessel's centre as you
// see it, level in light spacings above the water. Day shapes stack top to bottom.
// Seen bow-on, a vessel's green is on your left and her red on your right.
const RWR=[['r',0,2.2],['w',0,3.2],['r',0,4.2]];
export const CARDS=Object.freeze([
 {id:'sailOnly',own:'power',at:'port',answer:'you',lights:[['g',0,1]]},
 {id:'crossGreen',own:'power',at:'port',answer:'other',kind:'crossing',lights:[['w',-4,3],['g',6,1]]},
 {id:'crossRed',own:'power',at:'starboard',answer:'you',kind:'crossing',lights:[['w',4,3],['r',-6,1]]},
 {id:'headOn',own:'power',at:'ahead',answer:'both',kind:'crossing',lights:[['w',0,2.6],['w',0,4],['g',-24,1],['r',24,1]]},
 {id:'ram',own:'sail',at:'starboard',answer:'you',kind:'special',lights:[...RWR,['w',30,4.6],['r',-26,1]]},
 {id:'nuc',own:'sail',at:'ahead',answer:'you',kind:'special',lights:[['r',0,2.4],['r',0,3.6],['g',-24,1]]},
 {id:'fishing',own:'sail',at:'port',answer:'you',kind:'special',lights:[['r',0,3.6],['w',0,2.4],['g',6,1]]},
 {id:'cbd',own:'sail',at:'starboard',answer:'you',kind:'special',lights:[['r',0,2.4],['r',0,3.4],['r',0,4.4],['w',-40,3],['w',40,4.8],['r',-32,1]]},
 {id:'motorSail',own:'motorSail',at:'starboard',answer:'you',kind:'own',lights:[['r',0,1]]},
 {id:'tow',own:'sail',at:'port',answer:'other',lights:[['w',0,2.4],['w',0,3.4],['w',0,4.4],['g',6,1]]},
 {id:'whiteOnly',own:'sail',at:'ahead',answer:'you',lights:[['w',0,1.6]]},
 {id:'nucOwn',own:'nuc',at:'ahead',answer:'other',kind:'own',lights:[['w',0,3],['g',-22,1],['r',22,1]]},
 {id:'nucRam',own:'nuc',at:'port',answer:'both',kind:'own',lights:RWR},
 {id:'dayCone',own:'sail',at:'starboard',answer:'other',kind:'day',shapes:['coneDown']},
 {id:'dayBdb',own:'sail',at:'ahead',answer:'you',kind:'day',shapes:['ball','diamond','ball']},
 {id:'dayFishing',own:'sail',at:'port',answer:'you',kind:'day',shapes:['coneDown','coneUp']},
 {id:'dayCylinder',own:'sail',at:'ahead',answer:'you',kind:'day',shapes:['cylinder']},
]);
export const ANSWERS=['you','other','both'];

/** Pure: the card shown and whether the chosen answer is right. */
export function nightWayModel({card,answer}){
 const index=Math.max(1,Math.min(CARDS.length,Math.round(card)))-1,c=CARDS[index];
 const status=!ANSWERS.includes(answer)?'ask':answer===c.answer?'right':'wrong';
 return {status,index,card:c,answer,day:Boolean(c.shapes)};
}

const X={port:150,ahead:260,starboard:370},WATER=210,STEP=26;
const LIGHT={w:'#fffbe6',r:'#ff4a3d',g:'#43e06a'};
function shape(kind,x,y){
 const ink=`fill="#1d2b30" data-lab-part="shape-${kind}"`;
 if(kind==='ball')return `<circle cx="${x}" cy="${y}" r="9" ${ink}/>`;
 if(kind==='diamond')return `<path d="M${x} ${y-12}L${x+9} ${y}L${x} ${y+12}L${x-9} ${y}Z" ${ink}/>`;
 if(kind==='cylinder')return `<rect x="${x-7}" y="${y-13}" width="14" height="26" rx="2" ${ink}/>`;
 const up=kind==='coneUp';
 return `<path d="M${x-10} ${up?y+9:y-9}H${x+10}L${x} ${up?y-9:y+9}Z" ${ink}/>`;
}
function draw(m,settings,t,history,lang){
 const c=m.card,x=X[c.at];
 let body=`<rect x="0" y="0" width="520" height="420" rx="16" fill="${m.day?'#cfe3ea':'#0f2430'}"/>`;
 body+=`<rect x="0" y="${WATER}" width="520" height="210" fill="${m.day?C.water:'#132d3a'}"/>`;
 body+=svgText(260,28,t(m.day?'night-way.day':'night-way.night'),{size:13,lang,fill:m.day?C.muted:'#9fb6bb'});
 if(m.day){
  // Side view of a ship with her shapes hoisted on the mast.
  body+=`<path data-lab-part="vessel" d="M${x-70} ${WATER-18}H${x+70}L${x+56} ${WATER+4}H${x-58}Z" fill="#7f8f94"/><path d="M${x-20} ${WATER-18}V${WATER-36}H${x+16}V${WATER-18}Z" fill="#a3b0b3"/><path d="M${x} ${WATER-36}V${WATER-36-c.shapes.length*30-16}" stroke="#3b4a4f" stroke-width="3"/>`;
  c.shapes.forEach((kind,i)=>{body+=shape(kind,x,WATER-36-c.shapes.length*30+i*30);});
 }else{
  for(const [color,dx,level] of c.lights){
   const cx=round(x+dx,1),cy=round(WATER-level*STEP,1);
   body+=`<circle cx="${cx}" cy="${cy}" r="17" fill="${LIGHT[color]}" opacity=".22"/><circle data-lab-part="light-${color}" cx="${cx}" cy="${cy}" r="7" fill="${LIGHT[color]}"/>`;
  }
 }
 body+=svgText(x,WATER+30,t(`night-way.${c.at}`),{size:13,lang,fill:m.day?C.muted:'#9fb6bb'});
 // You: your own boat at the bottom, bow up toward the view.
 body+=hullTop({x:260,y:350,scale:.45,fill:c.own==='nuc'?'#f3c6bd':C.hull,stroke:c.own==='nuc'?C.danger:C.hullLine});
 if(c.own==='nuc'&&!m.day)body+=`<circle cx="260" cy="336" r="4" fill="${LIGHT.r}"/><circle cx="260" cy="348" r="4" fill="${LIGHT.r}"/>`;
 body+=svgText(260,406,t(`night-way.own.${c.own}`),{size:14,lang,fill:m.day?C.ink:'#e3eeeb'});
 if(m.status!=='ask')body+=svgText(490,28,m.status==='right'?'✓':'✗',{size:22,anchor:'end',fill:m.status==='right'?'#43e06a':'#ff7a6e',numeric:true});
 return body;
}

const readout=(m,t)=>m.status==='ask'
 ?`${t(`night-way.see.${m.card.id}`)} ${t('night-way.ask')}`
 :`${t(`night-way.${m.status}`)} ${t(`night-way.why.${m.card.id}`)}`;
const solved=kind=>m=>m.status==='right'&&m.card.kind===kind;

export const nightWayLab=defineLab({
 id:'night-way',viewBox:'0 0 520 420',
 initial:{card:1,answer:null},
 controls:[
  {key:'card',label:'night-way.card',min:1,max:CARDS.length,step:1,nudge:[-1,1],resets:['answer'],format:(v,t)=>t('night-way.counter',{value:v,total:CARDS.length})},
  {key:'answer',kind:'choice',label:'night-way.answer',options:ANSWERS.map(value=>({value,label:`night-way.${value}`}))},
 ],
 compute:nightWayModel,draw,readout,
 describe:(m,t)=>`${t(`night-way.own.${m.card.own}`)}. ${readout(m,t)}`,
 tasks:{
  crossing:{label:'night-way.taskCrossing',check:solved('crossing')},
  special:{label:'night-way.taskSpecial',check:solved('special')},
  own:{label:'night-way.taskOwn',check:solved('own')},
  day:{label:'night-way.taskDay',check:solved('day')},
 },
});
