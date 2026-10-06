import * as THREE from 'three';
import { sceneryBuilder } from './scenery-geometry.js';
import { seededRandom } from './materials.js';
import { geographicPoint, terrainHeight, polygonHeight } from '../world/real-terrain.js';
import { getCoastalFeatures } from '../world/coastal-features.js';
import { destinationBungalows } from '../world/destination-features.js';

function roof(builder, x,y,z,w,d,h,color,rotation=0) {
  const geometry=new THREE.ConeGeometry(1,h,4,1);
  geometry.rotateY(Math.PI/4);geometry.scale(w/Math.SQRT2,1,d/Math.SQRT2);
  geometry.rotateY(rotation);geometry.translate(x,y+h/2,z);builder.add(geometry,color);
}
function branch(builder,color,a,b,radius){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  const geometry=new THREE.CylinderGeometry(radius*.65,radius,delta.length(),5);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
  geometry.translate(...start.add(end).multiplyScalar(.5).toArray());builder.add(geometry,color);
}

export function destinationTreeGeometry(kind) {
  const b=sceneryBuilder();
  if(kind==='palms') {
    branch(b,'#a69a70',[0,0,0],[.7,9,0],.22);
    for(let i=0;i<9;i++) {
      const a=i/9*Math.PI*2;
      const shape=new THREE.BufferGeometry();
      const points=[[.7,9.2,0],[.7+Math.cos(a-.18)*2,9.6,Math.sin(a-.18)*2],[.7+Math.cos(a)*5,8,Math.sin(a)*5],[.7+Math.cos(a+.18)*2,9.6,Math.sin(a+.18)*2]];
      shape.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));shape.setIndex([0,1,2,0,2,3,2,1,0,3,2,0]);shape.computeVertexNormals();b.add(shape,i%2?'#527b31':'#749845');
    }
    for(let i=0;i<3;i++)b.oval('#80724e',.7+(i-1)*.2,8.9,.1,.18,.22,.18,0);
  } else if(kind==='spruce') {
    branch(b,'#685b42',[0,0,0],[0,10,0],.22);
    for(const [y,r,h] of [[4,2.5,6],[6.5,1.9,5],[8.5,1.2,4]]){const g=new THREE.ConeGeometry(r,h,7);g.translate(0,y,0);b.add(g,'#3f6548');}
  } else {
    const short=kind.includes('scrub'),tall=kind==='eucalyptus';
    const height=short?1.5:tall?10:6;
    branch(b,tall?'#cabfa4':'#716448',[0,0,0],[0,height,0],short?.12:.28);
    for(const [x,y,z,s] of [[0,1,0,1],[-1,.8,.4,.8],[1.3,.85,-.5,.7]])
      b.oval(short?'#989360':tall?'#77917b':kind==='pine'?'#526b42':'#477646',x,height*y,z,(short?1.7:3)*s,(short?1:1.8)*s,(short?1.6:2.8)*s,0);
  }
  return b.finish();
}

export function createDestinationTrees(scene,location,quality={}) {
  const random=seededRandom(943),character=location.character,land=location.islands[0];
  const species=character.vegetation,points=new Map([[species,[]],['broadleaf',[]]]);
  for(let i=0;i<15000;i++) {
    const x=(random()-.5)*land.raster.width,z=(random()-.5)*land.raster.length,y=terrainHeight(x,z,land);
    const slope=Math.hypot(terrainHeight(x+3,z,land)-y,terrainHeight(x,z+3,land)-y)/3;
    if(y<3||slope>1.1||y>(species==='spruce'?850:1200))continue;
    if(character.architecture==='cycladic' && (random()>.2||y>180))continue;
    const kind=species==='palms'&&y>30?'broadleaf':species;
    const list=points.get(kind),limit=['compatibility','minimum','low'].includes(quality.name)?1000:2400;if(list.length>=limit)continue;
    list.push({x,y,z,scale:.65+random()*.75,rotation:random()*6.28});
  }
  const material=new THREE.MeshLambertMaterial({vertexColors:true}),dummy=new THREE.Object3D();
  for(const cay of location.islands.filter(i=>i.polygon)) {
    // The reference cay has light central foliage and a few palms, surrounded
    // by an uninterrupted white beach, with no buildings or artificial moorings.
    const shrubs=[];
    for(let i=0;i<35;i++){const x=cay.x+(random()-.5)*cay.rx*.8,z=cay.z+(random()-.5)*cay.rz*.8,y=polygonHeight(x,z,cay);if(y>1)shrubs.push({x,y,z,scale:.7+random()*.7,rotation:random()*6.28});}
    points.set('scrub',[...(points.get('scrub')||[]),...shrubs]);
    points.get('palms')?.push({x:cay.x,y:polygonHeight(cay.x,cay.z,cay),z:cay.z,scale:.65,rotation:1});
  }
  for(const [kind,sites] of points) {
    if(!sites.length)continue;
    const mesh=new THREE.InstancedMesh(destinationTreeGeometry(kind),material,sites.length);mesh.name=`${kind} vegetation`;
    sites.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.rotation,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});scene.add(mesh);
  }
}

