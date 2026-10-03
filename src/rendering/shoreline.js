import * as THREE from 'three';
import { islandHeight, shoreScale } from './geography.js';
import { installHullWaterExclusion } from './hull-geometry.js';

const SEGMENTS = 160;
// Spend the existing terrain triangle budget at the waterline, instead of on
// a square grid whose large edge triangles cut across the curved coast.
const RADII = [
  0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.36, 0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.83, 0.87, 0.9,
  0.925, 0.95, 0.97, 0.985, 1, 1.025, 1.06, 1.1, 1.16,
];

export function createIslandTerrain(island) {
  const positions = [],
    uvs = [],
    colors = [],
    indices = [];
  const sand = new THREE.Color('#c7b58c'),
    wet = new THREE.Color('#827c60');
  const grass = new THREE.Color('#626c38'),
    rock = new THREE.Color('#85887a');
  for (let row = 0; row < RADII.length; row++) {
    const radius = RADII[row];
    for (let column = 0; column <= SEGMENTS; column++) {
      const angle = (column / SEGMENTS) * Math.PI * 2,
        r = radius * shoreScale(angle);
      const x = island.x + Math.cos(angle) * island.rx * r;
      const z = island.z + Math.sin(angle) * island.rz * r;
      const y = islandHeight(x, z, island);
      positions.push(x, y, z);
      uvs.push(x / 32, z / 32);
      const slope = Math.hypot(
        islandHeight(x + 1, z, island) - y,
        islandHeight(x, z + 1, island) - y,
      );
      const patch = Math.sin(x * 0.045 + Math.sin(z * 0.034)) * Math.cos(z * 0.052) * 0.5 + 0.5;
      const color = grass
        .clone()
        .lerp(rock, THREE.MathUtils.clamp((slope - 0.3) * 1.8 + patch * 0.35, 0, 1));
      color.lerp(sand, 1 - THREE.MathUtils.smoothstep(y, 0.5, 3.8));
      color.lerp(wet, THREE.MathUtils.smoothstep(radius, 0.954, 1.005) * 0.78);
      color.multiplyScalar(0.93 + 0.07 * Math.sin(x * 0.23 + z * 0.17));
      colors.push(color.r, color.g, color.b);
      if (row && column < SEGMENTS) {
        const a = row * (SEGMENTS + 1) + column,
          b = a - SEGMENTS - 1;
        indices.push(b, b + 1, a, b + 1, a + 1, a);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createShoreline(scene, location, waterNormals, { vesselId = 'monohull' } = {}) {
  const positions = [],
    uvs = [],
    indices = [];
  // Metres of depth: match the same contours used by the chart and grounding.
  const depths = [-0.18, 0, 0.1, 0.35, 0.8, 1.6, 2.6, 3.8];
  for (const island of location.islands) {
    const offset = positions.length / 3;
    let length = 0,
      previous = null;
    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i / SEGMENTS) * Math.PI * 2,
        shape = shoreScale(angle);
      const dx = Math.cos(angle) * island.rx * shape,
        dz = Math.sin(angle) * island.rz * shape;
      if (previous) length += Math.hypot(dx - previous.x, dz - previous.z);
      previous = { x: dx, z: dz };
      for (let j = 0; j < depths.length; j++) {
        const depth = depths[j],
          r = 1 + depth / location.shoreDepthScale;
        positions.push(island.x + dx * r, depth <= 0.1 ? 0.012 : -0.045, island.z + dz * r);
        uvs.push(length, depth);
        if (i < SEGMENTS && j < depths.length - 1) {
          const k = offset + i * depths.length + j;
          indices.push(
            k,
            k + depths.length,
            k + 1,
            k + 1,
            k + depths.length,
            k + depths.length + 1,
          );
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  const material = new THREE.ShaderMaterial({
    name: 'Coastal shallows',
    transparent: true,
    depthWrite: false,
    fog: true,
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      time: { value: 0 },
      wind: { value: 12 },
      normalSampler: { value: waterNormals },
      shallowColor: { value: new THREE.Color('#54a9a0') },
      sandColor: { value: new THREE.Color('#92967b') },
      foamColor: { value: new THREE.Color('#e1eeDE') },
    },
    vertexShader: /* glsl */ `
      varying vec2 coast; varying vec4 worldPosition;
      #include <common>
      #include <fog_pars_vertex>
      void main() {
        coast = uv; worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 mvPosition = viewMatrix * worldPosition;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float time; uniform float wind; uniform sampler2D normalSampler;
      uniform vec3 shallowColor; uniform vec3 sandColor; uniform vec3 foamColor;
      varying vec2 coast; varying vec4 worldPosition;
      #include <common>
      #include <fog_pars_fragment>
      float wash(float phase, float depth, float irregularity) {
        float progress = fract(phase);
        float front = mix(.65, -.12, progress);
        float edge = 1.0 - smoothstep(.018, .12, abs(depth - front + irregularity));
        return edge * sin(progress * 3.14159);
      }
      void main() {
        float depth = coast.y;
        vec2 noise = texture2D(normalSampler, worldPosition.xz * .08 + vec2(time * .012, 0.0)).rg;
        float broken = smoothstep(.25, .64, noise.x + .10 * sin(coast.x * .19));
        float phase = time * (.105 + min(wind, 25.0) * .0016) + sin(coast.x * .041) * .13;
        float foam = max(wash(phase, depth, (noise.y - .5) * .08),
                         wash(phase + .5, depth, (noise.x - .5) * .06) * .6) * broken;
        float fringe = (1.0 - smoothstep(.015, .06, abs(depth))) * broken * .3;
        foam = max(foam, fringe);
        float fade = 1.0 - smoothstep(.25, 3.8, depth);
        vec3 color = mix(sandColor, shallowColor, smoothstep(0.0, 1.0, depth));
        color *= .93 + noise.y * .14;
        color = mix(color, foamColor, foam);
        float alpha = fade * (.34 * smoothstep(-.02, .03, depth) + foam * .60);
        alpha *= smoothstep(-.18, -.10, depth);
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Coastal shallows';
  scene.add(mesh);
  const excludeHullWater = installHullWaterExclusion(material, { vesselId });
  return {
    mesh,
    excludeHullWater,
    update(state, time) {
      material.uniforms.time.value = time;
      material.uniforms.wind.value = state.windSpeed;
    },
  };
}
