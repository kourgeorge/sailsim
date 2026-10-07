// Lab 5: rudder and momentum. The real simulator boat under engine, sails down,
// held at a chosen speed (ahead or astern). The helm can move while it runs:
// the rudder only grips when water flows past it, the boat keeps turning after
// the helm is centred, and going astern the bow swings the other way.
import {initialState,step,KNOT} from '../../physics.js';
import {defineLab,TOKENS as C,arrow,polar,svgText,hullTop,ltr,round,RAD} from './kit.js';

const CX=230,CY=250,SCALE=5,DURATION=120;
// Engine command that holds a speed through the water: drag balance plus a small correction.
function holdThrottle(target,speed){
 const u=target*KNOT,drag=58*u+38*u*Math.abs(u);
 return Math.max(-1,Math.min(1,drag/(u<0?1050:1650)+.4*(target-speed)));
}
export function createRudderSim({speed}){
 const s=initialState();s.worldBodies=[];
 Object.assign(s,{x:0,z:100,heading:0,windSpeed:0,currentSpeed:0,mainHoist:0,jibHoist:0,speed,leeway:0,rudder:0,yawRate:0});
 return {s,target:speed,time:0};
}
export function stepRudderSim(sim,dt,settings){
 const {s}=sim;
 s.rudder=settings.helm;s.throttle=holdThrottle(sim.target,s.speed);
 step(s,dt);sim.time+=dt;
}
export const rudderDone=sim=>sim.time>=DURATION;

/** Pure snapshot: status from flow past the rudder, helm and turn rate. */
export function rudderModel(settings,sim){
 sim??=createRudderSim(settings);
 const {s}=sim,helm=settings.helm,rate=s.yawRate;
 let status;
 if(Math.abs(s.speed)<.4)status='noFlow';
 else if(s.speed<-.3&&Math.abs(helm)>=5)status='astern';
 else if(Math.abs(helm)<1&&Math.abs(rate)>.4)status='coasting';
 else if(Math.abs(helm)>=1)status=rate>=0?'turningStarboard':'turningPort';
 else status='straight';
 return {status,time:sim.time,speed:s.speed,helm,rudder:s.rudder,turnRate:rate,heading:s.heading,x:s.x,z:s.z,tiller:Boolean(settings.tiller)};
}

