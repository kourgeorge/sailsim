import * as THREE from 'three';
import { islandHeight, shoreScale } from './geography.js';
import { createIslandTerrain, TERRAIN_SEGMENTS } from './shoreline.js';

// Sample the actual triangulated cliff, not the smoother analytic height field.
// The previous ribbons disappeared wherever a terrain triangle rose above them.
function cliffSurface(island) {
  const geometry = createIslandTerrain(island);
  const positions = geometry.attributes.position;
  const indices = geometry.index.array;
  const sectors = Array.from({ length: TERRAIN_SEGMENTS }, () => []);
  for (let i = 0; i < indices.length; i += 3) {
    const triangle = [indices[i], indices[i + 1], indices[i + 2]].map((index) => ({
      x: positions.getX(index),
      y: positions.getY(index),
      z: positions.getZ(index),
    }));
    sectors[Math.floor(i / 6) % TERRAIN_SEGMENTS].push(triangle);
  }
  geometry.dispose();
  return (x, z) => {
    const angle = Math.atan2((z - island.z) / island.rz, (x - island.x) / island.rx);
    const sector = Math.floor((((angle + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * TERRAIN_SEGMENTS);
    for (const [a, b, c] of sectors[sector]) {
      const denominator = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
      if (Math.abs(denominator) < 1e-8) continue;
      const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / denominator;
      const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / denominator;
      if (u >= -1e-5 && v >= -1e-5 && u + v <= 1.00001)
        return u * a.y + v * b.y + (1 - u - v) * c.y;
    }
    return islandHeight(x, z, island);
  };
}

const noise = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
}`;
const vertexShader = /* glsl */ `
varying vec2 flow;
#include <common>
#include <fog_pars_vertex>
void main() { flow=uv; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition;
#include <fog_vertex>
}`;
function material(fragmentShader, time) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), time },
    vertexShader,
    fragmentShader: `uniform float time; varying vec2 flow;
      #include <common>
      #include <fog_pars_fragment>
      ${noise}
      void main() { ${fragmentShader}
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
      }`,
  });
}

export function createWaterfalls(scene, location) {
  if (!location.waterfalls?.length) return null;
  const time = { value: 0 };
  const positions = [],
    uvs = [],
    indices = [];
  const mouths = [];
  const surfaces = new Map();
  for (const [fallIndex, fall] of location.waterfalls.entries()) {
    const island = location.islands[fall.islandIndex];
    if (!surfaces.has(island)) surfaces.set(island, cliffSurface(island));
    const surface = surfaces.get(island),
      base = positions.length / 3;
    const segments = 200,
      across = 8;
    let length = 0,
      previous;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments,
        r = 0.39 + t * 0.616;
      const angle = fall.angle + Math.sin(t * 11 + fallIndex) * 0.009;
      const x = island.x + Math.cos(angle) * island.rx * r * shoreScale(angle);
      const z = island.z + Math.sin(angle) * island.rz * r * shoreScale(angle);
      const y = Math.max(0.12, surface(x, z) + 0.7);
      if (previous) length += Math.hypot(x - previous.x, y - previous.y, z - previous.z);
      previous = { x, y, z };
      const width = (3.3 + t * 4.6) * (1 + 0.19 * Math.sin(t * 23 + fallIndex));
      for (let j = 0; j <= across; j++) {
        const side = (j / across - 0.5) * 2;
        const px = x - Math.sin(angle) * side * width;
        const pz = z + Math.cos(angle) * side * width;
        positions.push(px, Math.max(0.12, surface(px, pz) + 0.7), pz);
        uvs.push(j / across, length);
        if (i < segments && j < across) {
          const k = base + i * (across + 1) + j;
          indices.push(k, k + across + 1, k + 1, k + 1, k + across + 1, k + across + 2);
        }
      }
      if (i === segments) mouths.push({ x, z, angle });
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const falls = new THREE.Mesh(
    geometry,
    material(
      /* glsl */ `
    float travel = flow.y - time * 16.;
    float broad = noise(vec2(flow.x*7.,travel*.045));
    float fine = noise(vec2(flow.x*34.+broad*2.,travel*.23));
    float strands = noise(vec2(flow.x*17.,travel*.016));
    float edge = smoothstep(0.02,.22,flow.x) * (1.-smoothstep(.78,.98,flow.x));
    edge *= smoothstep(0.,9.,flow.y);
    float foam = smoothstep(.18,.75,broad*.55+fine*.45);
    vec3 color = mix(vec3(.43,.64,.67),vec3(.91,.97,.95),foam*.7+strands*.3);
    gl_FragColor=vec4(color,edge*(.28+foam*.45+strands*.25));
  `,
      time,
    ),
  );
  falls.name = 'Fjord waterfalls';
  scene.add(falls);
  const mistMaterial = material(
    /* glsl */ `
    vec2 p=flow*2.-1.;
    float cloud=noise(vec2(p.x*3.+time*.12,p.y*3.-time*.21));
    float edge=1.-smoothstep(.25,1.,length(p*vec2(1.,.9)));
    float veil=smoothstep(.16,.8,cloud)*edge*.28;
    gl_FragColor=vec4(.79,.9,.9,veil);
  `,
    time,
  );
  const foamMaterial = material(
    /* glsl */ `
    vec2 p=flow*2.-1.; float r=length(p);
    float grain=noise(p*17.+vec2(time*.3,-time*.2));
    float waves=.5+.5*sin(r*32.-time*2.8+grain*3.);
    float alpha=(1.-smoothstep(.05,1.,r))*(.15+grain*.28+waves*.13);
    gl_FragColor=vec4(.8,.93,.91,alpha);
  `,
    time,
  );
  for (const { x, z, angle } of mouths) {
    const spray = new THREE.Mesh(new THREE.PlaneGeometry(32, 25), mistMaterial);
    spray.name = 'Waterfall spray';
    spray.position.set(x + Math.cos(angle) * 3, 10, z + Math.sin(angle) * 3);
    spray.rotation.y = Math.PI / 2 - angle;
    scene.add(spray);
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(32, 38), foamMaterial);
    foam.name = 'Waterfall plunge foam';
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(x + Math.cos(angle) * 9, 0.14, z + Math.sin(angle) * 9);
    scene.add(foam);
  }
  return {
    mesh: falls,
    update(value) {
      time.value = value;
    },
  };
}
