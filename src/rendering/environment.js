import * as THREE from 'three';
import { createDesktopWater } from './desktop-water.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { getLocation } from '../locations.js';
import { getWorldBodyDefinitions, getWorldRockDefinitions } from '../world/bodies.js';
import { syncBodyTransform } from './body-motion.js';
import { islandHeight } from './geography.js';
import { installHullWaterExclusion } from './hull-geometry.js';
import { createMobileWater } from './mobile-water.js';
import { createWaterGeometry } from './water-geometry.js';
import { getVessel } from '../vessels.js';
import { createIslandTerrain, createShoreline } from './shoreline.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from '../world/coastal-features.js';
import { createCoastalVillage } from './coastal-village.js';
import { createMarineLife } from './marine-life.js';
import { createBirdLife } from './bird-life.js';
import { createLandDetails } from './land-details.js';
import { createLandAnimals } from './land-animals.js';
import { createCruiseShip } from './cruise-ship.js';
import { createAtmosphere } from './sky.js';
import { createDestinationScenery, createDestinationTrees } from './destination-scenery.js';
import { installDestinationWater } from './destination-water.js';
import { createDestinationNature } from './destination-nature.js';
import { mesh,box,cylinder,bar,rope,canvasTexture,seededRandom,batchStaticMeshes } from './materials.js';