export function createDestinationScenery(scene,location) {
  const b=sceneryBuilder(),random=seededRandom(385),character=location.character,style=character.architecture,land=location.islands[0];
  const features=getCoastalFeatures(location.id),roads=[];
  const palettes={caribbean:['#e8c798','#a2c6bb','#dfae91','#ece6d3'],bahamian:['#f0c0c6','#90d1cb','#e5d88f','#e6ece5'],creole:['#e0d3b2','#f0e6d2','#b5c9b1','#d4b693'],nordic:['#a84235','#d8bd78','#e5e4dc','#945347'],adriatic:['#dfd3b9','#ccbea6','#d9d2bc','#ded6c8'],cycladic:['#f5f1e3','#e9e5dc','#f6ebd6','#ede5d4'],polynesian:['#b79b6b','#d8c5a0','#a9b694','#d5b788'],queensland:['#e7e9db','#ddd6bf','#bfd2cd','#e2d6cb'],weatherboard:['#e9e8da','#dddcc9','#c3d0c1','#e2d4b6']};
  for(const f of features) {
    const {x,y,z,width:w,length:d,height:h}=f;
    b.box('#a39b86',x,y-f.foundation/2,z,w+.5,f.foundation,d+.5);
    b.box(palettes[style][f.variant],x,y+h/2,z,w,h,d);
    if(style==='cycladic') {
      b.box('#fcf6e8',x,y+h+.2,z,w+.6,.4,d+.6);
      if(f.variant===0){const dome=new THREE.SphereGeometry(Math.min(w,d)*.3,10,6,0,Math.PI*2,0,Math.PI/2);dome.translate(x,y+h,z);b.add(dome,'#3e83ae');}
    } else roof(b,x,y+h,z,w+.8,d+.8,style==='nordic'?4:style==='polynesian'?3:2,style==='adriatic'?'#ae6c4b':style==='nordic'?'#4c575c':style==='polynesian'?'#9a8350':style==='weatherboard'?'#60776b':'#aaa89c');
    for(const side of [-1,1]) {
      b.box(style==='cycladic'?'#3e7795':'#4f7078',x+side*w*.27,y+h*.58,z+d/2+.04,w*.16,h*.28,.08);
      b.box('#436774',x+side*w/2,y+h*.55,z,.08,h*.25,d*.22);
    }
    if(f.type==='chapel' && ['nordic','adriatic'].includes(style)) {
      b.box('#e8e1c6',x,y+h,z,3,h*1.6,3);roof(b,x,y+h*1.8,z,3.5,3.5,4,style==='nordic'?'#52636b':'#ad7154');
    }
  }
  // Small road segments follow sampled dry land between town blocks. Remote
  // cays receive no invented roads. Vehicles use these same checked segments.
  for(const district of character.settlements) {
    const center=geographicPoint(location,district.lat,district.lon);
    for(let attempt=0;attempt<60;attempt++) {
      const x=center.x+(random()-.5)*district.radius*1.5,z=center.z+(random()-.5)*district.radius*1.5;
      const angle=random()*6.28,length=45+random()*65,points=[];
      for(let i=0;i<=12;i++) {
        const px=x+Math.cos(angle)*length*i/12,pz=z+Math.sin(angle)*length*i/12,y=terrainHeight(px,pz,land);
        if(y<2 || (points.length&&Math.abs(y-points.at(-1).y)>length/12*.4) || features.some(f=>Math.hypot(f.x-px,f.z-pz)<Math.max(f.width,f.length)*.65))break;
        points.push({x:px,z:pz,y:y+.15});
      }
      if(points.length<8)continue;
      roads.push(points);
      for(let i=1;i<points.length;i++) {
        const a=points[i-1],c=points[i],g=new THREE.BufferGeometry(),width=style==='creole'?1.5:2.5,nx=-Math.sin(angle)*width,nz=Math.cos(angle)*width;
        g.setAttribute('position',new THREE.Float32BufferAttribute([a.x+nx,a.y,a.z+nz,a.x-nx,a.y,a.z-nz,c.x+nx,c.y,c.z+nz,c.x-nx,c.y,c.z-nz],3));g.setIndex([0,2,1,1,2,3]);g.computeVertexNormals();b.add(g,style==='creole'?'#bcb392':'#727771');
      }
    }
  }
  for(const hut of destinationBungalows(location)) {
    const {x,z}=hut;
    b.box('#bda981',x,1.6,z,12,.5,10);b.box('#b19a6c',x,3.5,z,9,3.4,7);
    roof(b,x,5.2,z,10.5,8.5,3.5,'#998250');
    for(const dx of [-4.5,4.5])for(const dz of [-3.5,3.5])b.box('#807a64',x+dx,-1,z+dz,.35,5,.35);
    b.box('#6f949c',x,3.5,z+3.55,4,2,.08);
  }
  for(const site of character.boulders||[]) {
    const c=geographicPoint(location,site.lat,site.lon);
    for(let i=0;i<70;i++) {
      const x=c.x+(random()-.5)*site.radius*2,z=c.z+(random()-.5)*site.radius*2,y=terrainHeight(x,z,land);
      if(y<-.5||y>25)continue;
      const scale=3+random()*9;b.oval('#bcb4a3',x,Math.max(0,y)+scale*.35,z,scale,scale*.7,scale*.65,2);
    }
  }
  if(character.monument) {
    const c=geographicPoint(location,character.monument.lat,character.monument.lon),y=terrainHeight(c.x,c.z,land);
    b.box('#b6ad90',c.x,y+6,c.z,50,12,34);
    for(const x of [-23,23])for(const z of [-15,15]){const g=new THREE.CylinderGeometry(6,7,18,12);g.translate(c.x+x,y+9,c.z+z);b.add(g,'#b6ad90');}
  }
  const buildings=new THREE.Mesh(b.finish(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}));buildings.name=`${location.title} waterfront and landmarks`;buildings.receiveShadow=true;scene.add(buildings);
  const carBuilder=sceneryBuilder();carBuilder.box('#deddd2',0,.65,0,1.65,.8,3.6);carBuilder.box('#587882',0,1.1,-.15,1.4,.7,1.8);
  for(const x of [-.83,.83])for(const z of [-1.1,1.1])carBuilder.oval('#393e3e',x,.35,z,.17,.34,.34,0);
  const carCount=Math.min(style==='creole'?2:12,roads.length),cars=new THREE.InstancedMesh(carBuilder.finish(),new THREE.MeshLambertMaterial({vertexColors:true}),carCount);cars.name='Local road traffic';scene.add(cars);
  const dummy=new THREE.Object3D();
  return {roads,buildings,cars,update(time){
    for(let i=0;i<carCount;i++) {
      const route=roads[i],progress=((time*(style==='creole'?.06:.12)+i*.37)%(route.length-1)),j=Math.floor(progress),f=progress-j,a=route[j],c=route[j+1];
      dummy.position.set(a.x+(c.x-a.x)*f,a.y+(c.y-a.y)*f,a.z+(c.z-a.z)*f);dummy.rotation.set(0,Math.atan2(c.x-a.x,c.z-a.z),0);dummy.scale.setScalar(1);dummy.updateMatrix();cars.setMatrixAt(i,dummy.matrix);
    }
    cars.instanceMatrix.needsUpdate=true;
  }};
}
