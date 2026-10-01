import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BOW_FAIRLEAD } from '../anchor.js';
import { bar,box,cylinder,mesh,batchStaticMeshes } from './materials.js';

const SEGMENTS=96,RADIAL_SEGMENTS=6;
const point=(x,y,z)=>({x,y,z});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const lerp=(a,b,t)=>a+(b-a)*t;
const pathLength=points=>points.slice(1).reduce((sum,p,index)=>sum+distance(points[index],p),0);

/** A geometric cable illustration, not a force or catenary calculation.
 * Slack descends to the seabed, with surplus rode laid there in loose turns.
 * Endpoints always remain the physical anchor and the visible bow fitting.
 */
export function anchorRodePath(snapshot,fairlead,segments=SEGMENTS) {
 if(!snapshot.anchorPoint||['stowed','pending'].includes(snapshot.status))return[];
 const suspended=snapshot.status==='suspended';
 const end=suspended?point(fairlead.x,fairlead.y+snapshot.anchorPoint.y-snapshot.fairlead.y,fairlead.z):{...snapshot.anchorPoint};
 const straight=distance(fairlead,end),paid=Math.max(0,snapshot.rode);
 if(suspended||snapshot.status==='taut'||snapshot.status==='dragging'||paid<=straight+.05){
  return Array.from({length:segments+1},(_,i)=>{const t=i/segments;return point(lerp(fairlead.x,end.x,t),lerp(fairlead.y,end.y,t),lerp(fairlead.z,end.z,t));});
 }
 const descentSegments=Math.floor(segments/2),remainingSegments=segments-descentSegments;
 const slack=paid-straight,sag=Math.min(Math.max(0,fairlead.y-end.y)*.45,slack*.35);
 let descent=[];
 // Limit sag to available cable. The clamped portion rests on the seabed.
 const makeDescent=amount=>Array.from({length:descentSegments+1},(_,i)=>{
  const t=i/descentSegments;
  return point(lerp(fairlead.x,end.x,t),Math.max(end.y,lerp(fairlead.y,end.y,t)-Math.sin(Math.PI*t)*amount),lerp(fairlead.z,end.z,t));
 });
 let low=0,high=sag;
 for(let i=0;i<12;i++){const mid=(low+high)/2;if(pathLength(makeDescent(mid))>paid)high=mid;else low=mid;}
 descent=makeDescent(low);
 const surplus=Math.max(0,paid-pathLength(descent));
 const turns=Math.min(6,Math.max(1,Math.ceil(surplus/18)));
 const circle=Array.from({length:remainingSegments+1},(_,i)=>{const angle=i/remainingSegments*Math.PI*2*turns;return point(Math.sin(angle),0,1-Math.cos(angle));});
 const radius=surplus/pathLength(circle);
 for(let i=1;i<=remainingSegments;i++)descent.push(point(end.x+circle[i].x*radius,end.y,end.z+circle[i].z*radius));
 descent[descent.length-1]={...end};
 return descent;
}

function anchorBody(material) {
 const group=new THREE.Group();
 // Local origin is the shackle. Flat flukes lie along the seabed when deployed;
 // turning the body through 90 degrees lets it hang from the shackle.
 const eye=mesh(group,new THREE.TorusGeometry(.055,.014,6,12),material,0,0,0);eye.rotation.x=Math.PI/2;
 bar(group,material,[0,0,.045],[0,0,.54],.034);
 bar(group,material,[-.31,0,.49],[.31,0,.49],.029);
 for(const side of [-1,1]){
  const fluke=box(group,material,side*.19,-.015,.58,.24,.055,.34,.025);fluke.rotation.y=side*-.24;
 }
 batchStaticMeshes(group,mergeGeometries);return group;
}

function ropeGeometry() {
 const geometry=new THREE.BufferGeometry(),count=(SEGMENTS+1)*RADIAL_SEGMENTS,indices=[];
 geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage));
 geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage));
 for(let i=0;i<SEGMENTS;i++)for(let j=0;j<RADIAL_SEGMENTS;j++){
  const a=i*RADIAL_SEGMENTS+j,b=i*RADIAL_SEGMENTS+(j+1)%RADIAL_SEGMENTS,c=a+RADIAL_SEGMENTS,d=b+RADIAL_SEGMENTS;
  indices.push(a,b,c,b,d,c);
 }
 geometry.setIndex(indices);return geometry;
}

