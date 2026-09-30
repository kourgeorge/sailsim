import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { islands,buoys } from '../physics.js';
import { islandHeight,shoreScale } from './geography.js';
import { mesh,box,cylinder,bar,rope,canvasTexture,seededRandom,batchStaticMeshes } from './materials.js';

function normalTexture(){
 const size=256,data=new Uint8Array(size*size*4),random=seededRandom(997),waves=[];
 for(let i=0;i<20;i++)waves.push({x:Math.round((random()-.5)*35)||1,y:Math.round((random()-.5)*35)||1,a:.5/(1+i*.20),p:random()*6.28});
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){let dx=0,dy=0;for(const w of waves){const d=Math.cos((x*w.x+y*w.y)/size*Math.PI*2+w.p)*w.a;dx+=d*w.x*.07;dy+=d*w.y*.07;}const n=new THREE.Vector3(-dx,-dy,2).normalize(),i=(y*size+x)*4;data[i]=(n.x*.5+.5)*255;data[i+1]=(n.y*.5+.5)*255;data[i+2]=(n.z*.5+.5)*255;data[i+3]=255;}
 const texture=new THREE.DataTexture(data,size,size);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
function terrain(island,mat,random){
 const extent=1.16,n=100,pos=[],uv=[],colors=[],indices=[];
 const sand=new THREE.Color('#a89d7c'),grass=new THREE.Color('#626c38'),rock=new THREE.Color('#85887a');
 for(let row=0;row<=n;row++)for(let col=0;col<=n;col++){
  const x=island.x+(col/n*2-1)*island.rx*extent,z=island.z+(row/n*2-1)*island.rz*extent,y=islandHeight(x,z,island);
  pos.push(x,y,z);uv.push(x/32,z/32);
  const slope=Math.hypot(islandHeight(x+1,z,island)-y,islandHeight(x,z+1,island)-y);
  const patch=(Math.sin(x*.045+Math.sin(z*.034))*Math.cos(z*.052))*.5+.5;
  const color=y<2.3?sand.clone():grass.clone().lerp(rock,THREE.MathUtils.clamp((slope-.3)*1.8+patch*.35,0,1));
  color.multiplyScalar(.88+random()*.15);colors.push(color.r,color.g,color.b);
  if(row<n&&col<n){const a=row*(n+1)+col;indices.push(a,a+n+1,a+1,a+1,a+n+1,a+n+2);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const ground=mesh(new THREE.Group(),geometry,mat);return ground;
}
function cloudDome(){
 return new THREE.Mesh(new THREE.SphereGeometry(3900,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec3 ray; void main(){ray=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 ray;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.04+vec2(11.4,7.8);a*=.52;}return v;}
 void main(){vec3 d=normalize(ray);if(d.y<.015)discard;vec2 p=d.xz/(d.y+.16)*2.2+vec2(time*.002,0);float f=fbm(p);float density=smoothstep(.48,.72,f)*smoothstep(.015,.15,d.y);vec3 color=mix(vec3(.57,.64,.67),vec3(1.,.96,.87),smoothstep(.50,.79,f));gl_FragColor=vec4(color,density*.83);}` }));
}
export function createEnvironment(scene,renderer,mat){
 const random=seededRandom(83),sunDirection=new THREE.Vector3(-.8,.64,-1.1).normalize();
 const sky=new Sky();sky.scale.setScalar(4500);scene.add(sky);
 const u=sky.material.uniforms;u.turbidity.value=3.1;u.rayleigh.value=1.4;u.mieCoefficient.value=.005;u.mieDirectionalG.value=.83;u.sunPosition.value.copy(sunDirection).multiplyScalar(4500);
 const generator=new THREE.PMREMGenerator(renderer),environmentScene=new THREE.Scene();environmentScene.add(sky.clone());const environmentMap=generator.fromScene(environmentScene,.03);scene.environment=environmentMap.texture;scene.environmentIntensity=.55;generator.dispose();
 const clouds=cloudDome();scene.add(clouds);
 scene.add(new THREE.HemisphereLight('#cde9ff','#53503f',1.25));
 const sun=new THREE.DirectionalLight('#fff0d5',3.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=1;sun.shadow.camera.far=130;sun.shadow.normalBias=.015;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun,sun.target);
 const water=new Water(new THREE.PlaneGeometry(12000,12000),{textureWidth:512,textureHeight:512,waterNormals:normalTexture(),sunDirection,sunColor:'#fff4dd',waterColor:'#15515d',distortionScale:2.8,fog:true});
 water.rotation.x=-Math.PI/2;water.position.y=-.07;water.material.uniforms.size.value=2.3;
 // Replace the overly reflective default with water's physical normal-incidence Fresnel value.
 water.material.fragmentShader=water.material.fragmentShader.replace('float rf0 = 0.3;','float rf0 = 0.045;');
 scene.add(water);
 const rockMap=canvasTexture(256,256,(c,w,h)=>{const img=c.createImageData(w,h);for(let i=0;i<img.data.length;i+=4){const shade=150+random()*90;img.data[i]=shade;img.data[i+1]=shade;img.data[i+2]=shade;img.data[i+3]=255;}c.putImageData(img,0,0);for(let i=0;i<100;i++){c.strokeStyle='#38382920';c.lineWidth=random()*3;c.beginPath();c.moveTo(random()*w,random()*h);c.lineTo(random()*w,random()*h);c.stroke();}});
 const groundMat=new THREE.MeshStandardMaterial({vertexColors:true,map:rockMap,bumpMap:rockMap,bumpScale:.32,roughness:1});
 const bark=mat.paint('#574f39',{roughness:1}),leaves=mat.paint('#3f5238',{roughness:.94});
 const treePoints=[],rockPoints=[];
 for(const island of islands){scene.add(terrain(island,groundMat,random));
  for(let i=0;i<390;i++){const a=random()*Math.PI*2,r=.18+Math.sqrt(random())*.72;const x=island.x+Math.cos(a)*island.rx*r,z=island.z+Math.sin(a)*island.rz*r,y=islandHeight(x,z,island);if(y>4){treePoints.push({x,y,z,scale:.65+random()*1.1,angle:random()*Math.PI*2,color:new THREE.Color().setHSL(.22+random()*.08,.19+random()*.10,.19+random()*.08)});}}
  for(let i=0;i<105;i++){const a=random()*Math.PI*2,r=(.96+random()*.075)*shoreScale(a),x=island.x+Math.cos(a)*island.rx*r,z=island.z+Math.sin(a)*island.rz*r;rockPoints.push({x,y:Math.max(-1,islandHeight(x,z,island))-.35,z,scale:1+random()*4,angle:random()*6.28});}
  // An uneven shallow-water fringe and a thin foam line around each coast.
  const foamPos=[],foamUv=[],foamIndices=[];for(let i=0;i<=200;i++){const a=i/200*Math.PI*2;for(const r of [1.005,1.021]){foamPos.push(island.x+Math.cos(a)*island.rx*shoreScale(a)*r,-.015,island.z+Math.sin(a)*island.rz*shoreScale(a)*r);foamUv.push(i/200*12,r===1.005?0:1);}if(i<200){const k=i*2;foamIndices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(foamPos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(foamUv,2));g.setIndex(foamIndices);
  const foamMat=new THREE.MeshBasicMaterial({color:'#d0e2d9',transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false});scene.add(new THREE.Mesh(g,foamMat));
 }
 // Instanced, irregular umbrella pines: layered organic crowns with visible trunks.
 const crowns=[];for(const [x,y,z,sx,sy,sz] of [[0,5.4,0,2.8,1.4,2.6],[-1.4,4.7,.3,1.8,1.25,1.8],[1.25,5.05,-.5,1.9,1.3,1.6],[.4,5.9,.6,1.7,1.05,1.6]]){const g=new THREE.IcosahedronGeometry(1,1);g.scale(sx,sy,sz);g.translate(x,y,z);crowns.push(g);}const crownGeometry=mergeGeometries(crowns);
 const foliage=new THREE.InstancedMesh(crownGeometry,leaves,treePoints.length),trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.15,.27,4.6,6),bark,treePoints.length),dummy=new THREE.Object3D();
 treePoints.forEach((t,i)=>{dummy.position.set(t.x,t.y,t.z);dummy.scale.setScalar(t.scale);dummy.rotation.set(0,t.angle,0);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,t.color);dummy.position.y+=2.3*t.scale;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);});foliage.receiveShadow=true;scene.add(foliage,trunks);
 const stones=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),mat.paint('#969586',{roughness:1}),rockPoints.length);rockPoints.forEach((r,i)=>{dummy.position.set(r.x,r.y,r.z);dummy.scale.set(r.scale,r.scale*.65,r.scale*.78);dummy.rotation.set(random(),r.angle,random());dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);stones.setColorAt(i,new THREE.Color().setHSL(.10,.06,.42+random()*.2));});stones.receiveShadow=true;scene.add(stones);
 // Lighthouse with gallery, glazed lantern room, door, and a stone retaining terrace.
 const isle=islands[0],lx=-164,lz=-338,ly=islandHeight(lx,lz,isle);
 const tower=new THREE.Group();tower.position.set(lx,ly,lz);scene.add(tower);
 cylinder(tower,mat.paint('#8b8877'),0,.8,0,9,10,1.6,32);cylinder(tower,mat.gelcoat,0,10.2,0,2.3,3.2,19,32);
 cylinder(tower,mat.navy,0,13.9,0,2.49,2.6,2.2,32);cylinder(tower,mat.steel,0,20,0,3.45,3.45,.4,32);cylinder(tower,mat.glass,0,21.4,0,2.1,2.1,2.5,16);mesh(tower,new THREE.ConeGeometry(2.8,2,24),mat.paint('#53636b'),0,23.6,0);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;bar(tower,mat.steel,[Math.cos(a)*3.2,20.2,Math.sin(a)*3.2],[Math.cos(a)*3.2,21.4,Math.sin(a)*3.2],.05);}
 const gallery=mesh(tower,new THREE.TorusGeometry(3.2,.06,6,48),mat.steel,0,21.35,0);gallery.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;bar(tower,mat.navy,[Math.cos(a)*2.13,20.1,Math.sin(a)*2.13],[Math.cos(a)*2.13,22.8,Math.sin(a)*2.13],.06);}
 box(tower,mat.teak,2.8,2.3,0,.09,3.1,1.3);for(const y of [7,12,17])box(tower,mat.glass,2.55,y,0,.04,1.2,.63);
 // Coastal settlement, individually pitched tile roofs, chimneys, shutters, and terraces.
 const walls=[mat.paint('#e6deca'),mat.paint('#cbbdab'),mat.paint('#ebe8d8')],roofMat=mat.paint('#9b6753',{roughness:.85});
 for(let i=0;i<23;i++){
  const a=-.9+i*.082,r=.73+(i%3)*.045,x=isle.x+Math.cos(a)*isle.rx*r,z=isle.z+Math.sin(a)*isle.rz*r,y=islandHeight(x,z,isle),w=5+random()*3,d=4+random()*3,h=3+random()*2;
  const house=new THREE.Group();house.position.set(x,y,z);house.rotation.y=-a+.3;scene.add(house);box(house,walls[i%3],0,h/2,0,w,h,d,.07);
  const roofGeometry=new THREE.BufferGeometry(),p=[-w*.55,0,-d*.56,w*.55,0,-d*.56,0,1.7,-d*.56,-w*.55,0,d*.56,0,1.7,d*.56,w*.55,0,d*.56,-w*.55,0,-d*.56,0,1.7,-d*.56,-w*.55,0,d*.56,0,1.7,-d*.56,0,1.7,d*.56,-w*.55,0,d*.56,0,1.7,-d*.56,w*.55,0,-d*.56,w*.55,0,d*.56,0,1.7,-d*.56,w*.55,0,d*.56,0,1.7,d*.56];roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));roofGeometry.computeVertexNormals();mesh(house,roofGeometry,roofMat,0,h,0);
  box(house,walls[1],w*.25,h+.65,0,.55,1.8,.65);for(const side of [-1,1]){box(house,mat.glass,side*w*.25,h*.55,d*.5+.04,.85,1.2,.04);box(house,mat.navy,side*w*.25-.58,h*.55,d*.5+.055,.23,1.3,.05);box(house,mat.navy,side*w*.25+.58,h*.55,d*.5+.055,.23,1.3,.05);}
 }
 // A timber marina with piles, finger pontoons, bollards, and dock services.
 box(scene,mat.teak,477,.7,13,120,1,5,.12);for(let i=0;i<9;i++){const x=423+i*13;box(scene,mat.teak,x,.85,25,2, .45,25,.05);for(const z of [13,36]){cylinder(scene,mat.teak,x,0,z,.25,.30,6);cylinder(scene,mat.gelcoat,x,2.6,z,.28,.28,.2);}
  box(scene,mat.gelcoat,x+1.5,1.4,12,.55,1.1,.55);box(scene,mat.blue,x+1.5,1.8,12.3,.26,.16,.04);}
 const navigation=[];
 buoys.forEach((b,i)=>{const g=new THREE.Group();g.position.set(b.x,0,b.z);scene.add(g);navigation.push(g);cylinder(g,mat.paint('#c79e48'),0,.25,0,.7,1.03,.7);cylinder(g,mat.paint('#d7b35e'),0,1,0,.4,.7,.9);cylinder(g,mat.rubber,0,1.6,0,.32,.32,.35);cylinder(g,mat.paint('#d7b35e'),0,2.15,0,.25,.29,.8);bar(g,mat.steel,[0,2.4,0],[0,3.4,0],.032);mesh(g,new THREE.ConeGeometry(.25,.5,10),mat.red,0,3.5,0);
  const tex=canvasTexture(128,128,(c)=>{c.fillStyle='#e6c570';c.fillRect(0,0,128,128);c.fillStyle='#252d25';c.font='bold 90px sans-serif';c.textAlign='center';c.fillText(String(i+1),64,101);});mesh(g,new THREE.PlaneGeometry(.46,.46),new THREE.MeshStandardMaterial({map:tex}),0,1.1,.57);
 });
 // Distant ridgelines add scale beyond the navigable archipelago.
 for(let i=0;i<4;i++){const distant={x:-1800+i*1050,z:-2200-i%2*250,rx:800,rz:450,height:145+i*24};scene.add(terrain(distant,groundMat,random));}
 // Gulls move independently of the yacht.
 const birds=new THREE.Group();scene.add(birds);const gullMat=mat.paint('#d8dbd4',{side:THREE.DoubleSide});const birdObjects=[];
 for(let i=0;i<9;i++){const g=new THREE.Group();birds.add(g);const wings=[];for(const side of [-1,1]){const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,side*1.3,.12,.08,side*.45,0,.35],3));geom.computeVertexNormals();wings.push(mesh(g,geom,gullMat));}birdObjects.push({group:g,wings});}
 // Foam trail as a soft textured surface rather than rigid white rectangles.
 const foamTexture=canvasTexture(256,512,(c,w,h)=>{c.clearRect(0,0,w,h);for(let i=0;i<3200;i++){const y=random()*h,t=y/h,x=w/2+(random()-.5)*(35+t*190);c.fillStyle=`rgba(220,244,238,${(1-t)*random()*.23})`;c.beginPath();c.ellipse(x,y,1+random()*4,1+random()*7,0,0,6.28);c.fill();}});
 const wake=new THREE.Mesh(new THREE.PlaneGeometry(12,45),new THREE.MeshBasicMaterial({map:foamTexture,transparent:true,opacity:.5,depthWrite:false}));wake.rotation.x=-Math.PI/2;scene.add(wake);
 for(const child of scene.children){if(child.isGroup && child!==birds && !navigation.includes(child))batchStaticMeshes(child,mergeGeometries);}
 return {water,update(state,time){
  water.material.uniforms.time.value=time*.45;water.material.uniforms.distortionScale.value=1.8+state.windSpeed*.07;clouds.material.uniforms.time.value=time;
  sun.position.set(state.x+sunDirection.x*65,45,state.z+sunDirection.z*65);sun.target.position.set(state.x,4,state.z);
  navigation.forEach((g,i)=>{g.position.y=Math.sin(time*1.2+i)*.07;g.rotation.z=Math.sin(time*.9+i)*.045;});
  birdObjects.forEach(({group,wings},i)=>{const a=time*.026+i*.65;group.position.set(-90+Math.cos(a)*130,24+i*2+Math.sin(time*.7+i)*1.3,-230+Math.sin(a)*90);group.rotation.y=-a;wings.forEach((w,j)=>w.rotation.z=Math.sin(time*2.9+i)*.22*(j?1:-1));});
  wake.position.set(state.x-Math.sin(state.heading*Math.PI/180)*26,.01,state.z+Math.cos(state.heading*Math.PI/180)*26);wake.rotation.z=state.heading*Math.PI/180;wake.visible=state.speed>.4;wake.material.opacity=Math.min(.66,state.speed*.1);
 },dispose(){environmentMap.dispose();}};
}
