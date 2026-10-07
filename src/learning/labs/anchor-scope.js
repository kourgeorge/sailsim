// Lab 8: anchor scope. Side view of a yacht lying to its anchor with the rode
// pulled tight by the wind, as the simulator models it, plus the swing circle
// from above. Scope and holding follow anchorSnapshot() and integrate().
import {MONOHULL} from '../../vessels.js';
import {clamp} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,svgText,ltr,round,RAD} from './kit.js';

export const FAIRLEAD_HEIGHT=MONOHULL.fairlead.y;
const PX=6,BOW_X=560,WATER=100;
/** Pure: depth and rode length (metres) to scope, pull angle and swing radius. */
export function anchorScopeModel({depth,rode}){
 const vertical=depth+FAIRLEAD_HEIGHT,scope=rode/vertical,reaches=rode>=vertical;
 const radius=reaches?Math.sqrt(rode*rode-vertical*vertical):0;
 // A taut straight rode: the pull at the anchor rises at this angle above the seabed.
 const pullAngle=reaches?Math.asin(vertical/rode)/RAD:90;
 // integrate(): holding share is clamp((scope-1)/2,0,1); anchorSnapshot(): scope < 3 is short.
 const hold=clamp((scope-1)/2,0,1);
 const status=!reaches?'upDown':scope<3?'steep':'flat';
 return {status,depth,rode,vertical,scope,radius,pullAngle,hold,minimumRode:3*vertical};
}
const params=m=>({scope:ltr(round(m.scope,1)),angle:ltr(Math.round(m.pullAngle)),hold:ltr(Math.round(m.hold*100)),need:ltr(Math.ceil(m.minimumRode)),depth:ltr(m.depth),rode:ltr(m.rode)});

function draw(m,settings,t,history,lang){
 const seabed=WATER+m.depth*PX,bow={x:BOW_X,y:WATER-FAIRLEAD_HEIGHT*PX};
 let body=`<rect x="0" y="0" width="640" height="420" rx="16" fill="#e6eef0"/><rect x="0" y="${WATER}" width="640" height="${round(seabed-WATER,1)}" fill="${C.water}"/>`;
 body+=`<rect x="0" y="${round(seabed,1)}" width="640" height="${round(420-seabed,1)}" fill="${C.seabed}" data-lab-part="seabed"/><path d="M0 ${WATER}H640" stroke="${C.waterLine}" stroke-width="2"/>`;
 // Hull from the side, bow to the left facing the anchor.
 body+=`<path d="M${BOW_X-8} ${WATER-10}H${BOW_X+70}L${BOW_X+66} ${WATER+8}H${BOW_X+8}Z" fill="${C.hull}" stroke="${C.hullLine}" stroke-width="2"/><path d="M${BOW_X+30} ${WATER-10}V${WATER-80}" stroke="${C.ink}" stroke-width="3"/>`;
 body+=arrow(630,40,585,40,{color:C.wind,width:4,part:'wind'});
 let anchor;
 if(m.status==='upDown'){
  // The rode is shorter than the distance to the bottom: the anchor hangs below the bow.
  anchor={x:bow.x,y:bow.y+m.rode*PX};
 } else anchor={x:bow.x-m.radius*PX,y:seabed};
 body+=`<path data-lab-part="rode" d="M${bow.x} ${round(bow.y,1)}L${round(anchor.x,1)} ${round(anchor.y,1)}" stroke="${C.chain}" stroke-width="3" fill="none"/>`;
 body+=`<path data-lab-part="anchor" d="M${round(anchor.x-9,1)} ${round(anchor.y-2,1)}L${round(anchor.x,1)} ${round(anchor.y+4,1)}L${round(anchor.x+9,1)} ${round(anchor.y-2,1)}M${round(anchor.x,1)} ${round(anchor.y+4,1)}V${round(anchor.y-10,1)}" stroke="${m.status==='flat'?C.ok:C.danger}" stroke-width="3.5" fill="none"/>`;
 if(m.status!=='upDown'){
  // The pull angle drawn at the anchor, between the seabed and the rode.
  const r=34,end={x:anchor.x+Math.cos(m.pullAngle*RAD)*r,y:anchor.y-Math.sin(m.pullAngle*RAD)*r};
  body+=`<path d="M${round(anchor.x+r,1)} ${round(anchor.y,1)}A${r} ${r} 0 0 0 ${round(end.x,1)} ${round(end.y,1)}" stroke="${m.status==='flat'?C.ok:C.danger}" stroke-width="2.5" fill="none"/>`;
  body+=svgText(anchor.x+r+8,anchor.y-8,`${Math.round(m.pullAngle)}°`,{size:14,anchor:'start',numeric:true,fill:m.status==='flat'?C.ok:C.danger});
 }
 // Depth and rode labels.
 body+=`<path d="M${BOW_X+90} ${round(bow.y,1)}V${round(seabed,1)}" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
 body+=svgText(BOW_X+96,(bow.y+seabed)/2+4,t('kit.metres',{value:round(m.vertical,1)}),{size:12,anchor:'start',numeric:true});
 body+=svgText(20,30,t('anchor-scope.scopeLine',{scope:ltr(round(m.scope,1)),rode:ltr(m.rode),vertical:ltr(round(m.vertical,1))}),{size:15,anchor:'start',lang});
 // Swing circle from above (inset, 0.8 px per metre), drawn below the deepest seabed.
 const ix=110,iy=335;
 body+=`<rect x="12" y="250" width="200" height="164" rx="10" fill="#ffffffd9" stroke="${C.waterLine}"/>`;
 body+=svgText(112,268,t('anchor-scope.above'),{size:12,fill:C.muted,weight:500,lang});
 body+=`<circle data-lab-part="swing" cx="${ix}" cy="${iy+10}" r="${round(m.radius*.8,1)}" fill="${C.water}" stroke="${C.keel}" stroke-width="2"/><circle cx="${ix}" cy="${iy+10}" r="3" fill="${C.chain}"/>`;
 body+=svgText(112,408,t('anchor-scope.swing',{diameter:Math.round(m.radius*2)}),{size:12,lang});
 return body;
}

export const anchorScopeLab=defineLab({
 id:'anchor-scope',viewBox:'0 0 640 420',
 initial:{depth:5,rode:12},
 controls:[
  {key:'depth',label:'anchor-scope.depthControl',min:2,max:20,step:1,nudge:[-1,1],format:(v,t)=>t('kit.metres',{value:v})},
  {key:'rode',label:'anchor-scope.rodeControl',min:0,max:80,step:1,nudge:[-5,5],format:(v,t)=>t('kit.metres',{value:v})},
 ],
 compute:anchorScopeModel,
 draw,
 readout:(m,t)=>t(`anchor-scope.${m.status}`,params(m)),
 tasks:{
  shortest5:{label:'anchor-scope.taskShortest',check:m=>m.depth===5&&m.status==='flat'&&m.rode<=Math.ceil(m.minimumRode)},
  deeper:{label:'anchor-scope.taskDeeper',check:(m,s,ctx)=>m.depth>=2*ctx.initial.depth&&m.status==='flat'},
  swing:{label:'anchor-scope.taskSwing',check:(m,s,ctx)=>ctx.events.has('changed:rode')&&m.radius>=anchorScopeModel(ctx.initial).radius+15},
  breakout:{label:'anchor-scope.taskBreakout',check:m=>m.status==='upDown'&&m.rode>0},
 },
});
