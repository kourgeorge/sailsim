import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mesh,box,cylinder,bar,rope,canvasTexture,labelTexture,batchStaticMeshes } from './materials.js';
import { angleDifference,clamp,VESSEL } from '../physics.js';
import { rigVisualState, smoothBoomAngle } from './rig-state.js';
import { createKeelGeometry } from './keel-geometry.js';
import { anchorSnapshot } from '../anchor.js';
import { createAnchorRig } from './anchor-rig.js';
import { widthAt,hullGeometry } from './hull-geometry.js';
import { createHelmDisplay } from './helm-display.js';

function deckOutline(){const shape=new THREE.Shape();shape.moveTo(0,6.6);for(let z=-6.6;z<=5.25;z+=.12)shape.lineTo(widthAt(z),-z);shape.lineTo(1.62,-5.25);shape.lineTo(-1.62,-5.25);for(let z=5.25;z>=-6.6;z-=.12)shape.lineTo(-widthAt(z),-z);shape.closePath();return shape;}

export function makeSail(parent,mat,{height,foot,jib=false,luffReach=4.8,mark='H  39'}){
 const rows=36,cols=18,pos=[],uv=[],index=[];
 for(let y=0;y<=rows;y++){const v=y/rows;for(let x=0;x<=cols;x++){const u=x/cols,chord=foot*(1-v),camber=Math.sin(u*Math.PI)*chord*.16;
  const z=jib?-luffReach*(1-v)+chord*u:chord*u;
  pos.push(camber,height*v,z);uv.push(u,v);
  if(y<rows&&x<cols){const k=y*(cols+1)+x;index.push(k,k+1,k+cols+2,k,k+cols+2,k+cols+1);}
 }}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(index);geometry.computeVertexNormals();
 const texture=canvasTexture(1024,2048,(c,w,h)=>{
  c.fillStyle='#f5f0df';c.fillRect(0,0,w,h);
  c.strokeStyle='#aaa998';c.lineWidth=1.4;for(let y=100;y<h;y+=160){c.beginPath();c.moveTo(0,y);c.bezierCurveTo(w*.3,y+30,w*.7,y+32,w,y+5);c.stroke();c.strokeStyle='#b7b5a3';c.beginPath();c.moveTo(0,y+6);c.lineTo(w,y+10);c.stroke();}
  c.strokeStyle='#ceccbb';c.lineWidth=18;c.strokeRect(8,8,w-16,h-16);
  c.fillStyle='#bec0ae';for(let y=260;y<h;y+=420){c.fillRect(w*.25,y,w*.75,9);}
  if(!jib){c.fillStyle='#16444c';c.font='600 115px sans-serif';c.textAlign='center';c.fillText(mark,w*.52,h*.35);c.font='36px sans-serif';c.fillText('H A V E N',w*.52,h*.43);c.fillStyle='#3b696b';c.fillRect(0,h*.84,w,80);}
 });
 const sailMat=mat.cloth.clone();sailMat.map=texture;const sail=mesh(parent,geometry,sailMat);sail.castShadow=false;
 // Visible bolt rope and leech, with real curvature rather than flat triangles.
 const edge=[];for(let i=0;i<=24;i++){const v=i/24;edge.push([0,height*v,jib?-luffReach*(1-v)+foot*(1-v):foot*(1-v)]);}
 const leech=rope(parent,mat.ivory,edge,.018,36);if(jib)leech.visible=false;
 const base=new Float32Array(pos);
 return {mesh:sail,update(time,luff,{angle=0,side=1,outhaul=.5,vang=.5,deploy=1}={}){const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const u=uv[i*2],v=uv[i*2+1],chord=foot*(1-v)*deploy;const bulge=base[i*3]*deploy*side*(1.3-outhaul*.6)+Math.sin(time*8+v*15+u*5)*luff*.11*Math.sin(u*Math.PI)*(1-v);const twist=(1-vang)*v*.14*side;const rotation=angle+twist;p.setXYZ(i,chord*u*Math.sin(rotation)+bulge*Math.cos(rotation),base[i*3+1],(jib?-luffReach*(1-v):0)+chord*u*Math.cos(rotation)-bulge*Math.sin(rotation));}p.needsUpdate=true;geometry.computeVertexNormals();}};
}
export function winch(parent,mat,x,y,z,color){
 cylinder(parent,mat.rubber,x,y,z,.18,.23,.09);cylinder(parent,mat.steel,x,y+.16,z,.13,.18,.28);
 cylinder(parent,mat.aluminum,x,y+.31,z,.20,.16,.045);cylinder(parent,mat.rubber,x,y+.34,z,.055,.055,.023);
 const coil=[];for(let i=0;i<=130;i++){const t=i/130*Math.PI*7;coil.push([x+Math.cos(t)*.147,y+.07+i/130*.16,z+Math.sin(t)*.147]);}rope(parent,color,coil,.018,110);
 bar(parent,mat.aluminum,[x,y+.36,z],[x+.29,y+.39,z+.02],.026);cylinder(parent,mat.rubber,x+.29,y+.45,z+.02,.035,.035,.14);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;bar(parent,mat.aluminum,[x+Math.cos(a)*.137,y+.07,z+Math.sin(a)*.137],[x+Math.cos(a)*.137,y+.24,z+Math.sin(a)*.137],.006,4);}
}
function cleat(parent,mat,x,y,z){box(parent,mat.steel,x,y,z,.16,.035,.32);bar(parent,mat.steel,[x,y,z-.1],[x,y+.13,z-.1],.022);bar(parent,mat.steel,[x,y,z+.1],[x,y+.13,z+.1],.022);bar(parent,mat.steel,[x,y+.13,z-.23],[x,y+.13,z+.23],.025);}
export function createYacht(mat,{detailed=true}={}){
 const boat=new THREE.Group();boat.name='Haven 39 sailing yacht';
 const hullMat=mat.gelcoat.clone();hullMat.side=THREE.DoubleSide;mesh(boat,hullGeometry(),hullMat);
 const shape=deckOutline();const cockpit=new THREE.Path();cockpit.moveTo(-.83,-1.1);cockpit.lineTo(-.83,-4.65);cockpit.lineTo(.83,-4.65);cockpit.lineTo(.83,-1.1);cockpit.closePath();shape.holes.push(cockpit);
 const deck=mesh(boat,new THREE.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1,curveSegments:32}),mat.grip,0,1.01,0);deck.rotation.x=-Math.PI/2;
 box(boat,mat.gelcoat,0,.45,5.22,3.22,1.1,.16,.06);
 box(boat,mat.teak,0,.2,5.48,2.55,.12,.52,.06);
 // Boot stripe follows the curved topsides along both sides.
 for(const side of [-1,1]){const points=[];for(let z=-6.55;z<=5.25;z+=.12)points.push([side*widthAt(z)*.985,.48,z]);rope(boat,mat.navy,points,.048,100);const rail=[];for(let z=-6.3;z<=5.25;z+=.25)rail.push([side*widthAt(z),1.105,z]);rope(boat,mat.teak,rail,.032,70);}
 // Keel and rudder extend below the waterline.
 mesh(boat,createKeelGeometry(VESSEL.draft),mat.navy);const rudder=box(boat,mat.navy,0,-.8,4.3,.11,1.5,.75,.05);
 // Sculpted coachroof and side windows.
 box(boat,mat.gelcoat,0,1.24,-1.25,2.85,.62,4.8,.23);box(boat,mat.grip,0,1.59,-1.5,2.32,.16,3.6,.08);
 for(const side of [-1,1]){for(let i=0;i<4;i++){const pane=box(boat,mat.glass,side*1.42,1.31,-2.95+i*.84,.035,.26,.64,.05);pane.rotation.z=side*-.1;}bar(boat,mat.teak,[side*.98,1.78,-2.75],[side*.98,1.78,-.38],.032);for(const z of [-2.7,-.45])bar(boat,mat.steel,[side*.98,1.65,z],[side*.98,1.78,z],.022);}
 for(const z of [-2.1,-4.4]){box(boat,mat.aluminum,0,z===-4.4?1.14:1.72,z,1.05,.065,.72,.06);box(boat,mat.glass,0,z===-4.4?1.18:1.76,z,.94,.025,.62,.045);}
 // Companionway with sliding hatch, slatted washboards, and step.
 box(boat,mat.rubber,0,1.22,1.16,1.09,.97,.035,.03);box(boat,mat.teak,0,1.23,1.19,.88,.87,.04,.025);for(let i=0;i<5;i++)box(boat,mat.rubber,0,1+i*.12,1.222,.80,.012,.015,.002);
 box(boat,mat.glass,0,1.73,.47,1.12,.07,1.4,.04);box(boat,mat.teak,0,.57,1.6,1.15,.09,.42);
 // Continuous cockpit sole and well sides overlap the deck opening and seats.
 // The former narrow sole left open seams at the forward edge and both sides.
 box(boat,mat.gelcoat,0,.37,2.9,1.82,.20,3.82,.025);
 box(boat,mat.teak,0,.465,2.875,1.74,.055,3.65,.018);
 for(const side of [-1,1])box(boat,mat.gelcoat,side*.855,.78,2.9,.11,.64,3.80,.025);
 box(boat,mat.gelcoat,0,.75,1.10,1.80,.61,.12,.025);
 box(boat,mat.gelcoat,0,.75,4.72,1.80,.61,.16,.025);
 for(const side of [-1,1]){
  box(boat,mat.gelcoat,side*1.3,.94,3, .91,.66,3.85,.12);
  box(boat,mat.teak,side*1.28,1.3,3,.78,.06,3.4,.06);
  box(boat,mat.cushion,side*1.29,1.37,3,.66,.105,3.15,.065);
  box(boat,mat.gelcoat,side*1.79,1.2,2.9,.24,.8,3.82,.1);
  const coaming=box(boat,mat.cushion,side*1.65,1.56,3,.14,.38,2.85,.06);coaming.rotation.z=side*.15;
  for(let z=1.6;z<=4.4;z+=.65)bar(boat,mat.ivory,[side*1.02,1.427,z],[side*1.53,1.427,z],.005,4);
  cleat(boat,mat,side*1.55,1.15,4.9);cleat(boat,mat,side*.67,1.23,-5.9);
 }
 // Stanchions, double lifelines, bow pulpit, and stern pushpit.
 for(const side of [-1,1]){const top=[],mid=[];for(const z of [-5.85,-4.4,-2.6,-.6,1.5,3.5,5.03]){const x=side*(widthAt(z)-.055);box(boat,mat.steel,x,1.13,z,.09,.04,.12);bar(boat,mat.steel,[x,1.1,z],[x,1.91,z],.021);top.push([x,1.91,z]);mid.push([x,1.53,z]);}rope(boat,mat.steel,top,.009,80);rope(boat,mat.steel,mid,.007,80);}
 rope(boat,mat.steel,[[-.67,1.91,-5.9],[-.4,1.98,-6.5],[0,2,-6.72],[.4,1.98,-6.5],[.67,1.91,-5.9]],.024,35);
 for(const side of [-1,1]){rope(boat,mat.steel,[[side*1.6,1.92,4.4],[side*1.6,1.92,5.24],[side*.63,1.92,5.3]],.023,24);bar(boat,mat.steel,[side*.64,1.05,5.27],[side*.64,1.92,5.27],.023);}
 const anchorRig=createAnchorRig(mat,{detailed});boat.add(anchorRig.group);
 if(!detailed){
  cylinder(boat,mat.aluminum,0,9.35,-1.95,.08,.105,16.5,12);
  bar(boat,mat.aluminum,[0,2.85,-1.95],[0,2.85,3.4],.085,8);
  box(boat,mat.navy,0,3,-.1,.35,.3,3.8,.06);
  bar(boat,mat.steel,[0,17.5,-1.95],[0,1.25,-6.5],.012);
  for(const side of [-1,1])bar(boat,mat.steel,[0,17.5,-1.95],[side*1.85,1.3,1],.009);
  batchStaticMeshes(boat,mergeGeometries);
  return {group:boat,update(){}};
 }
 if(detailed){
  // Anchor roller, chain, mooring hardware, fenders, and swim ladder.
  box(boat,mat.grip,0,1.2,-5.46,.8,.05,.58);
  for(const side of [-1,1])for(const z of [1.7,3.4]){const x=side*2.04;rope(boat,mat.ivory,[[side*1.92,1.88,z],[x,1.18,z],[x,.95,z]],.012,12);const f=mesh(boat,new THREE.CapsuleGeometry(.135,.50,5,10),mat.gelcoat,x,.63,z);f.rotation.z=side*.12;cylinder(boat,mat.navy,x,.98,z,.10,.09,.12);}
  for(const side of [-1,1])bar(boat,mat.steel,[side*.34,.3,5.55],[side*.34,-.5,5.85],.023);for(let i=0;i<4;i++)bar(boat,mat.steel,[-.34,.25-i*.2,5.6+i*.065],[.34,.25-i*.2,5.6+i*.065],.027);
  const lifering=mesh(boat,new THREE.TorusGeometry(.31,.095,10,36),mat.ivory,-1.28,1.7,5.28);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(boat,mat.red,-1.28+Math.cos(a)*.31,1.7+Math.sin(a)*.31,5.33,.13,.13,.09);}
  const transom=mesh(boat,new THREE.PlaneGeometry(1.4,.36),new THREE.MeshStandardMaterial({map:labelTexture('SERENITY','HAVEN ISLANDS'),transparent:true}),0,.69,5.313);
  // Sheet winches and paired banks of clutches.
  winch(boat,mat,-1.66,1.65,3.4,mat.red);winch(boat,mat,1.66,1.65,3.4,mat.green);
  winch(boat,mat,-1.05,1.8,.32,mat.blue);winch(boat,mat,1.05,1.8,.32,mat.ivory);
  for(const side of [-1,1])for(let i=0;i<3;i++){box(boat,mat.rubber,side*(.66+i*.18),1.79,-.15,.12,.13,.3);const lever=box(boat,mat.aluminum,side*(.66+i*.18),1.89,-.18,.07,.025,.23);lever.rotation.x=-.15;}
  for(const [side,color] of [[-1,mat.red],[1,mat.green]]){
   rope(boat,color,[[side*.25,2,-3.8],[side*1.53,1.2,-1.8],[side*1.73,1.3,.9],[side*1.64,1.78,3.4],[side*.78,.58,4.05]],.018,65);
   const coil=[];for(let i=0;i<130;i++){const a=i/130*Math.PI*10,r=.22+i/130*.09;coil.push([side*.51+Math.cos(a)*r,.51+Math.sin(a*2)*.005,4.12+Math.sin(a)*r*.75]);}rope(boat,color,coil,.015,130);
  }
  for(const [i,color] of [mat.blue,mat.ivory,mat.red,mat.green].entries()){const x=(i-1.5)*.095;rope(boat,color,[[x,5,-1.9],[x,1.82,-1.9],[.52+i*.17,1.8,-1.7],[.62+i*.17,1.85,-.4]],.012,40);}
 }
 // Spars, spreaders, stays, and turnbuckles.
 cylinder(boat,mat.aluminum,0,9.35,-1.95,.08,.105,16.5,16);
 for(const y of [7.3,12]){bar(boat,mat.aluminum,[-1.6,y,-1.95],[1.6,y,-1.95],.037);}
 for(const side of [-1,1]){rope(boat,mat.steel,[[side*1.87,1.22,-1.4],[side*1.6,7.3,-1.95],[side*1.6,12,-1.95],[0,17.5,-1.95]],.009,36);bar(boat,mat.steel,[side*1.87,1.22,-1.4],[side*1.85,1.68,-1.42],.027);bar(boat,mat.steel,[0,17.4,-1.95],[side*1.42,1.9,5.1],.008);}
 bar(boat,mat.steel,[0,17.5,-1.95],[0,1.25,-6.5],.012);cylinder(boat,mat.aluminum,0,1.28,-6.33,.115,.115,.22);
 const boomGroup=new THREE.Group();boomGroup.name='mainsail-boom';boomGroup.position.set(0,2.85,-1.95);boat.add(boomGroup);bar(boomGroup,mat.aluminum,[0,0,0],[0,0,5.35],.085,12);
 const mainGroup=new THREE.Group();mainGroup.position.y=.15;boomGroup.add(mainGroup);const mainsail=makeSail(mainGroup,mat,{height:14.35,foot:5.2});
 const jibGroup=new THREE.Group();jibGroup.position.set(0,1.8,-1.95);boat.add(jibGroup);const jib=makeSail(jibGroup,mat,{height:15.2,foot:5.4,jib:true});
 const furled=box(boomGroup,mat.cloth,0,.13,2.5,.23,.19,4.9,.08);furled.visible=false;
 const traveler=box(boat,mat.aluminum,0,1.92,.9,2.5,.065,.065);const travelerCar=box(boat,mat.rubber,0,1.97,.9,.19,.14,.12);travelerCar.name='traveler-car';
 const sheet=bar(boat,mat.ivory,[0,2,1],[0,2.8,2.8],.023);
 // Working pedestal and wheel. Displays face aft toward the helmsman.
 box(boat,mat.gelcoat,0,1.12,3.95,.40,1.34,.44,.12);
 const wheel=new THREE.Group();wheel.position.set(0,1.97,4.23);boat.add(wheel);wheel.rotation.x=-.10;
 mesh(wheel,new THREE.TorusGeometry(.63,.026,10,64),mat.teak);mesh(wheel,new THREE.TorusGeometry(.60,.008,6,64),mat.steel);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;bar(wheel,mat.steel,[0,0,0],[Math.cos(a)*.6,Math.sin(a)*.6,0],.013);}
 const boss=cylinder(wheel,mat.steel,0,0,0,.084,.084,.10);boss.rotation.x=Math.PI/2;
 const compass=cylinder(boat,mat.rubber,0,1.95,3.87,.16,.19,.15);mesh(boat,new THREE.SphereGeometry(.15,24,12,0,Math.PI*2,0,Math.PI/2),mat.glass,0,2.02,3.87);
 const display=createHelmDisplay(boat,mat);display.group.position.set(0,2.84,3.87);display.group.rotation.x=-.15;
 // One multifunction screen on the pedestal guard, facing the helmsman.
 // Its lower edge clears the wheel from the default seated/standing eye line.
 for(const side of [-1,1])bar(boat,mat.steel,[side*.68,1.5,3.85],[side*.68,3.28,3.85],.025);
 bar(boat,mat.steel,[-.68,3.28,3.85],[.68,3.28,3.85],.025);
 const throttleLever=new THREE.Group();throttleLever.position.set(.25,1.44,4.03);boat.add(throttleLever);bar(throttleLever,mat.steel,[0,0,0],[.15,.36,0],.02);mesh(throttleLever,new THREE.SphereGeometry(.06,12,8),mat.rubber,.15,.36,0);
 // Red/green navigation lights and masthead fitting.
 for(const side of [-1,1]){const lampMat=new THREE.MeshStandardMaterial({color:side<0?'#ab3e32':'#218873',emissive:side<0?'#d13113':'#14a67c',emissiveIntensity:.35});mesh(boat,new THREE.SphereGeometry(.052,12,8),lampMat,side*.5,1.88,-6.05);}
 bar(boat,mat.steel,[0,17.6,-1.95],[0,18,-1.95],.015);
 const windVane=new THREE.Group();windVane.name='masthead-wind-vane';windVane.position.set(0,17.95,-1.95);boat.add(windVane);
 // Rotate pointer and tail together around the masthead bearing. The pointer
 // faces the apparent wind source; the broader red tail trails downwind.
 bar(windVane,mat.steel,[0,0,.3],[0,0,-.43],.008);
 box(windVane,mat.red,0,0,.19,.24,.008,.18);
 const vaneArrow=mesh(windVane,new THREE.ConeGeometry(.055,.14,4),mat.red,0,0,-.46);vaneArrow.rotation.x=-Math.PI/2;
 const bow=[];for(let i=0;i<2;i++){bow.push(mesh(boat,new THREE.PlaneGeometry(.7,2),new THREE.MeshBasicMaterial({color:'#d5f3ef',transparent:true,opacity:.15,depthWrite:false}),i?1:-1,.025,-4.5));bow[i].rotation.x=-Math.PI/2;}
 batchStaticMeshes(boat,mergeGeometries,[rudder,sheet,travelerCar,...bow]);
 let previousRigTime=null;
 return {group:boat,instrumentCanvas:display.canvas,update(state,time){
  const windAngle=state.apparentWindAngle??angleDifference(state.windDirection,state.heading),sign=Math.sign(windAngle)||1;
  const rig=rigVisualState(state),rigElapsed=previousRigTime===null?0:time-previousRigTime;
  boomGroup.rotation.y=previousRigTime===null?rig.boomAngle:smoothBoomAngle(boomGroup.rotation.y,rig.boomAngle,rigElapsed);
  if(Number.isFinite(time))previousRigTime=time;
  const mainHoist=state.mainHoist??Number(Boolean(state.sails)),jibHoist=state.jibHoist??Number(Boolean(state.sails));
  mainGroup.scale.y=mainHoist*[1,.72,.48][state.reefLevel??Number(Boolean(state.reef))];mainGroup.visible=mainHoist>.01;furled.visible=mainHoist<.99;
  jibGroup.visible=jibHoist>.01;
  const mainLuff=state.mainFlow==='Luffing'?1:state.mainFlow==='Stalled'?.45:.08;
  mainsail.update(time,mainLuff,{side:-sign,outhaul:state.outhaul??.5,vang:state.vang??.5});
  jib.update(time,state.jibFlow==='Luffing'?1:.08,{angle:-sign*(state.jibSheet??40)*Math.PI/180,side:-sign,outhaul:.5,vang:.7,deploy:jibHoist});
  travelerCar.position.x=rig.travelerX;
  throttleLever.rotation.x=-(state.throttle??0)*.7;
  wheel.rotation.z=-state.rudder*Math.PI/180*2;rudder.rotation.y=-state.rudder*Math.PI/180;windVane.rotation.y=rig.windVaneAngle;
  const tip=new THREE.Vector3(0,0,4.6).applyAxisAngle(new THREE.Vector3(0,1,0),boomGroup.rotation.y).add(boomGroup.position),base=new THREE.Vector3(travelerCar.position.x,1.99,.9),delta=tip.clone().sub(base);
  sheet.position.copy(tip).add(base).multiplyScalar(.5);sheet.scale.y=delta.length()/Math.hypot(.8,1.8);sheet.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  display.update(state,time);bow.forEach(m=>{m.visible=state.speed>1;m.material.opacity=clamp(state.speed*.03,0,.22);});
  anchorRig.update(anchorSnapshot(state),boat);
 }};
}
