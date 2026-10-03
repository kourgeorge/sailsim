import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { getLocation } from '../locations.js';
import { getWorldBodyDefinitions, getWorldRockDefinitions } from '../world/bodies.js';
import { syncBodyTransform } from './body-motion.js';
import { islandHeight } from './geography.js';
import { installHullWaterExclusion } from './hull-geometry.js';
import { createMobileWater } from './mobile-water.js';
import { createIslandTerrain, createShoreline } from './shoreline.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from '../world/coastal-features.js';
import { createCoastalVillage } from './coastal-village.js';
import { createMarineLife } from './marine-life.js';
import { createBirdLife } from './bird-life.js';
import { mesh,box,cylinder,bar,rope,canvasTexture,seededRandom,batchStaticMeshes } from './materials.js';

function normalTexture(){
 const size=256,data=new Uint8Array(size*size*4),random=seededRandom(997),waves=[];
 for(let i=0;i<20;i++)waves.push({x:Math.round((random()-.5)*35)||1,y:Math.round((random()-.5)*35)||1,a:.5/(1+i*.20),p:random()*6.28});
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){let dx=0,dy=0;for(const w of waves){const d=Math.cos((x*w.x+y*w.y)/size*Math.PI*2+w.p)*w.a;dx+=d*w.x*.024;dy+=d*w.y*.024;}const n=new THREE.Vector3(-dx,-dy,2).normalize(),i=(y*size+x)*4;data[i]=(n.x*.5+.5)*255;data[i+1]=(n.y*.5+.5)*255;data[i+2]=(n.z*.5+.5)*255;data[i+3]=255;}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
function cloudDome(){
 return new THREE.Mesh(new THREE.SphereGeometry(3900,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 ray; void main(){ray=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 ray;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.04+vec2(11.4,7.8);a*=.52;}return v;}
 void main(){vec3 d=normalize(ray);if(d.y<.015)discard;vec2 p=d.xz/(d.y+.16)*2.2+vec2(time*.002,0);float f=fbm(p);float density=smoothstep(.53,.78,f)*smoothstep(.015,.15,d.y);vec3 color=mix(vec3(.57,.64,.67),vec3(1.,.96,.87),smoothstep(.50,.79,f));gl_FragColor=vec4(color,density*.66);}` }));
}
export function createEnvironment(scene,renderer,mat,{quality,locationId='haven'}={}){
 const location=getLocation(locationId),{islands}=location;
 const definitions=getWorldBodyDefinitions(location.id),buoys=definitions.filter(body=>body.visual.type==='buoy');
 const random=seededRandom(83),sunDirection=new THREE.Vector3(-.8,.64,-1.1).normalize();
 const sky=new Sky();sky.scale.setScalar(4500);scene.add(sky);
 const u=sky.material.uniforms;u.turbidity.value=2.5;u.rayleigh.value=2.0;u.mieCoefficient.value=.005;u.mieDirectionalG.value=.83;u.sunPosition.value.copy(sunDirection).multiplyScalar(4500);
 const generator=new THREE.PMREMGenerator(renderer),environmentScene=new THREE.Scene();environmentScene.add(sky.clone());const environmentMap=generator.fromScene(environmentScene,.03);scene.environment=environmentMap.texture;scene.environmentIntensity=.55;generator.dispose();
 const clouds=cloudDome();clouds.visible=quality.clouds;scene.add(clouds);
 scene.add(new THREE.HemisphereLight('#cde9ff','#53503f',1.25));
 const sun=new THREE.DirectionalLight('#fff0d5',3.1);sun.castShadow=true;sun.shadow.mapSize.set(quality.shadowSize||512,quality.shadowSize||512);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=1;sun.shadow.camera.far=130;sun.shadow.normalBias=.015;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun,sun.target);
 const waterGeometry=new THREE.PlaneGeometry(12000,12000),waterOptions={waterNormals:normalTexture(),sunDirection,sunColor:'#fff4dd',waterColor:'#217887'};
 const water=quality.reflectionSize>0
  ?new Water(waterGeometry,{...waterOptions,textureWidth:quality.reflectionSize,textureHeight:quality.reflectionSize,distortionScale:2.8,fog:true})
  :createMobileWater(waterGeometry,waterOptions);
 water.rotation.x=-Math.PI/2;water.position.y=-.07;water.material.uniforms.size.value=2.3;
 // Replace the overly reflective default with water's physical normal-incidence Fresnel value.
 if(water.isWater)water.material.fragmentShader=water.material.fragmentShader.replace('float rf0 = 0.3;','float rf0 = 0.022;').replace('( sunColor * diffuseLight * 0.3 + scatter )','( waterColor * ( 0.65 + diffuseLight * 0.45 ) + scatter * 0.35 )').replace('reflectance);','reflectance * 0.68);');
 const excludeWater=installHullWaterExclusion(water.material);
 scene.add(water);
 const shoreline=createShoreline(scene,location,waterOptions.waterNormals);
 const excludeHullWater=boat=>{excludeWater(boat);shoreline.excludeHullWater(boat);};
 // Water keeps its reflection target in a closure and exposes no dispose method.
 // Capture that target through the renderer's public API on its first reflection.
 const reflect=water.onBeforeRender,reflectionTexture=water.material.uniforms.mirrorSampler?.value;
 let reflectionTarget=null,reflectionFrame=0,environmentDisposed=false;
 if(water.isWater)water.onBeforeRender=function(...args){
  if(environmentDisposed || reflectionFrame++%quality.reflectionInterval!==0)return;
  if(reflectionTarget){reflect.apply(this,args);return;}
  const drawingRenderer=args[0],setTarget=drawingRenderer.setRenderTarget;
  drawingRenderer.setRenderTarget=function(target,...rest){
   if(target?.texture===water.material.uniforms.mirrorSampler.value){reflectionTarget=target;target.setSize(quality.reflectionSize,quality.reflectionSize);}
   return setTarget.call(this,target,...rest);
  };
  try{reflect.apply(this,args);}finally{drawingRenderer.setRenderTarget=setTarget;}
 };
 function setQuality(next){
  const shadowSize=next.shadowSize||512;
  if(sun.shadow.mapSize.x!==shadowSize){
   sun.shadow.map?.dispose();sun.shadow.map=null;
   sun.shadow.mapSize.set(shadowSize,shadowSize);
  }
  renderer.shadowMap.enabled=next.shadowSize>0;
  renderer.shadowMap.needsUpdate=true;
  if(reflectionTarget && next.reflectionSize!==quality.reflectionSize)reflectionTarget.setSize(next.reflectionSize,next.reflectionSize);
  quality=next;clouds.visible=quality.clouds;reflectionFrame=0;marineLife.setQuality(next);birdLife.setQuality(next);
 }


 const rockMap=canvasTexture(256,256,(c,w,h)=>{const img=c.createImageData(w,h);for(let i=0;i<img.data.length;i+=4){const shade=150+random()*90;img.data[i]=shade;img.data[i+1]=shade;img.data[i+2]=shade;img.data[i+3]=255;}c.putImageData(img,0,0);for(let i=0;i<100;i++){c.strokeStyle='#38382920';c.lineWidth=random()*3;c.beginPath();c.moveTo(random()*w,random()*h);c.lineTo(random()*w,random()*h);c.stroke();}});
 const groundMat=new THREE.MeshStandardMaterial({vertexColors:true,map:rockMap,bumpMap:rockMap,bumpScale:.14,roughness:1});
 const bark=mat.paint('#574f39',{roughness:1}),leaves=mat.paint('#3f5238',{roughness:.94});
 const coastalFeatures=getCoastalFeatures(location.id);
 const treePoints=[],rockPoints=getWorldRockDefinitions(location.id);
 for(const island of islands){const ground=new THREE.Mesh(createIslandTerrain(island),groundMat);ground.receiveShadow=true;ground.castShadow=true;scene.add(ground);
  for(let i=0;i<location.treeDensity;i++){const a=random()*Math.PI*2,r=.18+Math.sqrt(random())*.72;const x=island.x+Math.cos(a)*island.rx*r,z=island.z+Math.sin(a)*island.rz*r,y=islandHeight(x,z,island);if(y>4&&clearOfCoastalBuildings(x,z,coastalFeatures)){treePoints.push({x,y,z,scale:.65+random()*1.1,angle:random()*Math.PI*2,color:new THREE.Color().setHSL(.22+random()*.08,.19+random()*.10,.19+random()*.08)});}}

 }
 // Instanced, irregular umbrella pines: layered organic crowns with visible trunks.
 const crowns=[];for(const [x,y,z,sx,sy,sz] of [[0,5.4,0,2.8,1.4,2.6],[-1.4,4.7,.3,1.8,1.25,1.8],[1.25,5.05,-.5,1.9,1.3,1.6],[.4,5.9,.6,1.7,1.05,1.6]]){const g=new THREE.IcosahedronGeometry(1,0);g.scale(sx,sy,sz);g.translate(x,y,z);crowns.push(g);}const crownGeometry=mergeGeometries(crowns);
 const foliage=new THREE.InstancedMesh(crownGeometry,leaves,treePoints.length),trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.15,.27,4.6,6),bark,treePoints.length),dummy=new THREE.Object3D();
 treePoints.forEach((t,i)=>{dummy.position.set(t.x,t.y,t.z);dummy.scale.setScalar(t.scale);dummy.rotation.set(0,t.angle,0);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,t.color);dummy.position.y+=2.3*t.scale;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);});foliage.receiveShadow=true;scene.add(foliage,trunks);
 const stones=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat.paint('#969586',{roughness:1}),rockPoints.length);rockPoints.forEach((r,i)=>{dummy.position.set(r.x,r.y,r.z);dummy.scale.set(r.scale,r.scale*.65,r.scale*.78);dummy.rotation.set(r.pitch,r.angle,r.roll);dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);stones.setColorAt(i,new THREE.Color().setHSL(.10,.06,r.shade));});stones.receiveShadow=true;scene.add(stones);
 // Lighthouse with gallery, glazed lantern room, door, and a stone retaining terrace.
 if(location.lighthouse){
 const {islandIndex,x:lx,z:lz}=location.lighthouse,isle=islands[islandIndex],ly=islandHeight(lx,lz,isle);
 const tower=new THREE.Group();tower.position.set(lx,ly,lz);scene.add(tower);
 cylinder(tower,mat.paint('#8b8877'),0,.8,0,9,10,1.6,32);cylinder(tower,mat.gelcoat,0,10.2,0,2.3,3.2,19,32);
 cylinder(tower,mat.navy,0,13.9,0,2.49,2.6,2.2,32);cylinder(tower,mat.steel,0,20,0,3.45,3.45,.4,32);cylinder(tower,mat.glass,0,21.4,0,2.1,2.1,2.5,16);mesh(tower,new THREE.ConeGeometry(2.8,2,24),mat.paint('#53636b'),0,23.6,0);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;bar(tower,mat.steel,[Math.cos(a)*3.2,20.2,Math.sin(a)*3.2],[Math.cos(a)*3.2,21.4,Math.sin(a)*3.2],.05);}
 const gallery=mesh(tower,new THREE.TorusGeometry(3.2,.06,6,48),mat.steel,0,21.35,0);gallery.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;bar(tower,mat.navy,[Math.cos(a)*2.13,20.1,Math.sin(a)*2.13],[Math.cos(a)*2.13,22.8,Math.sin(a)*2.13],.06);}
 box(tower,mat.teak,2.8,2.3,0,.09,3.1,1.3);for(const y of [7,12,17])box(tower,mat.glass,2.55,y,0,.04,1.2,.63);
 }
 // Fixed collision fixtures are also the marina's rendering transforms.
 for(const definition of definitions.filter(body=>body.visual.type==='pier')){
  const pier=new THREE.Group();pier.userData.bodyId=definition.id;
  pier.position.set(definition.x,0,definition.z);pier.rotation.y=-definition.heading*Math.PI/180;scene.add(pier);
  const spine=definition.visual.index===-1;
  box(pier,mat.teak,0,spine?.7:.85,0,definition.shape.beam,spine?1:.45,definition.shape.length,spine?.12:.05);
  if(!spine){
   for(const z of [-12,12]){cylinder(pier,mat.teak,0,0,z,.25,.30,6);cylinder(pier,mat.gelcoat,0,2.6,z,.28,.28,.2);}
   box(pier,mat.gelcoat,1.5,1.4,-13,.55,1.1,.55);box(pier,mat.blue,1.5,1.8,-12.7,.26,.16,.04);
  }
 }
 const navigation=[];
 buoys.forEach((b,i)=>{const g=new THREE.Group();g.position.set(b.x,0,b.z);g.userData.bodyId=b.id;scene.add(g);navigation.push(g);cylinder(g,mat.paint('#c79e48'),0,.25,0,.7,1.03,.7);cylinder(g,mat.paint('#d7b35e'),0,1,0,.4,.7,.9);cylinder(g,mat.rubber,0,1.6,0,.32,.32,.35);cylinder(g,mat.paint('#d7b35e'),0,2.15,0,.25,.29,.8);bar(g,mat.steel,[0,2.4,0],[0,3.4,0],.032);mesh(g,new THREE.ConeGeometry(.25,.5,10),mat.red,0,3.5,0);
  const tex=canvasTexture(128,128,(c)=>{c.fillStyle='#e6c570';c.fillRect(0,0,128,128);c.fillStyle='#252d25';c.font='bold 90px sans-serif';c.textAlign='center';c.fillText(String(i+1),64,101);});mesh(g,new THREE.PlaneGeometry(.46,.46),new THREE.MeshStandardMaterial({map:tex}),0,1.1,.57);
 });
 // All land above is charted and participates in depth/grounding.
 // Foam trail as a soft textured surface rather than rigid white rectangles.
 const foamTexture=canvasTexture(256,512,(c,w,h)=>{c.clearRect(0,0,w,h);for(let i=0;i<3200;i++){const y=random()*h,t=y/h,x=w/2+(random()-.5)*(35+t*190);c.fillStyle=`rgba(220,244,238,${(1-t)*random()*.23})`;c.beginPath();c.ellipse(x,y,1+random()*4,1+random()*7,0,0,6.28);c.fill();}});
 const wake=new THREE.Mesh(new THREE.PlaneGeometry(12,45),new THREE.MeshBasicMaterial({map:foamTexture,transparent:true,opacity:.5,depthWrite:false}));wake.rotation.x=-Math.PI/2;scene.add(wake);
 for(const child of [...scene.children]){if(child.isGroup){batchStaticMeshes(child,mergeGeometries);if(!navigation.includes(child)){child.updateMatrix();for(const part of [...child.children]){if(part.isMesh){part.applyMatrix4(child.matrix);scene.add(part);}}scene.remove(child);}}}
 batchStaticMeshes(scene,mergeGeometries,[water,wake]);
 createCoastalVillage(scene,coastalFeatures);
 const marineLife=createMarineLife(scene,location.id,quality);
 const birdLife=createBirdLife(scene,location.id,quality);
 return {water,excludeHullWater,setQuality,marineLife,birdLife,update(state,time){
  shoreline.update(state,time);marineLife.update(state,time);birdLife.update(state,time);
  water.material.uniforms.time.value=time*.45;water.material.uniforms.distortionScale.value=1.8+state.windSpeed*.07;clouds.material.uniforms.time.value=time;
  sun.position.set(state.x+sunDirection.x*65,45,state.z+sunDirection.z*65);sun.target.position.set(state.x,4,state.z);
  const bodies=new Map((state.worldBodies||[]).map(body=>[body.id,body]));
  navigation.forEach((g,i)=>syncBodyTransform(g,bodies.get(g.userData.bodyId)||buoys[i],state.elapsed||0,time,i));
  // The plane's local Z axis points up after flattening; match the yacht's negative yaw.
  wake.position.set(state.x-Math.sin(state.heading*Math.PI/180)*26,.01,state.z+Math.cos(state.heading*Math.PI/180)*26);wake.rotation.z=-state.heading*Math.PI/180;wake.visible=state.speed>.4;wake.material.opacity=Math.min(.66,state.speed*.1);
 },dispose(){
  const ownedTextures=new Set([environmentMap.texture]);
  if(reflectionTexture)ownedTextures.add(reflectionTexture);
  if(environmentDisposed)return ownedTextures;
  environmentDisposed=true;water.onBeforeRender=()=>{};
  environmentMap.dispose();
  if(reflectionTarget)reflectionTarget.dispose();else reflectionTexture?.dispose();
  reflectionTarget=null;
  return ownedTextures;
 }};
}
