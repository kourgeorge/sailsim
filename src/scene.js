import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createMaterials, batchStaticMeshes } from './rendering/materials.js';
import { createYacht } from './rendering/yacht.js';
import { createEnvironment } from './rendering/environment.js';

export function createScene(container){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b5c9d2');scene.fog=new THREE.FogExp2('#b7c7ce',.00031);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');const software=debug&&/swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
 renderer.setPixelRatio(software?.7:Math.min(devicePixelRatio,1.65));container.dataset.quality=software?'compatibility':'high';renderer.setSize(container.clientWidth,container.clientHeight);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
 renderer.shadowMap.enabled=!software;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 container.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','Detailed 3D sailing yacht with working cockpit instruments, reflective sea and wooded island harbor');
 const camera=new THREE.PerspectiveCamera(47,container.clientWidth/container.clientHeight,.08,10000);
 const materials=createMaterials(),environment=createEnvironment(scene,renderer,materials,{software}),yacht=createYacht(materials);scene.add(yacht.group);
 // Reuse yacht geometry for moored vessels, without duplicating GPU buffers.
 const moored=[],mooredTemplate=createYacht(materials,{detailed:false}).group;
 for(let i=0;i<5;i++){const boat=mooredTemplate.clone(true);boat.position.set(430+i*26,0,25);boat.rotation.y=Math.PI;boat.scale.setScalar(.74+(i%2)*.13);boat.traverse(o=>{o.castShadow=false;});scene.add(boat);moored.push(boat);}
 const marinaFleet=new THREE.Group();scene.add(marinaFleet);for(const boat of moored){boat.updateMatrix();for(const child of [...boat.children]){if(!child.isMesh)continue;child.applyMatrix4(boat.matrix);marinaFleet.add(child);}scene.remove(boat);}batchStaticMeshes(marinaFleet,mergeGeometries);
 let frameCount=0, frameAverage=16;
 let view='chase',orbit=.1,elevation=0,zoom=1,lastTime=0,dragging=false,lastX=0,lastY=0;
 const offset=new THREE.Vector3(),target=new THREE.Vector3(),desired=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 const views={
  chase:{fov:47},helm:{fov:66},deck:{fov:60},aerial:{fov:47}
 };
 function resize(){renderer.setSize(container.clientWidth,container.clientHeight);camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(container);
 const pointerDown=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};
 const pointerMove=e=>{if(!dragging)return;orbit+=(e.clientX-lastX)*.006;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-lastY)*.003,-.3,.65);lastX=e.clientX;lastY=e.clientY;};
 const pointerUp=()=>dragging=false;
 const wheel=e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.0008,.48,2.2);};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);renderer.domElement.addEventListener('wheel',wheel,{passive:false});
 function render(state,time){
  const elapsed=lastTime?time-lastTime:1/60;const dt=Math.min(.1,Math.max(.001,elapsed));lastTime=time;
  frameCount++;frameAverage=frameAverage*.95+elapsed*1000*.05;
  if(!software && frameCount===30 && frameAverage>45){renderer.setPixelRatio(Math.min(devicePixelRatio,.85));resize();}
  container.dataset.fps=(1000/frameAverage).toFixed(1);container.dataset.frames=frameCount;
  const roll=Math.sin(time*.72)*.008*(state.windSpeed/12),pitch=Math.sin(time*.95)*.005;
  yacht.group.position.set(state.x,Math.sin(time*.8)*.045,state.z);yacht.group.rotation.set(pitch,-state.heading*Math.PI/180,state.heel*Math.PI/180+roll);
  yacht.update(state,time);environment.update(state,time);
  moored.forEach((b,i)=>{b.position.y=Math.sin(time*.9+i)*.045;b.rotation.z=Math.sin(time*.7+i)*.009;});
  const heading=state.heading*Math.PI/180,framing=Math.max(1,.9/camera.aspect);
  if(view==='helm'){
   offset.set(0,3.12,5.6);offset.applyMatrix4(yacht.group.matrix.clone().identity().makeRotationFromEuler(yacht.group.rotation));
   desired.copy(offset).add(yacht.group.position);
   target.set(Math.sin(orbit)*14,1.7-elevation*12,-Math.cos(orbit)*18).applyAxisAngle(up,-heading).add(yacht.group.position);
  }else if(view==='deck'){
   offset.set(3.8*Math.cos(orbit)*zoom,3.2+elevation*5,3.4+Math.sin(orbit)*3.2).applyAxisAngle(up,-heading);desired.copy(offset).add(yacht.group.position);
   target.set(0,1.5,2.2).applyAxisAngle(up,-heading).add(yacht.group.position);
  }else if(view==='aerial'){
   offset.set(Math.sin(orbit)*55*zoom,(85+elevation*40)*zoom,Math.cos(orbit)*55*zoom).applyAxisAngle(up,-heading);desired.copy(offset).add(yacht.group.position);target.set(state.x,0,state.z);
  }else{
   const angle=orbit+.68;offset.set(Math.sin(angle)*30*zoom*framing,(11+elevation*20)*zoom*framing,Math.cos(angle)*30*zoom*framing).applyAxisAngle(up,-heading);desired.copy(offset).add(yacht.group.position);target.set(state.x,6.8,state.z);
  }
  const smooth=1-Math.exp(-dt*7);camera.position.lerp(desired,smooth);camera.lookAt(target);camera.fov=THREE.MathUtils.lerp(camera.fov,views[view].fov,smooth);camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  // Read-only diagnostics for browser quality/performance verification.
  container.dataset.drawCalls=renderer.info.render.calls;container.dataset.triangles=renderer.info.render.triangles;container.dataset.camera=view;
 }
 camera.position.set(20,13,127);
 return {render,setView(v){if(!views[v])return;view=v;orbit=0;elevation=0;zoom=1;},dispose(){observer.disconnect();environment.dispose();scene.traverse(o=>{o.geometry?.dispose();});renderer.dispose();renderer.domElement.remove();}};
}
