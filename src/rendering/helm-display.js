import * as THREE from 'three';
import {mesh,box,canvasTexture} from './materials.js';
import {getLanguage,translate} from '../i18n/runtime.js';
import {getLocation} from '../locations.js';
import {shoreScale} from './geography.js';

const degrees=value=>Number.isFinite(value)?`${String(Math.round((value%360+360)%360)%360).padStart(3,'0')}°`:'—';
const number=(value,digits=1)=>Number.isFinite(value)?value.toFixed(digits):'—';

export function createHelmDisplay(parent,mat){
 const group=new THREE.Group();group.name='helm-multifunction-display';parent.add(group);
 const width=1.16,height=.696;
 box(group,mat.rubber,0,0,0,width+.10,height+.10,.11,.045);
 const texture=canvasTexture(1200,720,()=>{});
 // No lighting-dependent washout: these are emitted pixels on a real screen.
 const screen=mesh(group,new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),0,0,.059);
 screen.name='helm-multifunction-screen';screen.castShadow=false;
 const c=texture.image.getContext('2d');
 let lastSignature='',lastTick=-1,lastTime=null;
 function draw(state){
  const rtl=['ar','he'].includes(getLanguage());
  c.fillStyle='#071c25';c.fillRect(0,0,1200,720);
  const label=(text,x,y,w=210,size=24)=>{
   const value=translate(text);c.fillStyle='#9bbdbb';c.direction=rtl?'rtl':'ltr';c.textAlign=rtl?'right':'left';
   let fontSize=size;c.font=`500 ${fontSize}px sans-serif`;
   while(c.measureText(value).width>w&&fontSize>15)c.font=`500 ${--fontSize}px sans-serif`;
   c.fillText(value,rtl?x+w:x,y,w);c.direction='ltr';c.textAlign='left';
  };
  const value=(text,x,y,w=210,size=49,color='#edfff3')=>{c.direction='ltr';c.textAlign='left';c.fillStyle=color;c.font=`600 ${size}px monospace`;c.fillText(text,x,y,w);};
  const cell=(title,text,x,y,unit='')=>{label(title,x,y);value(text,x,y+59);if(unit)value(unit,x,y+87,210,20,'#92b0b3');};
  label('CHART',24,42,390,25);value('N ↑',584,42,64,24,'#c1d9d8');
  // North-up local chart: same coastline and moving bodies as the 3D scene.
  const chart={x:20,y:62,w:640,h:491,cx:340,cy:360,scale:.23};
  c.save();c.beginPath();c.rect(chart.x,chart.y,chart.w,chart.h);c.clip();c.fillStyle='#123b48';c.fillRect(chart.x,chart.y,chart.w,chart.h);
  c.strokeStyle='#628f941f';c.lineWidth=1;
  for(let x=chart.x;x<chart.x+chart.w;x+=46){c.beginPath();c.moveTo(x,chart.y);c.lineTo(x,chart.y+chart.h);c.stroke();}
  for(let y=chart.y;y<chart.y+chart.h;y+=46){c.beginPath();c.moveTo(chart.x,y);c.lineTo(chart.x+chart.w,y);c.stroke();}
  const px=x=>chart.cx+(x-state.x)*chart.scale,py=z=>chart.cy+(z-state.z)*chart.scale;
  const location=getLocation(state.locationId);
  c.fillStyle='#7b8b69';c.strokeStyle='#c0bd8b';c.lineWidth=2;
  for(const island of location.islands){
   c.beginPath();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,r=shoreScale(a),x=px(island.x+Math.cos(a)*island.rx*r),y=py(island.z+Math.sin(a)*island.rz*r);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();c.fill();c.stroke();
  }
  const world=state.worldBodies||[];
  for(const body of world){
   if(!['yacht','pier'].includes(body.visual?.type))continue;
   c.save();c.translate(px(body.x),py(body.z));c.rotate(body.heading*Math.PI/180);
   c.fillStyle=body.visual.type==='pier'?'#bcaa85':body.kind==='free'?'#abdfeb':'#ccd8cc';
   if(body.visual.type==='pier')c.fillRect(-body.shape.beam*chart.scale/2,-body.shape.length*chart.scale/2,body.shape.beam*chart.scale,body.shape.length*chart.scale);
   else{c.beginPath();c.moveTo(0,-7);c.lineTo(3,5);c.lineTo(-3,5);c.closePath();c.fill();}c.restore();
  }
  const buoys=world.filter(body=>body.visual?.type==='buoy');
  c.fillStyle='#f3cb78';c.font='18px monospace';
  for(const [i,b] of (buoys.length?buoys:location.buoys).entries()){c.beginPath();c.arc(px(b.x),py(b.z),4,0,Math.PI*2);c.fill();c.fillText(String(i+1),px(b.x)+8,py(b.z)-7);}
  const sog=state.speedOverGround,cog=Number.isFinite(sog)&&sog>.05?state.courseOverGround:null;
  if(Number.isFinite(cog)){const angle=cog*Math.PI/180;c.strokeStyle='#f4cc7899';c.setLineDash([8,6]);c.beginPath();c.moveTo(chart.cx,chart.cy);c.lineTo(chart.cx+Math.sin(angle)*95,chart.cy-Math.cos(angle)*95);c.stroke();c.setLineDash([]);}
  c.save();c.translate(chart.cx,chart.cy);c.rotate(state.heading*Math.PI/180);c.fillStyle='#ffe1a0';c.strokeStyle='#16313b';c.lineWidth=2;c.beginPath();c.moveTo(0,-19);c.lineTo(9,12);c.lineTo(0,7);c.lineTo(-9,12);c.closePath();c.fill();c.stroke();c.restore();
  // A labelled scale, in metres, makes distance meaningful without inventing depth contours.
  c.strokeStyle='#dce5d1';c.lineWidth=3;c.beginPath();c.moveTo(40,523);c.lineTo(155,523);c.stroke();value('500 m',40,510,130,20,'#dce5d1');c.restore();
  c.strokeStyle='#31545c';c.lineWidth=2;c.strokeRect(chart.x,chart.y,chart.w,chart.h);
  cell('BOAT SPEED',number(state.speed,2),692,89,'kn');cell('HEADING',degrees(state.heading),952,89);
  cell('SOG',number(sog,2),692,227,'kn');cell('COG',degrees(cog),952,227);
  cell('DEPTH',number(state.depth),692,365,'m');
  label('APPARENT WIND',952,365,220,23);value(number(state.apparentWindSpeed),952,424,150,43);value('kn',1114,424,54,21,'#92b0b3');
  const awa=state.apparentWindAngle;
  value(Number.isFinite(awa)?`${awa<-.5?'←':awa>.5?'→':'↑'} ${Math.abs(awa).toFixed(0)}°`:'—',952,463,220,28,'#f1cc86');
  // Bow-relative wind pointer, matching the apparent wind that powers the sails.
  const windX=822,windY=639,radius=46;
  c.strokeStyle='#527a81';c.lineWidth=2;c.beginPath();c.arc(windX,windY,radius,0,Math.PI*2);c.stroke();
  c.fillStyle='#d8e9df';c.beginPath();c.moveTo(windX,windY-22);c.lineTo(windX+8,windY+13);c.lineTo(windX-8,windY+13);c.closePath();c.fill();
  if(Number.isFinite(awa)&&state.apparentWindSpeed>1e-9){c.save();c.translate(windX,windY);c.rotate(awa*Math.PI/180);c.strokeStyle='#f1cc86';c.lineWidth=4;c.beginPath();c.moveTo(0,34);c.lineTo(0,-39);c.lineTo(-8,-28);c.moveTo(0,-39);c.lineTo(8,-28);c.stroke();c.restore();}
  c.strokeStyle='#31545c';c.lineWidth=2;c.beginPath();c.moveTo(20,579);c.lineTo(1180,579);c.stroke();
  label('HELM',24,611,280);value(`${state.rudder<-.5?'←':state.rudder>.5?'→':'↔'} ${number(Math.abs(state.rudder),0)}°`,24,671,270,43);
  label('Engine throttle',350,611,310);value(`${state.throttle<-.005?'▼':state.throttle>.005?'▲':'–'} ${number(Math.abs(state.throttle)*100,0)}%`,350,671,300,43,Math.abs(state.throttle)>.005?'#f1cc86':'#edfff3');
  label('TRUE WIND',914,611,260,22);value(`${number(state.windSpeed)} kn`,914,654,245,35);value(degrees(state.windDirection),914,692,245,30,'#92b0b3');
  screen.userData.telemetry={speed:state.speed,speedOverGround:sog,heading:state.heading,courseOverGround:cog,depth:state.depth,apparentWindSpeed:state.apparentWindSpeed,apparentWindAngle:awa,windSpeed:state.windSpeed,windDirection:state.windDirection,rudder:state.rudder,throttle:state.throttle,language:getLanguage()};
  texture.needsUpdate=true;
 }
 return {group,canvas:texture.image,update(state,time){
  const sameTime=time===lastTime;lastTime=time;const tick=Math.floor(time*5);
  if(tick===lastTick&&!sameTime)return;
  const signature=JSON.stringify([getLanguage(),state.locationId,state.x,state.z,state.speed,state.heading,state.speedOverGround,state.courseOverGround,state.depth,state.apparentWindSpeed,state.apparentWindAngle,state.windSpeed,state.windDirection,state.rudder,state.throttle,(state.worldBodies||[]).map(b=>[b.x,b.z,b.heading])]);
  if(signature===lastSignature)return;
  draw(state);lastSignature=signature;lastTick=tick;
 }};
}
