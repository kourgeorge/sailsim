import * as THREE from 'three';
import {anchorSnapshot} from '../anchor.js';
import {translate as t} from '../i18n/runtime.js';
import './anchor-closeup.css';

const phases={pending:'Awaiting deployment',suspended:'Anchor suspended',slack:'Rode slack',taut:'Rode taut',dragging:'Anchor dragging'};

// Render the real anchor and live rode buffers in a small cutaway. The main
// camera and water stay untouched. Cutaway lighting keeps the metal readable.
export function createAnchorCloseup(container,renderer,yacht,environment,{onResize=()=>{}}={}){
 const rig=yacht.getObjectByName('anchor-rig');
 const deployed=rig.getObjectByName('deployed-anchor'),stowed=rig.getObjectByName('stowed-anchor'),sourceRode=rig.getObjectByName('deployed-anchor-rode');
 const scene=new THREE.Scene();scene.background=new THREE.Color('#235461');scene.environment=environment;
 scene.fog=new THREE.Fog('#235461',5,15);
 scene.add(new THREE.HemisphereLight('#e4f7ff','#685942',2));
 const light=new THREE.DirectionalLight('#fff2d1',3);light.position.set(-2,5,3);scene.add(light);
 const anchor=deployed.clone(true),rode=sourceRode.clone();anchor.position.set(0,0,0);scene.add(anchor,rode);
 const anchorMaterial=new THREE.MeshStandardMaterial({color:'#56717b',metalness:.65,roughness:.45,envMapIntensity:.35});
 anchor.traverse(object=>{if(object.isMesh)object.material=anchorMaterial;});
 const rodeMaterial=sourceRode.material.clone();rodeMaterial.color.set('#6b858a');rodeMaterial.envMapIntensity=.4;rode.material=rodeMaterial;
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(18,18,32,32),new THREE.MeshStandardMaterial({color:'#ae9e7c',roughness:1}));
 floor.rotation.x=-Math.PI/2;scene.add(floor);
 // Periodic ripples let the floor follow the view while staying world-fixed.
 const positions=floor.geometry.attributes.position;
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i);positions.setZ(i,Math.sin((x*2+y)*Math.PI*2)*.014+Math.cos(y*Math.PI*4)*.008);}
 floor.geometry.computeVertexNormals();
 const grid=new THREE.GridHelper(18,36,'#8f8266','#978967');grid.material.transparent=true;grid.material.opacity=.22;scene.add(grid);
 const camera=new THREE.PerspectiveCamera(40,1,.01,300),position=new THREE.Vector3(),rotation=new THREE.Quaternion();
 const bounds=new THREE.Box3(),sphere=new THREE.Sphere(),direction=new THREE.Vector3(1.1,1.25,1.4).normalize();
 const viewport=new THREE.Vector4(),scissor=new THREE.Vector4();
 const root=document.createElement('figure');root.className='anchor-closeup';root.hidden=true;root.dataset.noTranslate='true';
 const caption=document.createElement('figcaption'),heading=document.createElement('strong'),status=document.createElement('span');
 heading.textContent=t('Anchor close-up');caption.append(heading,status);
 const window=document.createElement('div');window.className='anchor-closeup-window';window.setAttribute('role','img');window.setAttribute('aria-label',t('Anchor close-up'));
 const footer=document.createElement('div');footer.className='anchor-closeup-footer';
 const label=document.createElement('span'),value=document.createElement('bdi');label.textContent=t('Rode paid out');value.dir='ltr';footer.append(label,value);
 root.append(caption,window,footer);container.append(root);
 const observer=new ResizeObserver(onResize);observer.observe(window);
 return {
  render(state){
   const snapshot=anchorSnapshot(state);root.hidden=!snapshot.deployed;
   if(root.hidden)return false;
   const active=Boolean(snapshot.anchorPoint),source=active?deployed:stowed;
   source.getWorldPosition(position);source.getWorldQuaternion(rotation);
   anchor.quaternion.copy(rotation);anchor.visible=true;
   rode.visible=active&&sourceRode.visible;rode.position.copy(position).negate();
   const floorHeight=-snapshot.anchorDepth-position.y;
   const floorX=Math.round(position.x/6)*6-position.x,floorZ=Math.round(position.z/6)*6-position.z;
   floor.position.set(floorX,floorHeight-.065,floorZ);grid.position.set(floorX,floorHeight-.038,floorZ);
   const phase=t(snapshot.status==='pending'?'Awaiting deployment':snapshot.operation==='blocked'?'Retrieval blocked · unload rode':snapshot.operation==='lowering'?'Lowering anchor':snapshot.operation==='retrieving'?'Retrieving anchor':phases[snapshot.status]||'Windlass stopped');
   if(status.textContent!==phase)status.textContent=phase;
   const paid=`${snapshot.rode.toFixed(1)} m`;if(value.textContent!==paid)value.textContent=paid;
   bounds.setFromObject(anchor);bounds.getBoundingSphere(sphere);
   const area=window.getBoundingClientRect(),canvas=renderer.domElement.getBoundingClientRect();
   if(area.width<1||area.height<1)return false;
   camera.aspect=area.width/area.height;
   const halfFov=Math.min(camera.fov*Math.PI/360,Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect));
   camera.position.copy(sphere.center).addScaledVector(direction,sphere.radius/Math.sin(halfFov)*1.1);
   camera.lookAt(sphere.center);camera.updateProjectionMatrix();
   root.dataset.anchorStatus=snapshot.status;root.dataset.anchorOperation=snapshot.operation;root.dataset.paidRode=String(snapshot.rode);
   root.dataset.anchorDepth=String(Math.max(0,-position.y));
   renderer.getViewport(viewport);renderer.getScissor(scissor);
   const scissorTest=renderer.getScissorTest(),autoClear=renderer.autoClear;
   try{
    renderer.setViewport(area.left-canvas.left,canvas.bottom-area.bottom,area.width,area.height);
    renderer.setScissor(area.left-canvas.left,canvas.bottom-area.bottom,area.width,area.height);
    renderer.setScissorTest(true);renderer.autoClear=true;renderer.render(scene,camera);
   }finally{
    renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.autoClear=autoClear;
   }
   return true;
  },
  dispose(){
   observer.disconnect();
   // Anchor and rode geometry remain owned by the main yacht.
   anchorMaterial.dispose();rodeMaterial.dispose();floor.geometry.dispose();floor.material.dispose();grid.geometry.dispose();grid.material.dispose();scene.clear();root.remove();
  },
 };
}
