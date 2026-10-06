import * as THREE from 'three';
import { terrainHeights, polygonHeight } from '../world/real-terrain.js';

const palettes = {
  tropical: ['#598149', '#9a9a73', '#e3d4a2'],
  mediterranean: ['#7d884a', '#b2ad8b', '#ddd0a3'],
  volcanic: ['#84724f', '#968778', '#564c43'],
  fjord: ['#52775a', '#8b989c', '#8c9a97'],
  temperate: ['#52794c', '#899586', '#d5c99f'],
};

export function createSurveyTerrain(island) {
  const r = island.raster, h = terrainHeights(r);
  const positions = new Float32Array(h.length * 3), colors = new Float32Array(h.length * 3), uvs = new Float32Array(h.length * 2), indices = [];
  const [grass, rock, sand] = (island.palette ? [island.palette.grass,island.palette.rock,island.palette.sand] : palettes[island.profile] || palettes.temperate).map(c => new THREE.Color(c));
  const deep = new THREE.Color('#376e70'), snow = new THREE.Color('#edf0e9'), color = new THREE.Color();
  const dx = r.width / (r.cols - 1), dz = r.length / (r.rows - 1);
  for (let row = 0; row < r.rows; row++) for (let col = 0; col < r.cols; col++) {
    const i = row * r.cols + col, y = h[i];
    const x = island.x - r.width / 2 + col * dx, z = island.z - r.length / 2 + row * dz;
    positions.set([x, y, z], i * 3); uvs.set([x / 32, z / 32], i * 2);
    const slope = Math.hypot((h[row * r.cols + Math.min(col + 1, r.cols - 1)] - y) / dx, (h[Math.min(row + 1, r.rows - 1) * r.cols + col] - y) / dz);
    const patch = (Math.sin(x * .003) * Math.cos(z * .002) + 1) / 2;
    color.copy(grass).lerp(rock, THREE.MathUtils.clamp(slope * 1.2 + patch * .2, 0, 1));
    color.lerp(sand, 1 - THREE.MathUtils.smoothstep(y, 0, island.profile === 'volcanic' ? 10 : 6));
    if (y < 0) color.lerp(deep, Math.min(1, -y / 25));
    if (island.profile === 'fjord') color.lerp(snow, THREE.MathUtils.smoothstep(y + patch * 90, 1150, 1550) * (1 - Math.min(.7, slope * .35)));
    colors.set([color.r, color.g, color.b], i * 3);
    if (row < r.rows - 1 && col < r.cols - 1) {
      const a = i, b = i + 1, c = i + r.cols, d = c + 1;
      // Omit fully submerged cells. Coast-crossing triangles remain intact.
      if (!island.cutouts?.some(c=>Math.abs(x+dx/2-c.x)<c.rx&&Math.abs(z+dz/2-c.z)<c.rz) && Math.max(h[a], h[b], h[c], h[d]) > -4) indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createCayTerrain(island) {
  const positions=[],colors=[],uv=[],indices=[],n=island.polygon.length,rings=[0,.2,.4,.6,.8,1,1.15,1.5];
  const area=island.polygon.reduce((sum,p,i)=>{const q=island.polygon[(i+1)%n];return sum+p[0]*q[1]-q[0]*p[1];},0);
  const sand=new THREE.Color(island.palette?.sand||'#f4ead3'),green=new THREE.Color('#85965b');
  rings.forEach((r,row)=>island.polygon.forEach(([px,pz],i)=>{
    const x=island.x+(px-island.x)*r,z=island.z+(pz-island.z)*r,y=polygonHeight(x,z,island);
    positions.push(x,y,z);uv.push(x/32,z/32);const c=sand.clone().lerp(green,1-THREE.MathUtils.smoothstep(r,.28,.5));colors.push(c.r,c.g,c.b);
    if(row){const a=row*n+i,b=row*n+(i+1)%n,c=(row-1)*n+i,d=(row-1)*n+(i+1)%n;indices.push(...(area>0?[a,c,b,b,c,d]:[a,b,c,b,d,c]));}
  }));
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