function normalTexture(){
 const size=256,data=new Uint8Array(size*size*4),random=seededRandom(997),waves=[];
 for(let i=0;i<20;i++)waves.push({x:Math.round((random()-.5)*35)||1,y:Math.round((random()-.5)*35)||1,a:.5/(1+i*.20),p:random()*6.28});
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){let dx=0,dy=0;for(const w of waves){const d=Math.cos((x*w.x+y*w.y)/size*Math.PI*2+w.p)*w.a;dx+=d*w.x*.024;dy+=d*w.y*.024;}const n=new THREE.Vector3(-dx,-dy,2).normalize(),i=(y*size+x)*4;data[i]=(n.x*.5+.5)*255;data[i+1]=(n.y*.5+.5)*255;data[i+2]=(n.z*.5+.5)*255;data[i+3]=255;}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
export function createEnvironment(scene,renderer,mat,{quality,locationId='haven',vesselId='monohull'}={}){
 const vessel=getVessel(vesselId);
 const location=getLocation(locationId),{islands}=location;
 const definitions=getWorldBodyDefinitions(location.id),buoys=definitions.filter(body=>body.visual.type==='buoy');
 const random=seededRandom(83),sunDirection=new THREE.Vector3(-.8,location.character?.sunHeight??.64,-1.1).normalize();
 const atmosphere=createAtmosphere(scene,sunDirection,location,quality),{sky}=atmosphere;
 const generator=new THREE.PMREMGenerator(renderer),environmentScene=new THREE.Scene();environmentScene.add(sky.clone());const environmentMap=generator.fromScene(environmentScene,.03);scene.environment=environmentMap.texture;scene.environmentIntensity=.55;generator.dispose();
 const ambient=new THREE.HemisphereLight('#cde9ff','#53503f',1.25);scene.add(ambient);
 const sun=new THREE.DirectionalLight('#fff0d5',3.1);sun.castShadow=true;sun.shadow.mapSize.set(quality.shadowSize||512,quality.shadowSize||512);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=1;sun.shadow.camera.far=130;sun.shadow.normalBias=.015;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun,sun.target);
 const waterSpan=location.coordinates?Math.max(120000,location.chart.span*6):12000;
 const waterColor=location.character?.water??(location.biome==='fjord'?'#225b6b':'#217887');
 const waterGeometry=createWaterGeometry(waterSpan),waterOptions={waterNormals:normalTexture(),sunDirection,sunColor:'#fff4dd',waterColor};
 const water=quality.reflectionSize>0
  ?createDesktopWater(waterGeometry,{...waterOptions,textureWidth:quality.reflectionSize,textureHeight:quality.reflectionSize,distortionScale:2.8,fog:true})
  :createMobileWater(waterGeometry,waterOptions);
 water.rotation.x=-Math.PI/2;water.position.y=-.07;water.material.uniforms.size.value=2.3;
 if(location.character)installDestinationWater(water.material,location);
 const excludeWater=installHullWaterExclusion(water.material,{vesselId:vessel.id});
 scene.add(water);
 const shoreline=createShoreline(scene,location,waterOptions.waterNormals,{vesselId:vessel.id});
 const excludeHullWater=boat=>{excludeWater(boat);shoreline.excludeHullWater(boat);};
 // Water keeps its reflection target in a closure and exposes no dispose method.
 // Capture that target through the renderer's public API on its first reflection.
 const reflect=water.onBeforeRender,reflectionTexture=water.material.uniforms.mirrorSampler?.value;
 let reflectionTarget=null,reflectionFrame=0,environmentDisposed=false;
 if(water.isWater)water.onBeforeRender=function(...args){
  if(environmentDisposed || reflectionFrame++%quality.reflectionInterval!==0)return;
  // Foam belongs to the surface itself. Reflecting it doubles the trail and
  // makes the duplicate jump whenever this lower-rate capture is refreshed.
  const wakeVisibility=wakes.map(wake=>{const visible=wake.visible;wake.visible=false;return visible;});
  const drawingRenderer=args[0],setTarget=drawingRenderer.setRenderTarget;
  if(!reflectionTarget)drawingRenderer.setRenderTarget=function(target,...rest){
   if(target?.texture===water.material.uniforms.mirrorSampler.value){reflectionTarget=target;target.setSize(quality.reflectionSize,quality.reflectionSize);}
   return setTarget.call(this,target,...rest);
  };
  try{reflect.apply(this,args);}finally{drawingRenderer.setRenderTarget=setTarget;wakes.forEach((wake,i)=>{wake.visible=wakeVisibility[i];});}
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
  quality=next;atmosphere.setQuality(next);reflectionFrame=0;marineLife.setQuality(next);birdLife.setQuality(next);landDetails.setQuality(next);landAnimals.setQuality(next);cruiseShip.setQuality(next);
 }


 const rockMap=canvasTexture(256,256,(c,w,h)=>{const img=c.createImageData(w,h);for(let i=0;i<img.data.length;i+=4){const shade=150+random()*90;img.data[i]=shade;img.data[i+1]=shade;img.data[i+2]=shade;img.data[i+3]=255;}c.putImageData(img,0,0);for(let i=0;i<100;i++){c.strokeStyle='#38382920';c.lineWidth=random()*3;c.beginPath();c.moveTo(random()*w,random()*h);c.lineTo(random()*w,random()*h);c.stroke();}});
 const groundMat=new THREE.MeshStandardMaterial({vertexColors:true,map:rockMap,bumpMap:rockMap,bumpScale:.14,roughness:1});
 const bark=mat.paint('#574f39',{roughness:1}),leaves=mat.paint(location.biome==='fjord'?'#ffffff':'#3f5238',{roughness:.94});
 const coastalFeatures=getCoastalFeatures(location.id);
 const treePoints=[],rockPoints=getWorldRockDefinitions(location.id);
 for(const island of islands){const ground=new THREE.Mesh(createIslandTerrain(island),groundMat);ground.receiveShadow=true;ground.castShadow=true;scene.add(ground);
  for(let i=0;i<(location.character?0:location.treeDensity);i++){const a=random()*Math.PI*2,r=.18+Math.sqrt(random())*.72;const x=island.x+Math.cos(a)*island.rx*r,z=island.z+Math.sin(a)*island.rz*r,y=islandHeight(x,z,island);const slope=Math.hypot(islandHeight(x+1,z,island)-y,islandHeight(x,z+1,island)-y);if(y>4&&(location.biome!=='fjord'||(y<260&&slope<1.3))&&clearOfCoastalBuildings(x,z,coastalFeatures)){treePoints.push({x,y,z,scale:.65+random()*1.1,angle:random()*Math.PI*2,color:new THREE.Color().setHSL(.22+random()*.08,.19+random()*.10,.19+random()*.08)});}}

 }
 // Instanced, irregular umbrella pines: layered organic crowns with visible trunks.
 const crowns=[];
 if(location.biome==='fjord')for(const [radius,height,y] of [[2.3,5.5,5],[1.7,4.7,7],[1,3.5,8.8]]){const g=new THREE.ConeGeometry(radius,height,7).toNonIndexed();g.translate(0,y,0);crowns.push(g);}
 else for(const [x,y,z,sx,sy,sz] of [[0,5.4,0,2.8,1.4,2.6],[-1.4,4.7,.3,1.8,1.25,1.8],[1.25,5.05,-.5,1.9,1.3,1.6],[.4,5.9,.6,1.7,1.05,1.6]]){const g=new THREE.IcosahedronGeometry(1,0);g.scale(sx,sy,sz);g.translate(x,y,z);crowns.push(g);}const crownGeometry=mergeGeometries(crowns);crowns.forEach(g=>g.dispose());
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
 const foamTexture=canvasTexture(256,512,(c,w,h)=>{c.clearRect(0,0,w,h);for(let i=0;i<3200;i++){const y=random()*h,t=y/h,x=w/2+(random()-.5)*(35+t*190);c.fillStyle=`rgba(220,244,238,${Math.min(1,t/.025)*(1-t)*random()*.23})`;c.beginPath();c.ellipse(x,y,1+random()*4,1+random()*7,0,0,6.28);c.fill();}});
 const wakes=(vessel.type==='catamaran'?[-vessel.hullSpacing/2,vessel.hullSpacing/2]:[0]).map(across=>{
  const wake=new THREE.Mesh(new THREE.PlaneGeometry(vessel.type==='catamaran'?5:12,45),new THREE.MeshBasicMaterial({map:foamTexture,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));wake.name='Stern wake';wake.rotation.x=-Math.PI/2;wake.renderOrder=1;wake.userData.across=across;scene.add(wake);return wake;
 });
 for(const child of [...scene.children]){if(child.isGroup){batchStaticMeshes(child,mergeGeometries);if(!navigation.includes(child)){child.updateMatrix();for(const part of [...child.children]){if(part.isMesh){part.applyMatrix4(child.matrix);scene.add(part);}}scene.remove(child);}}}
 batchStaticMeshes(scene,mergeGeometries,[water,...wakes]);
 if(location.character)createDestinationTrees(scene,location,quality);
 const destinationScenery=location.character?createDestinationScenery(scene,location):null;
 const destinationNature=location.character?createDestinationNature(scene,location):null;
 if(!location.character)createCoastalVillage(scene,coastalFeatures,{nordic:location.biome==='fjord'});
 const marineLife=createMarineLife(scene,location.id,quality);
 const birdLife=createBirdLife(scene,location.id,quality);
 const landDetails=createLandDetails(scene,location);landDetails.setQuality(quality);
 const landAnimals=createLandAnimals(scene,location.id,quality,{obstacles:[...treePoints.map(t=>({x:t.x,z:t.z,radius:t.scale*.4})),...rockPoints.map(r=>({x:r.x,z:r.z,radius:r.scale}))]});
 const cruiseShip=createCruiseShip(scene,location.id,quality);
 let secretPending=false,nightMode=null;
 return {water,excludeHullWater,setQuality,marineLife,birdLife,landDetails,landAnimals,cruiseShip,summonAnimal(){secretPending=true;},update(state,time,view){
  const night=state.timeOfDay==='night';
  if(night!==nightMode){
   nightMode=night;atmosphere.setNight(night);
   ambient.color.set(night?'#90b4e8':'#cde9ff');ambient.groundColor.set(night?'#182c43':'#53503f');ambient.intensity=night?.24:1.25;
   sun.color.set(night?'#a6c5f2':location.character?.sun??'#fff0d5');sun.intensity=night?.32:3.1;
   scene.environmentIntensity=night?.055:.55;
   scene.fog.color.set(night?'#101c30':location.character?.haze??'#b7c7ce');scene.background.set(night?'#101c30':location.character?.haze??'#b5c9d2');
   water.material.uniforms.sunColor.value.set(night?'#738fba':'#fff4dd');
   water.material.uniforms.waterColor.value.set(night?'#071727':waterColor);
   if(water.material.uniforms.destinationDay)water.material.uniforms.destinationDay.value=night?0:1;
   water.material.uniforms.skyColor?.value.set(night?'#0b1630':'#6da8d5');
   water.material.uniforms.horizonColor?.value.set(night?'#101c30':'#b7c7ce');
  }
  destinationNature?.update(time);destinationScenery?.update(time);shoreline.update(state,time);marineLife.update(state,time,view);birdLife.update(state,time,view);landDetails.update(time);landAnimals.update(state,time,view);cruiseShip.update(state,time,view,view?.freeSailing);
  if(secretPending){secretPending=false;if(marineLife.encounters.summon(state,time,view))marineLife.update(state,time,view);else{birdLife.encounters.summon(state,time,view);birdLife.update(state,time,view);}}
  water.material.uniforms.time.value=time*.45;water.material.uniforms.distortionScale.value=1.8+state.windSpeed*.07;atmosphere.update(state,time,view);
  sun.position.set(state.x+sunDirection.x*65,45,state.z+sunDirection.z*65);sun.target.position.set(state.x,4,state.z);
  const bodies=new Map((state.worldBodies||[]).map(body=>[body.id,body]));
  navigation.forEach((g,i)=>syncBodyTransform(g,bodies.get(g.userData.bodyId)||buoys[i],state.elapsed||0,time,i));
  // The plane's local Z axis points up after flattening; match the yacht's negative yaw.
  // Start beyond the transom, never inside the heaving hull or swim platform.
  const heading=state.heading*Math.PI/180,behind=vessel.type==='catamaran'?29:28.5;
  for(const wake of wakes){const across=wake.userData.across;wake.position.set(state.x+Math.cos(heading)*across-Math.sin(heading)*behind,.01,state.z+Math.sin(heading)*across+Math.cos(heading)*behind);wake.rotation.z=-heading;wake.visible=state.speed>.4&&!state.capsized;wake.material.opacity=Math.min(.66,state.speed*.1)*(night?.18:1);}
 },dispose(){
  const ownedTextures=new Set([environmentMap.texture]);
  if(reflectionTexture)ownedTextures.add(reflectionTexture);
  if(environmentDisposed)return ownedTextures;
  environmentDisposed=true;cruiseShip.dispose();water.onBeforeRender=()=>{};
  environmentMap.dispose();
  if(reflectionTarget)reflectionTarget.dispose();else reflectionTexture?.dispose();
  reflectionTarget=null;
  return ownedTextures;
 }};
}
