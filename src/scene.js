import * as THREE from 'three';
import { createMaterials } from './rendering/materials.js';
import { createYacht } from './rendering/yacht.js';
import { createEnvironment } from './rendering/environment.js';
import { createTrainingCues } from './rendering/training-cues.js';
import { getLocation } from './locations.js';
import { getWorldBodyDefinitions, localToWorld } from './world/bodies.js';
import { syncBodyTransform, impactMotion } from './rendering/body-motion.js';
import { disposeSceneResources } from './rendering/dispose.js';

export function createScene(container,{locationId='haven'}={}){
 const location=getLocation(locationId);container.dataset.location=location.id;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b5c9d2');scene.fog=new THREE.FogExp2('#b7c7ce',.00031);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');const software=debug&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
 renderer.setPixelRatio(software?.7:Math.min(devicePixelRatio,1.65));container.dataset.quality=software?'compatibility':'high';renderer.setSize(container.clientWidth,container.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
 renderer.shadowMap.enabled=!software;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 container.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Detailed 3D sailing yacht with working cockpit instruments, reflective sea and wooded island harbor');
 const camera=new THREE.PerspectiveCamera(47,container.clientWidth/container.clientHeight,.08,10000);
 const materials=createMaterials(),environment=createEnvironment(scene,renderer,materials,{software,locationId:location.id}),yacht=createYacht(materials);scene.add(yacht.group);
 const trainingCues=createTrainingCues(scene);
 // Keep one transform root per physical hull; cloned fittings share GPU buffers.
 const vesselDefinitions=getWorldBodyDefinitions(location.id).filter(body=>body.visual.type==='yacht');
 const vesselTemplate=createYacht(materials,{detailed:false}).group;
 const vessels=vesselDefinitions.map(definition=>{
  const group=vesselTemplate.clone(true);group.userData.bodyId=definition.id;
  group.scale.setScalar(definition.visual.scale);group.traverse(object=>{object.castShadow=false;});
  syncBodyTransform(group,definition,0,0,definition.visual.index);scene.add(group);
  const tethers=(definition.visual.mooringLines||[]).map(line=>{const mesh=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:'#b7aa87'}));scene.add(mesh);return{mesh,...line};});
  return{group,definition,tethers};
 });
 const contactRings=Array.from({length:8},()=>{
  const ring=new THREE.Mesh(new THREE.RingGeometry(.72,1,32),new THREE.MeshBasicMaterial({color:'#dcf1e9',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);return ring;
 });
 let disposed=false,frameCount=0, frameAverage=16;
 let view='chase',orbit=.1,elevation=0,zoom=1,lastFrameTime=null,dragging=false,lastX=0,lastY=0;
 const offset=new THREE.Vector3(),target=new THREE.Vector3(),desired=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 const views={
  chase:{fov:47},helm:{fov:66},deck:{fov:60},instruments:{fov:42},aerial:{fov:47}
 };
 function resize(){const width=container.clientWidth,height=container.clientHeight;if(disposed||width<1||height<1)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(container);
 const pointerDown=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};
 const pointerMove=e=>{if(!dragging)return;orbit+=(e.clientX-lastX)*.006;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-lastY)*.003,-.3,.65);lastX=e.clientX;lastY=e.clientY;};
 const pointerUp=()=>dragging=false;
 const wheel=e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.0008,.48,2.2);};
 const resetCamera=()=>{orbit=0;elevation=0;zoom=1;};
 renderer.domElement.addEventListener('dblclick',resetCamera);renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);renderer.domElement.addEventListener('wheel',wheel,{passive:false});
 function render(state,time){
  // Study mode hides the simulator. Never let a zero-sized surface introduce
  // NaN framing into the camera position; that would survive becoming visible.
  if(disposed||container.clientWidth<1||container.clientHeight<1)return;
  // Wall time belongs only to camera response/performance diagnostics.
  // All environmental and vessel animation uses the caller's visual time.
  const now=performance.now(),elapsed=lastFrameTime===null?1/60:(now-lastFrameTime)/1000;
  const dt=Math.min(.1,Math.max(.001,elapsed));lastFrameTime=now;
  frameCount++;frameAverage=frameAverage*.95+elapsed*1000*.05;
  if(!software && frameCount===30 && frameAverage>45){renderer.setPixelRatio(Math.min(devicePixelRatio,.85));resize();}
  container.dataset.fps=(1000/frameAverage).toFixed(1);container.dataset.frames=frameCount;
  const roll=Math.sin(time*.72)*.008*(state.windSpeed/12),pitch=Math.sin(time*.95)*.005;
  const playerImpact=impactMotion({...state,mass:5600,lastImpact:state.collision},state.elapsed||0);
  yacht.group.position.set(state.x,Math.sin(time*.8)*.045,state.z);yacht.group.rotation.set(pitch+playerImpact.pitch,-state.heading*Math.PI/180,state.heel*Math.PI/180+roll+playerImpact.roll);
  yacht.update(state,time);environment.excludeHullWater(yacht.group);environment.update(state,time);
  const worldBodies=new Map((state.worldBodies||[]).map(body=>[body.id,body]));
  vessels.forEach(({group,definition,tethers},i)=>{
   const body=worldBodies.get(definition.id)||definition;syncBodyTransform(group,body,state.elapsed||0,time,i);
   for(const tether of tethers){
    const cleat=localToWorld(body,tether.local.x,tether.local.z),anchor=tether.fixed,positions=tether.mesh.geometry.attributes.position;
    positions.setXYZ(0,cleat.x,1.1*definition.visual.scale,cleat.z);positions.setXYZ(1,(cleat.x+anchor.x)/2,.42,(cleat.z+anchor.z)/2);positions.setXYZ(2,anchor.x,.99,anchor.z);
    positions.needsUpdate=true;tether.mesh.geometry.computeBoundingSphere();
   }
  });
  const impacts=(state.collisionEvents||[]).filter(event=>(state.elapsed||0)-event.time>=0&&(state.elapsed||0)-event.time<1.3).slice(-contactRings.length);
  contactRings.forEach((ring,i)=>{const event=impacts[i];ring.visible=Boolean(event);if(!event)return;const age=(state.elapsed||0)-event.time;ring.position.set(event.point.x,.03,event.point.z);ring.scale.setScalar(.25+age*2.6);ring.material.opacity=(1-age/1.3)*.55;});
  container.dataset.worldVessels=String(vessels.length);container.dataset.worldBodies=String(worldBodies.size);
  const heading=state.heading*Math.PI/180,framing=Math.max(1,.9/camera.aspect);
  if(view==='helm'){
   offset.set(0,3.12,5.6);offset.applyMatrix4(yacht.group.matrix.clone().identity().makeRotationFromEuler(yacht.group.rotation));
   desired.copy(offset).add(yacht.group.position);
   target.set(Math.sin(orbit)*14,1.7-elevation*12,-Math.cos(orbit)*18).applyAxisAngle(up,-heading).add(yacht.group.position);
  }else if(view==='instruments'){
   // Fit the complete 1.26 m screen housing plus guard/margins horizontally.
   // Preserve the established desktop eye line; portrait views pull back along
   // that same line. User wheel zoom remains available after the default fit.
   const panelWidth=1.50,halfVerticalFov=views.instruments.fov*Math.PI/360;
   const setback=Math.max(1.55,panelWidth/(2*Math.tan(halfVerticalFov)*camera.aspect)),fit=setback/1.55;
   offset.set(Math.sin(orbit)*.65,2.76+.32*fit+elevation*.8,3.87+setback);offset.applyMatrix4(yacht.group.matrix.clone().identity().makeRotationFromEuler(yacht.group.rotation));
   desired.copy(offset).add(yacht.group.position);
   target.set(0,2.76,3.87).applyMatrix4(yacht.group.matrix.clone().identity().makeRotationFromEuler(yacht.group.rotation)).add(yacht.group.position);
  }else if(view==='deck'){
   offset.set(3.8*Math.cos(orbit)*zoom,3.2+elevation*5,3.4+Math.sin(orbit)*3.2).applyAxisAngle(up,-heading);desired.copy(offset).add(yacht.group.position);
   target.set(0,1.5,2.2).applyAxisAngle(up,-heading).add(yacht.group.position);
  }else if(view==='aerial'){
   offset.set(Math.sin(orbit)*55*zoom,(85+elevation*40)*zoom,Math.cos(orbit)*55*zoom).applyAxisAngle(up,-heading);desired.copy(offset).add(yacht.group.position);target.set(state.x,0,state.z);
  }else{
   const angle=orbit+.68;offset.set(Math.sin(angle)*30*zoom*framing,(11+elevation*20)*zoom*framing,Math.cos(angle)*30*zoom*framing).applyAxisAngle(up,-heading);desired.copy(offset).add(yacht.group.position);target.set(state.x,6.8,state.z);
  }
  const smooth=1-Math.exp(-dt*7);camera.position.lerp(desired,smooth);camera.lookAt(target);const desiredFov=['helm','instruments'].includes(view)?THREE.MathUtils.clamp(views[view].fov*zoom,25,85):views[view].fov;camera.fov=THREE.MathUtils.lerp(camera.fov,desiredFov,smooth);camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  // Read-only diagnostics for browser quality/performance verification.
  container.dataset.drawCalls=renderer.info.render.calls;container.dataset.triangles=renderer.info.render.triangles;container.dataset.camera=view;container.dataset.fov=camera.fov.toFixed(1);
 }
 camera.position.set(location.start.x+20,13,location.start.z+27);
 return {
  locationId:location.id,render,
  getInstrumentCanvas:()=>yacht.instrumentCanvas,
  focusInstruments(){if(disposed)return;view='instruments';orbit=0;elevation=0;zoom=1;},
  setTrainingCues(cues){if(disposed)return;trainingCues.set(cues);container.dataset.trainingCues=String(Boolean(cues));},
  setView(v){if(disposed||!views[v])return;view=v;orbit=0;elevation=0;zoom=1;},
  dispose(){
   if(disposed)return;disposed=true;observer.disconnect();
   const canvas=renderer.domElement;
   for(const [event,handler] of [['dblclick',resetCamera],['pointerdown',pointerDown],['pointermove',pointerMove],['pointerup',pointerUp],['pointercancel',pointerUp],['wheel',wheel]])canvas.removeEventListener(event,handler);
   trainingCues.dispose();
   const excludedTextures=environment.dispose();
   disposeSceneResources(scene,{extraMaterials:Object.values(materials),excludedTextures});
   renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }
 };
}