export function createAnchorRig(materials,{detailed=true}={}) {
 const group=new THREE.Group();group.name='anchor-rig';
 const fittings=new THREE.Group();group.add(fittings);
 box(fittings,materials.steel,0,1.19,-6.32,.18,.08,.85);
 cylinder(fittings,materials.steel,0,1.24,-5,.16,.16,.19);
 for(let i=0;i<22;i++){
  const ring=mesh(fittings,new THREE.TorusGeometry(.035,.008,5,10),materials.steel,0,1.2,-5.1-i*.07);
  ring.rotation.set(Math.PI/2,i%2*Math.PI/2,0);
 }
 batchStaticMeshes(fittings,mergeGeometries);
 const stowed=anchorBody(materials.steel);stowed.name='stowed-anchor';stowed.position.set(BOW_FAIRLEAD.x,BOW_FAIRLEAD.y,BOW_FAIRLEAD.z);stowed.rotation.x=Math.PI*.75;group.add(stowed);
 if(!detailed)return{group,update(){}};
 const deployedWorld=new THREE.Group();deployedWorld.name='deployed-anchor-world';deployedWorld.matrixAutoUpdate=false;deployedWorld.visible=false;group.add(deployedWorld);
 const deployed=stowed.clone(true);deployed.name='deployed-anchor';deployed.position.set(0,0,0);deployed.rotation.set(0,0,0);deployedWorld.add(deployed);
 const geometry=ropeGeometry(),ropeMaterial=new THREE.MeshStandardMaterial({color:'#b5bbb8',metalness:.55,roughness:.5});
 const rode=new THREE.Mesh(geometry,ropeMaterial);rode.name='deployed-anchor-rode';rode.frustumCulled=false;deployedWorld.add(rode);
 const localBow=new THREE.Vector3(BOW_FAIRLEAD.x,BOW_FAIRLEAD.y,BOW_FAIRLEAD.z),bow=new THREE.Vector3();
 const tangent=new THREE.Vector3(),axis=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3();
 const first=new THREE.Vector3(),last=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
 let previousShape='';
 return{group,update(snapshot,boat){
  const active=Boolean(snapshot.anchorPoint)&&!['stowed','pending'].includes(snapshot.status);
  stowed.visible=!active;deployedWorld.visible=active;group.userData.anchorStatus=snapshot.status;
  if(!active){previousShape='';group.userData.fairlead=null;group.userData.anchorPoint=null;return;}
  boat.updateWorldMatrix(true,false);bow.copy(localBow).applyMatrix4(boat.matrixWorld);
  // Cancel the yacht transform so the bottom anchor stays world-fixed while
  // the top of its cable follows the boat's exact visual pitch, heel and bob.
  deployedWorld.matrix.copy(boat.matrixWorld).invert();deployedWorld.matrixWorldNeedsUpdate=true;
  const shapeKey=[snapshot.status,snapshot.rode,snapshot.anchorPoint.x,snapshot.anchorPoint.y,snapshot.anchorPoint.z,bow.x,bow.y,bow.z].join('|');
  if(shapeKey===previousShape)return;previousShape=shapeKey;
  const points=anchorRodePath(snapshot,bow),end=points.at(-1);
  deployed.position.set(end.x,end.y,end.z);
  if(snapshot.status==='suspended')deployed.rotation.set(Math.PI/2,0,0);
  else deployed.rotation.set(0,Math.atan2(end.x-bow.x,end.z-bow.z),0);
  const positions=geometry.attributes.position,normals=geometry.attributes.normal;
  for(let i=0;i<points.length;i++){
   const p=points[i],before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
   tangent.set(after.x-before.x,after.y-before.y,after.z-before.z);
   if(tangent.lengthSq()<1e-12)tangent.copy(up);else tangent.normalize();
   axis.set(Math.abs(tangent.y)>.95?1:0,Math.abs(tangent.y)>.95?0:1,0);
   normal.crossVectors(tangent,axis).normalize();binormal.crossVectors(tangent,normal).normalize();
   for(let j=0;j<RADIAL_SEGMENTS;j++){
    const angle=j/RADIAL_SEGMENTS*Math.PI*2,nx=normal.x*Math.cos(angle)+binormal.x*Math.sin(angle),ny=normal.y*Math.cos(angle)+binormal.y*Math.sin(angle),nz=normal.z*Math.cos(angle)+binormal.z*Math.sin(angle),index=i*RADIAL_SEGMENTS+j;
    positions.setXYZ(index,p.x+nx*.017,p.y+ny*.017,p.z+nz*.017);normals.setXYZ(index,nx,ny,nz);
   }
  }
  positions.needsUpdate=true;normals.needsUpdate=true;
  first.set(points[0].x,points[0].y,points[0].z);last.set(end.x,end.y,end.z);
  group.userData.fairlead=first.toArray();group.userData.anchorPoint=last.toArray();
 }};
}
