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
 const texture=canvasTexture(2400,1440,()=>{});
 // Keep oblique text stable without the stair-stepping of nearest sampling.
 // Larger glyphs and the Instruments camera's native framebuffer do the main
 // readability work; extra texture pixels alone cannot enlarge distant type.
 texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
 texture.anisotropy=16;
 // No lighting-dependent washout: these are emitted pixels on a real screen.
 const screen=mesh(group,new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),0,0,.059);
 screen.name='helm-multifunction-screen';screen.castShadow=false;
 const c=texture.image.getContext('2d');c.setTransform(2,0,0,2,0,0);
 const mono='ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
 let lastSignature='',lastTick=-1,lastTime=null;
 function draw(state){
  const rtl=['ar','he'].includes(getLanguage());
  c.fillStyle='#071c25';c.fillRect(0,0,1200,720);
  const label=(text,x,y,w=260,size=34)=>{
   const value=translate(text);c.fillStyle='#c0d8d6';c.direction=rtl?'rtl':'ltr';c.textAlign=rtl?'right':'left';
   c.font=`600 ${size}px sans-serif`;
   const words=value.split(/\s+/),lines=[];let line='';
   for(const word of words){const next=line?`${line} ${word}`:word;if(line&&c.measureText(next).width>w){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
   // Two real text lines retain readable glyph width in long translations.
   const visible=lines.length>2?[lines[0],lines.slice(1).join(' ')]:lines;
   visible.forEach((part,i)=>{let fontSize=size;c.font=`600 ${fontSize}px sans-serif`;while(c.measureText(part).width>w&&fontSize>28)c.font=`600 ${--fontSize}px sans-serif`;c.fillText(part,rtl?x+w:x,y-(visible.length-1-i)*(size+2));});
   c.direction='ltr';c.textAlign='left';
  };
  const value=(text,x,y,w=260,size=58,color='#f2fff6')=>{c.direction='ltr';c.textAlign='left';c.fillStyle=color;c.font=`600 ${size}px ${mono}`;c.fillText(text,x,y,w);};
  const cell=(title,text,x,y,unit='')=>{label(title,x,y);value(text,x,y+68);if(unit)value(unit,x,y+98,260,27,'#b4d0d0');};
  label('CHART',24,42,370,32);value('N ↑',478,42,70,28,'#c1d9d8');
  // North-up local chart: same coastline and moving bodies as the 3D scene.
  const chart={x:20,y:62,w:540,h:463,cx:290,cy:360,scale:.23};
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
  c.fillStyle='#f3cb78';c.font=`600 24px ${mono}`;
  for(const [i,b] of (buoys.length?buoys:location.buoys).entries()){c.beginPath();c.arc(px(b.x),py(b.z),4,0,Math.PI*2);c.fill();c.fillText(String(i+1),px(b.x)+8,py(b.z)-7);}
  const sog=state.speedOverGround,cog=Number.isFinite(sog)&&sog>.05?state.courseOverGround:null;
  if(Number.isFinite(cog)){const angle=cog*Math.PI/180;c.strokeStyle='#f4cc7899';c.setLineDash([8,6]);c.beginPath();c.moveTo(chart.cx,chart.cy);c.lineTo(chart.cx+Math.sin(angle)*95,chart.cy-Math.cos(angle)*95);c.stroke();c.setLineDash([]);}
  c.save();c.translate(chart.cx,chart.cy);c.rotate(state.heading*Math.PI/180);c.fillStyle='#ffe1a0';c.strokeStyle='#16313b';c.lineWidth=2;c.beginPath();c.moveTo(0,-19);c.lineTo(9,12);c.lineTo(0,7);c.lineTo(-9,12);c.closePath();c.fill();c.stroke();c.restore();
  // A labelled scale, in metres, makes distance meaningful without inventing depth contours.
  c.strokeStyle='#dce5d1';c.lineWidth=3;c.beginPath();c.moveTo(40,504);c.lineTo(155,504);c.stroke();value('500 m',40,491,150,25,'#dce5d1');c.restore();
  c.strokeStyle='#31545c';c.lineWidth=2;c.strokeRect(chart.x,chart.y,chart.w,chart.h);
  cell('BOAT SPEED',number(state.speed,2),592,89,'kn');cell('HEADING',degrees(state.heading),902,89);
  cell('SOG',number(sog,2),592,243,'kn');cell('COG',degrees(cog),902,243);
  cell('DEPTH',number(state.depth),592,397,'m');
  label('APPARENT WIND',902,397,270,32);value(number(state.apparentWindSpeed),902,465,186,58);value('kn',1116,465,60,27,'#b4d0d0');
  const awa=state.apparentWindAngle;
  value(Number.isFinite(awa)?`${awa<-.5?'←':awa>.5?'→':'↑'} ${Math.abs(awa).toFixed(0)}°`:'—',902,518,270,38,'#f1cc86');
  // Bow-relative wind pointer, matching the apparent wind that powers the sails.
  const windX=822,windY=639,radius=46;
  c.strokeStyle='#527a81';c.lineWidth=2;c.beginPath();c.arc(windX,windY,radius,0,Math.PI*2);c.stroke();
  c.fillStyle='#d8e9df';c.beginPath();c.moveTo(windX,windY-22);c.lineTo(windX+8,windY+13);c.lineTo(windX-8,windY+13);c.closePath();c.fill();
  if(Number.isFinite(awa)&&state.apparentWindSpeed>1e-9){c.save();c.translate(windX,windY);c.rotate(awa*Math.PI/180);c.strokeStyle='#f1cc86';c.lineWidth=4;c.beginPath();c.moveTo(0,34);c.lineTo(0,-39);c.lineTo(-8,-28);c.moveTo(0,-39);c.lineTo(8,-28);c.stroke();c.restore();}
  c.strokeStyle='#31545c';c.lineWidth=2;c.beginPath();c.moveTo(20,535);c.lineTo(1180,535);c.stroke();
  label('HELM',24,595,270,32);value(`${state.rudder<-.5?'←':state.rudder>.5?'→':'↔'} ${number(Math.abs(state.rudder),0)}°`,24,683,270,52);
  label('Engine throttle',340,607,335,32);value(`${state.throttle<-.005?'▼':state.throttle>.005?'▲':'–'} ${number(Math.abs(state.throttle)*100,0)}%`,340,683,335,52,Math.abs(state.throttle)>.005?'#f1cc86':'#edfff3');
  label('Wind over water',914,600,260,30);value(`${number(state.waterWindSpeed)} kn`,914,650,260,39);value(degrees(state.waterWindDirection),914,700,260,34,'#b4d0d0');
  screen.userData.telemetry={speed:state.speed,speedOverGround:sog,heading:state.heading,courseOverGround:cog,depth:state.depth,apparentWindSpeed:state.apparentWindSpeed,apparentWindAngle:awa,windSpeed:state.windSpeed,windDirection:state.windDirection,waterWindSpeed:state.waterWindSpeed,waterWindDirection:state.waterWindDirection,waterWindAngle:state.waterWindAngle,rudder:state.rudder,throttle:state.throttle,language:getLanguage()};
  texture.needsUpdate=true;
 }
 return {group,canvas:texture.image,update(state,time){
  const sameTime=time===lastTime;lastTime=time;const tick=Math.floor(time*5);
  if(tick===lastTick&&!sameTime)return;
  const signature=JSON.stringify([getLanguage(),state.locationId,state.x,state.z,state.speed,state.heading,state.speedOverGround,state.courseOverGround,state.depth,state.apparentWindSpeed,state.apparentWindAngle,state.windSpeed,state.windDirection,state.waterWindSpeed,state.waterWindDirection,state.waterWindAngle,state.rudder,state.throttle,(state.worldBodies||[]).map(b=>[b.x,b.z,b.heading])]);
  if(signature===lastSignature)return;
  draw(state);lastSignature=signature;lastTick=tick;
 }};
}
