import * as THREE from 'three';
import { sceneryBuilder } from './scenery-geometry.js';
import { geographicPoint, terrainHeight } from '../world/real-terrain.js';

function islandAnimalGeometry(kind) {
  const b=sceneryBuilder(),pig=kind==='pig';
  b.oval(pig?'#d7b4a0':'#746d53',0,pig?.7:.55,0,pig?.4:.6,pig?.37:.5,pig?.85:.78,2);
  b.oval(pig?'#d7b4a0':'#777b5c',0,.48,pig?-.85:-.84,pig?.24:.14,pig?.25:.13,pig?.3:.24,1);
  if(pig){b.oval('#c28f82',0,.4,-1.12,.19,.12,.08,1);for(const side of [-1,1]){const ear=new THREE.ConeGeometry(.14,.3,4);ear.translate(side*.2,.85,-.8);b.add(ear,'#cda691');}}
  for(const x of [-1,1])for(const z of [-1,1])b.oval(pig?'#b28f7d':'#62694e',x*(pig?.29:.44),.2,z*.46,pig?.09:.15,.22,.15,0);
  for(const x of [-1,1])b.oval('#232e25',x*.13,.57,pig?-1:-.97,.025,.025,.025,0);
  return b.finish();
}

export function createDestinationNature(scene,location) {
  const land=location.islands[0],height=(x,z)=>terrainHeight(x,z,land),character=location.character;
  let animals=null;const poses=[];
  if(['pig','tortoise'].includes(character.animals)) {
    const p=geographicPoint(location,...(character.animals==='pig'?[24.184,-76.457]:[-4.365,55.827]));
    const count=character.animals==='pig'?7:5;
    for(let r=0;r<220&&poses.length<count;r+=16)for(let i=0;i<16&&poses.length<count;i++) {
      const a=i/16*Math.PI*2,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r,y=height(x,z);
      const safe=[[-3,0],[3,0],[0,-3],[0,3]].every(([dx,dz])=>Math.abs(height(x+dx,z+dz)-y)<.5);
      if(y>1&&y<18&&safe&&poses.every(q=>Math.hypot(q.x-x,q.z-z)>6))poses.push({x,y,z,angle:a});
    }
    animals=new THREE.InstancedMesh(islandAnimalGeometry(character.animals),new THREE.MeshLambertMaterial({vertexColors:true}),poses.length);
    animals.name=character.animals==='pig'?'Big Major Cay beach pigs':'La Digue giant tortoises';scene.add(animals);
  }
  const positions=[],uv=[],indices=[];
  for(const fall of character.falls||[]) {
    const p=geographicPoint(location,fall.lat,fall.lon);
    // Locate the actual cliff foot nearest the geographic waterfall reference.
    let foot=null,best=Infinity;
    for(let dx=-350;dx<=350;dx+=10)for(let dz=-350;dz<=350;dz+=10) {
      const x=p.x+dx,z=p.z+dz,y=height(x,z);
      if(y>1&&y<15&&dx*dx+dz*dz<best){foot={x,z,y};best=dx*dx+dz*dz;}
    }
    if(!foot)continue;
    const path=[foot];
    for(let i=0;i<35&&path.at(-1).y<fall.height;i++) {
      const last=path.at(-1);let next=last;
      for(let j=0;j<16;j++){const a=j/16*Math.PI*2,x=last.x+Math.cos(a)*12,z=last.z+Math.sin(a)*12,y=height(x,z);if(y>next.y)next={x,z,y};}
      if(next===last)break;path.push(next);
    }
    for(let f=0;f<fall.count;f++) {
      const offset=positions.length/3;
      path.forEach((p,i)=>{for(const side of [-1,1]){const x=p.x+(f-(fall.count-1)/2)*4+side*1.1;positions.push(x,Math.max(p.y,height(x,p.z))+1.3,p.z);uv.push((side+1)/2,p.y/20);}
        if(i)indices.push(offset+i*2-2,offset+i*2,offset+i*2-1,offset+i*2-1,offset+i*2,offset+i*2+1);});
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);
  const material=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float streak=.7+.3*sin(vUv.y*9.0+time*5.0);float edge=sin(vUv.x*3.14159);gl_FragColor=vec4(.87,.96,.98,edge*streak*.8);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
  // Preprocessor directives need a separate line in GLSL.
  material.fragmentShader=material.fragmentShader.replace(';#include',';\n#include');
  const falls=new THREE.Mesh(geometry,material);falls.name='Seven Sisters cliff streams';if(positions.length)scene.add(falls);else{geometry.dispose();material.dispose();}
  const dummy=new THREE.Object3D();
  return {update(time){
    poses.forEach((p,i)=>{const move=Math.sin(time*.025+i)*1.5,x=p.x+move,z=p.z+Math.cos(time*.025+i)*.6;dummy.position.set(x,height(x,z),z);dummy.rotation.set(0,p.angle,0);dummy.scale.setScalar(1);dummy.updateMatrix();animals.setMatrixAt(i,dummy.matrix);});
    if(animals)animals.instanceMatrix.needsUpdate=true;
    material.uniforms.time.value=time;
  }};
}
