import * as THREE from 'three';
import { CATAMARAN } from '../vessels.js';

// Existing visual hull sections, metres: local +X starboard and −Z forward.
// Water exclusion and the visible shell use the same section definition.
export const HULL_SECTIONS=Object.freeze([[-6.6,.015],[-6,.55],[-4.7,1.25],[-3,1.75],[-1,2.02],[1,2.06],[3,1.95],[5.25,1.62]].map(Object.freeze));
export function widthAt(z){
 for(let i=1;i<HULL_SECTIONS.length;i++)if(z<=HULL_SECTIONS[i][0]){const a=HULL_SECTIONS[i-1],b=HULL_SECTIONS[i],t=(z-a[0])/(b[0]-a[0]);return THREE.MathUtils.lerp(a[1],b[1],t);}
 return HULL_SECTIONS.at(-1)[1];
}
export function hullSection(z){return {width:widthAt(z),sheer:.94+.17*((z-1)/7)**2,depth:1.53-.45*(Math.abs(z)/6.6)**3};}
export function insideHull({x,y,z}){
 if(z<HULL_SECTIONS[0][0]||z>HULL_SECTIONS.at(-1)[0])return false;
 const {width,sheer,depth}=hullSection(z),s=(sheer-y)/depth;
 return s>=0&&s<=1&&Math.abs(x)<width*(1-.07*s)*Math.sqrt(1-s*s);
}
export function hullGeometry(){
 const pos=[],uv=[],index=[],rows=96,columns=40;
 for(let i=0;i<=rows;i++){const t=i/rows,z=-6.6+t*11.85,{width,sheer,depth}=hullSection(z);for(let j=0;j<=columns;j++){
  const a=j/columns*Math.PI,side=Math.cos(a),d=Math.sin(a);
  pos.push(side*width*(1-.07*d),sheer-d*depth,z);uv.push(t,j/columns);
  if(i<rows&&j<columns){const n=i*(columns+1)+j;index.push(n,n+columns+2,n+columns+1,n,n+1,n+columns+2);}
 }}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}

// Discard only water fragments inside the actual heeled/pitched hull volume.
// This prevents an infinite ocean plane crossing a dry cockpit when heeled.
export function installHullWaterExclusion(material,{vesselId='monohull'}={}){
 const inverse={value:new THREE.Matrix4()},active={value:false};
 material.uniforms.hullInverse=inverse;material.uniforms.hullExclusionActive=active;
 const gl=n=>Number(n).toFixed(8);
 const sections=HULL_SECTIONS.slice(1).map(([z,w],i)=>{
  const [pz,pw]=HULL_SECTIONS[i];
  return `if(p.z<=${gl(z)})w=mix(${gl(pw)},${gl(w)},(p.z-(${gl(pz)}))/${gl(z-pz)});`;
 }).join('else ');
 const catSections=CATAMARAN.sections.slice(1).map(([z,w],i)=>{
  const [pz,pw]=CATAMARAN.sections[i];return `if(p.z<=${gl(z)})w=mix(${gl(pw)},${gl(w)},(p.z-(${gl(pz)}))/${gl(z-pz)});`;
 }).join('else ');
 material.fragmentShader=`uniform mat4 hullInverse;\nuniform bool hullExclusionActive;\n`+material.fragmentShader;
 material.fragmentShader=material.fragmentShader.replace('void main() {',`void main() {
  if(hullExclusionActive){
   vec3 p=(hullInverse*worldPosition).xyz;
   ${vesselId==='catamaran'?`
   // Leave a narrow overlap beneath the closed shell. Its triangulated curve
   // is slightly inside the analytic profile; cutting to that profile opens
   // flashing gaps at the waterline as the hull rocks.
   if(p.z>=-5.98&&p.z<=5.98){
    float x=abs(abs(p.x)-2.5);
    float sheer=p.z>4.?1.3-(p.z-4.)*.5:1.3+.18*pow(max(0.,-p.z)/6.,2.);
    float depth=sheer+.7*(1.-.8*pow(abs(p.z)/6.,3.));
    float s=(sheer-p.y)/depth;
    if(s>=0.&&s<=1.){float w=.53;${catSections}
     if(x<max(0.,w*(1.-.07*s)*sqrt(max(0.,1.-s*s))-.04))discard;
    }
   }
   `:`
   if(p.z>=-6.6&&p.z<=5.25&&abs(p.x)<2.061){
    float sheerRatio=(p.z-1.)/7.;
    float sheer=.94+.17*sheerRatio*sheerRatio;
    float depth=1.53-.45*pow(abs(p.z)/6.6,3.);
    float s=(sheer-p.y)/depth;
    if(s>=0.&&s<=1.){float w=1.62;${sections}
     if(abs(p.x)<w*(1.-.07*s)*sqrt(max(0.,1.-s*s)))discard;
    }
   }
   `}
  }`);
 material.needsUpdate=true;
 return boat=>{boat.updateWorldMatrix(true,false);inverse.value.copy(boat.matrixWorld).invert();active.value=true;};
}