let clipSerial=0;
function draw(m,settings,t,history,lang){
 const clip=`rudder-sea-${++clipSerial}`;
 let body=`<defs><clipPath id="${clip}"><rect x="0" y="0" width="520" height="470" rx="16"/></clipPath></defs><rect x="0" y="0" width="520" height="470" rx="16" fill="${C.water}"/><g clip-path="url(#${clip})">`;
 // Dots fixed to the water show the boat moving; the dashed line is its track.
 const gap=40,ox=((-m.x*SCALE)%gap+gap)%gap,oz=((-m.z*SCALE)%gap+gap)%gap;
 for(let x=ox-gap;x<520+gap;x+=gap)for(let y=oz-gap;y<470+gap;y+=gap)body+=`<circle cx="${round(x+(CX%gap),1)}" cy="${round(y+(CY%gap),1)}" r="1.6" fill="${C.waterLine}"/>`;
 if(history.length>1){
  const points=history.filter((_,i)=>i%3===0||i===history.length-1).map(p=>`${round(CX+(p.x-m.x)*SCALE,1)} ${round(CY+(p.z-m.z)*SCALE,1)}`);
  body+=`<path data-lab-part="track" d="M${points.join('L')}" fill="none" stroke="${C.keel}" stroke-width="2.5" stroke-dasharray="6 5" opacity=".7"/>`;
 }
 body+=hullTop({x:CX,y:CY,heading:m.heading,scale:.62});
 // Water flowing past the hull: toward the stern going ahead, toward the bow going astern.
 const flow=Math.min(60,Math.abs(m.speed)*12);
 if(flow>3)for(const side of [-1,1]){
  const along=m.speed>0?-1:1,base=polar(CX,CY,30*side,m.heading+90),from=polar(base.x,base.y,-along*flow/2,m.heading),to=polar(base.x,base.y,along*flow/2,m.heading);
  body+=arrow(from.x,from.y,to.x,to.y,{color:'#ffffff',width:3,head:9,part:'flow'});
 }
 const post=polar(CX,CY,-37,m.heading),blade=polar(post.x,post.y,15,m.heading+180-m.rudder);
 body+=`<path data-lab-part="rudder" d="M${round(post.x,1)} ${round(post.y,1)}L${round(blade.x,1)} ${round(blade.y,1)}" stroke="${C.keel}" stroke-width="5" stroke-linecap="round"/>`;
 // Curved arrow at the bow: which way, and how fast, the bow is swinging.
 if(Math.abs(m.turnRate)>.25){
  const dir=Math.sign(m.turnRate),span=Math.min(60,Math.abs(m.turnRate)*12),r=58;
  const a=polar(CX,CY,r,m.heading),b=polar(CX,CY,r,m.heading+dir*span);
  body+=`<path data-lab-part="turn" d="M${round(a.x,1)} ${round(a.y,1)}A${r} ${r} 0 0 ${dir>0?1:0} ${round(b.x,1)} ${round(b.y,1)}" fill="none" stroke="${C.side}" stroke-width="4"/>`;
  const head=polar(CX,CY,r,m.heading+dir*(span+4));body+=arrow(b.x,b.y,head.x,head.y,{color:C.side,width:4,head:11});
 }
 body+='</g>';
 // Inset: the helm the learner holds. A tiller is pushed opposite to the turn.
 const ix=415,iy=330;
 body+=`<rect x="${ix-92}" y="${iy-70}" width="184" height="170" rx="12" fill="#ffffffcc" stroke="${C.waterLine}"/>`;
 if(m.tiller){
  const pivot={x:ix,y:iy+35},end=polar(pivot.x,pivot.y,62,-m.helm*1.4);
  body+=`<path d="M${ix-30} ${iy+50}Q${ix} ${iy-40} ${ix+30} ${iy+50}" fill="none" stroke="${C.hullLine}" stroke-width="2"/><path data-lab-part="tiller" d="M${pivot.x} ${pivot.y}L${round(end.x,1)} ${round(end.y,1)}" stroke="${C.wind}" stroke-width="7" stroke-linecap="round"/><circle cx="${pivot.x}" cy="${pivot.y}" r="5" fill="${C.ink}"/>`;
 }else{
  const turn=m.helm*4;
  body+=`<g data-lab-part="wheel" transform="translate(${ix} ${iy+5}) rotate(${round(turn,1)})"><circle r="44" fill="none" stroke="${C.wind}" stroke-width="7"/>${[0,60,120,180,240,300].map(a=>`<path d="M0 0L${round(Math.sin(a*RAD)*44,1)} ${round(-Math.cos(a*RAD)*44,1)}" stroke="${C.wind}" stroke-width="3"/>`).join('')}<circle cy="-44" r="6" fill="${C.ink}"/></g>`;
 }
 const note=t(m.tiller?'rudder.tillerNote':'rudder.wheelNote').split(': ');
 body+=svgText(ix,iy+76,note[0]+(note[1]?':':''),{size:12,lang})+(note[1]?svgText(ix,iy+92,note[1],{size:11,lang,weight:500}):'');
 body+=svgText(30,40,t('kit.knots',{value:round(m.speed,1).toFixed(1)}),{size:22,anchor:'start',lang});
 body+=svgText(30,64,t(m.speed<-.05?'rudder.asternLabel':'rudder.aheadLabel'),{size:13,anchor:'start',fill:C.muted,lang,weight:500});
 body+=svgText(490,40,t('rudder.rate',{value:ltr(round(Math.abs(m.turnRate),1).toFixed(1))}),{size:16,anchor:'end',lang});
 body+=svgText(490,62,t('rudder.helmAt',{value:ltr(Math.abs(Math.round(m.helm))),side:t(m.helm>0?'rudder.starboard':m.helm<0?'rudder.port':'rudder.centre')}),{size:13,anchor:'end',fill:C.muted,lang,weight:500});
 return body;
}

const band=speed=>Math.abs(speed)<.4?'still':speed>=.5&&speed<=1.5?'slow':speed>=3.5?'fast':null;
export const rudderLab=defineLab({
 id:'rudder',viewBox:'0 0 520 470',
 initial:{speed:4,helm:0,tiller:false},
 controls:[
  {key:'speed',label:'rudder.speed',min:-3,max:6,step:.5,nudge:[-.5,.5],format:(v,t)=>t('kit.knots',{value:Number(v).toFixed(1)})},
  {key:'helm',label:'rudder.helm',min:-35,max:35,step:5,live:true,nudge:[-5,5],format:(v,t)=>t('kit.degrees',{value:v})},
  {key:'tiller',kind:'toggle',label:'rudder.tiller',live:true},
 ],
 loop:{dt:.1,create:createRudderSim,step:stepRudderSim,done:rudderDone},
 compute:rudderModel,
 draw,
 readout:(m,t)=>t(`rudder.${m.status}`,{rate:ltr(round(Math.abs(m.turnRate),1).toFixed(1))}),
 tasks:{
  compare:{label:'rudder.taskCompare',check:(m,s,ctx)=>{ctx.rudderBands??=new Set();const b=band(m.speed);if(b&&Math.abs(m.helm)>=10&&m.time>=3)ctx.rudderBands.add(b);return ctx.rudderBands.size===3;}},
  coast:{label:'rudder.taskCoast',check:m=>m.status==='coasting'},
  astern:{label:'rudder.taskAstern',check:m=>m.status==='astern'&&m.time>=3&&Math.sign(m.turnRate)===-Math.sign(m.helm)},
 },
});
