import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function seededRandom(seed=7321) { return () => { seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }; }
export function canvasTexture(width,height,draw,{repeat=1,color=true}={}) {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  draw(canvas.getContext('2d'),width,height);
  const texture=new THREE.CanvasTexture(canvas);
  if(color)texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(repeat,repeat);texture.anisotropy=8;
  return texture;
}
export function createMaterials(){
  const random=seededRandom();
  const teak=canvasTexture(512,1024,(c,w,h)=>{
    c.fillStyle='#a78052';c.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=64){c.fillStyle=`hsl(32,${28+random()*8}%,${44+random()*8}%)`;c.fillRect(x,0,64,h);
      c.fillStyle='#463d32';c.fillRect(x,0,3,h);
      for(let i=0;i<180;i++){c.strokeStyle=`rgba(${random()>.5?'240,200,145':'50,35,20'},${random()*.17})`;const px=x+random()*62;c.beginPath();c.moveTo(px,0);c.bezierCurveTo(px+3,300,px-3,700,px,1024);c.stroke();}
      const y=(x/64%3)*280+90;c.fillStyle='#463d32';c.fillRect(x,y,64,2);
      for(const cy of [y+10,y-10]){c.fillStyle='#8b643e';c.beginPath();c.arc(x+32,cy,3,0,Math.PI*2);c.fill();}
    }
  });
  const cloth=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#eeeee5';c.fillRect(0,0,w,h);for(let i=0;i<6000;i++){const a=random()*.09;c.fillStyle=`rgba(80,75,60,${a})`;c.fillRect(random()*w,random()*h,1,3);}for(let y=0;y<h;y+=3){c.fillStyle='#ffffff18';c.fillRect(0,y,w,1);}});
  const grip=canvasTexture(128,128,(c,w,h)=>{c.fillStyle='#989c9a';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=6)for(let x=0;x<w;x+=6){c.fillStyle='#757c79';c.fillRect(x+(y%12?3:0),y,2,2);}}, {repeat:5});
  const paint=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.45,...extra});
  return {
    gelcoat:new THREE.MeshPhysicalMaterial({color:'#f4f3e9',roughness:.28,clearcoat:1,clearcoatRoughness:.2}),
    teak:paint('#ffffff',{map:teak,bumpMap:teak,bumpScale:.025,roughness:.68}),
    steel:paint('#e3ebeb',{metalness:.94,roughness:.21}),
    aluminum:paint('#bcc6c9',{metalness:.83,roughness:.32}),
    rubber:paint('#141f26',{roughness:.85}), navy:paint('#163c4b'),
    cushion:paint('#314a57',{map:cloth,roughness:.95}),
    glass:new THREE.MeshPhysicalMaterial({color:'#142d38',metalness:.35,roughness:.13,clearcoat:1}),
    grip:paint('#f0eee1',{bumpMap:grip,bumpScale:.018,roughness:.87}),
    red:paint('#b95540'),green:paint('#459789'),blue:paint('#416f99'),ivory:paint('#e7dfc6'),
    cloth:paint('#ffffff',{map:cloth,side:THREE.DoubleSide,roughness:.85}),
    paint,
  };
}
export function mesh(parent,geo,material,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function box(parent,material,x,y,z,w,h,d,radius=.025){return mesh(parent,new RoundedBoxGeometry(w,h,d,2,Math.min(radius,w/3,h/3,d/3)),material,x,y,z);}
export function cylinder(parent,material,x,y,z,r1,r2,height,segments=20){return mesh(parent,new THREE.CylinderGeometry(r1,r2,height,segments),material,x,y,z);}
export function bar(parent,material,from,to,radius=.018,segments=8){
  const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a);
  const m=mesh(parent,new THREE.CylinderGeometry(radius,radius,delta.length(),segments),material,...a.clone().add(b).multiplyScalar(.5).toArray());
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
}
export function rope(parent,material,points,radius=.018,segments=64){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(parent,new THREE.TubeGeometry(curve,segments,radius,6,false),material);}
export function labelTexture(text,sub='',color='#123b48') {return canvasTexture(1024,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.textAlign='center';c.fillStyle=color;c.font='500 100px Georgia';c.fillText(text,w/2,132);c.font='22px sans-serif';c.fillText(sub,w/2,191);});}

// Collapse fixed fittings into one draw call per material; moving parts stay separate.
export function batchStaticMeshes(parent,mergeGeometries,exclude=[]){
 const skip=new Set(exclude),groups=new Map();
 for(const child of [...parent.children]){if(!child.isMesh||skip.has(child)||Array.isArray(child.material)||child.material.transparent)continue;const list=groups.get(child.material)||[];list.push(child);groups.set(child.material,list);}
 for(const [material,children] of groups){if(children.length<2)continue;const geometries=children.map(child=>{child.updateMatrix();const g=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();g.applyMatrix4(child.matrix);for(const name of Object.keys(g.attributes))if(!['position','normal','uv'].includes(name))g.deleteAttribute(name);if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));return g;});const merged=mergeGeometries(geometries,false);if(merged){const m=new THREE.Mesh(merged,material);m.castShadow=children.some(c=>c.castShadow);m.receiveShadow=true;parent.add(m);children.forEach(c=>parent.remove(c));}geometries.forEach(g=>g.dispose());}
}
