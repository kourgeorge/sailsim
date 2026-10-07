import * as THREE from 'three';
import { terrainHeights } from '../world/real-terrain.js';

// One small color texture makes shallow banks, reef shelves and deep channels
// visible on both water renderers. The coast comes from the physics height grid.
export function installDestinationWater(material,location) {
  const land=location.islands[0],r=land.raster,h=terrainHeights(r),c=location.character;
  const deep=new THREE.Color(c.water),shallow=new THREE.Color(c.shallows),color=new THREE.Color();
  const pixels=new Uint8Array(h.length*4);
  for(let i=0;i<h.length;i++) {
    const depth=Math.max(0,-h[i]);
    const light=1-THREE.MathUtils.smoothstep(depth,2,location.id==='exumas'?28:60);
    color.copy(deep).lerp(shallow,light*.9);
    const patch=.98+.02*Math.sin((i%r.cols)*.6)*Math.sin(Math.floor(i/r.cols)*.8);
    pixels.set([color.r*255*patch,color.g*255*patch,color.b*255*patch,255],i*4);
  }
  const texture=new THREE.DataTexture(pixels,r.cols,r.rows,THREE.RGBAFormat);texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
  Object.assign(material.uniforms,{destinationWater:{value:texture},destinationOrigin:{value:new THREE.Vector2(land.x-r.width/2,land.z-r.length/2)},destinationSize:{value:new THREE.Vector2(r.width,r.length)},destinationDay:{value:1},destinationLight:{value:1}});
  material.fragmentShader='uniform sampler2D destinationWater; uniform vec2 destinationOrigin; uniform vec2 destinationSize; uniform float destinationDay; uniform float destinationLight;\n'+material.fragmentShader;
  material.fragmentShader=material.fragmentShader.replace('void main() {',`void main() {
    vec2 destinationUV=(worldPosition.xz-destinationOrigin)/destinationSize;
    float withinSurvey=step(0.0,destinationUV.x)*step(0.0,destinationUV.y)*step(destinationUV.x,1.0)*step(destinationUV.y,1.0);
    vec3 destinationColor=mix(waterColor,texture2D(destinationWater,destinationUV).rgb*destinationLight,withinSurvey*destinationDay);
  `).replace('vec3 body = waterColor','vec3 body = destinationColor');
  return texture;
}
