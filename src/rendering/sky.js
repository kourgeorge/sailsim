import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

let cloudPixels;
function cloudTexture() {
  const size = 256;
  // Bake seamless noise once, instead of evaluating many noise octaves for
  // every sky pixel on every frame. Each scene owns its disposable GPU texture.
  if (!cloudPixels) {
    cloudPixels = new Uint8Array(size * size * 4);
    const hash = (x, y) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    function noise(x, y, period) {
      const ix = Math.floor(x),
        iy = Math.floor(y);
      let fx = x - ix,
        fy = y - iy;
      fx *= fx * (3 - 2 * fx);
      fy *= fy * (3 - 2 * fy);
      const a = hash(ix % period, iy % period),
        b = hash((ix + 1) % period, iy % period),
        c = hash(ix % period, (iy + 1) % period),
        d = hash((ix + 1) % period, (iy + 1) % period);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        let density = 0,
          amplitude = 0.52,
          total = 0;
        for (let octave = 0; octave < 5; octave++) {
          const period = 4 * 2 ** octave;
          density += noise((x / size) * period, (y / size) * period, period) * amplitude;
          total += amplitude;
          amplitude *= 0.5;
        }
        const i = (y * size + x) * 4;
        cloudPixels[i] = (density / total) * 255;
        cloudPixels[i + 1] = noise((x / size) * 8, (y / size) * 8, 8) * 255;
        cloudPixels[i + 2] = noise((x / size) * 32, (y / size) * 32, 32) * 255;
        cloudPixels[i + 3] = 255;
      }
  }
  const texture = new THREE.DataTexture(cloudPixels, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function createAtmosphere(scene, sunDirection, location, quality) {
  const fjord = location.biome === 'fjord';
  const sky = new Sky();
  sky.name = 'Atmospheric sky';
  sky.scale.setScalar(4500);
  const u = sky.material.uniforms;
  u.turbidity.value = fjord ? 2 : 1.8;
  u.rayleigh.value = fjord ? 2.5 : 2.8;
  u.mieCoefficient.value = 0.003;
  u.mieDirectionalG.value = 0.8;
  u.sunPosition.value.copy(sunDirection).multiplyScalar(4500);
  // Expose the bright scattering model separately from the boat, retaining
  // blue sky detail instead of clipping most of it to white in tone mapping.
  sky.material.uniforms.skyExposure = { value: 0.38 };
  sky.material.fragmentShader =
    `uniform float skyExposure;\n${sky.material.fragmentShader}`.replace(
      'vec4( retColor, 1.0 )',
      'vec4( retColor * skyExposure * mix(vec3(1.0), vec3(0.65, 0.9, 1.12), smoothstep(0.02, 0.55, direction.y)), 1.0 )',
    );
  scene.add(sky);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(3900, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      uniforms: {
        cloudNoise: { value: cloudTexture() },
        drift: { value: new THREE.Vector2() },
        sunDirection: { value: sunDirection.clone() },
        coverage: { value: fjord ? 0.46 : 0.5 },
        haze: { value: new THREE.Color(fjord ? '#bacfdf' : '#c7dce8') },
      },
      vertexShader: `
        varying vec3 ray;
        void main() {
          ray = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 ray;
        uniform sampler2D cloudNoise;
        uniform vec2 drift;
        uniform vec3 sunDirection;
        uniform vec3 haze;
        uniform float coverage;
        void main() {
          vec3 d = normalize(ray);
          if (d.y < 0.005) discard;
          vec2 p = d.xz / (d.y + 0.2) * 0.42 + drift;
          vec3 field = texture2D(cloudNoise, p).rgb;
          // Broad rounded banks with small, broken edges; no ray marching.
          float shape = field.r - (1.0 - field.b) * 0.035;
          float density = smoothstep(coverage, coverage + 0.12, shape);
          float sunward = texture2D(cloudNoise, p + sunDirection.xz * 0.035).r;
          float relief = clamp((shape - sunward) * 6.0, -0.3, 0.35);
          float facingSun = pow(max(dot(d, sunDirection), 0.0), 12.0);
          float lighting = clamp(0.8 + relief - density * 0.26, 0.2, 1.0);
          vec3 shade = vec3(0.36, 0.46, 0.59);
          vec3 lit = mix(vec3(1.2, 1.22, 1.25), vec3(1.42, 1.29, 1.06), facingSun);
          vec3 color = mix(shade, lit, lighting);
          float rim = max(relief, 0.0) * (1.0 - density) * facingSun;
          color += vec3(1.0, 0.86, 0.61) * rim * 1.4;

          // A faint, higher layer of wind-stretched cirrus uses one texture tap.
          vec3 high = texture2D(cloudNoise, p * vec2(0.65, 3.6) + vec2(0.37, 0.12) - drift * 0.4).rgb;
          float wisps = smoothstep(0.57, 0.83, high.g + high.b * 0.08);
          wisps *= smoothstep(0.15, 0.5, d.y) * 0.22;
          float bodyAlpha = density * 0.94;
          float alpha = bodyAlpha + wisps * (1.0 - bodyAlpha);
          color = (color * bodyAlpha + vec3(1.1, 1.16, 1.23) * wisps * (1.0 - bodyAlpha)) / max(alpha, 0.001);
          float horizon = smoothstep(0.005, 0.18, d.y);
          color = mix(haze, color, smoothstep(0.02, 0.35, d.y));
          gl_FragColor = vec4(color, alpha * horizon);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }),
  );
  clouds.name = 'Sunlit coastal clouds';
  clouds.visible = quality.clouds;
  scene.add(clouds);
  let previousTime = null;
  return {
    sky,
    clouds,
    setQuality(next) {
      clouds.visible = next.clouds;
    },
    update(state, time, view) {
      const position = view?.position || state;
      // Keep the distant sky around the viewer even on long offshore passages.
      sky.position.set(position.x, position.y || 0, position.z);
      clouds.position.copy(sky.position);
      const drift = clouds.material.uniforms.drift.value;
      if (previousTime !== null && time >= previousTime) {
        const angle = ((state.windDirection + 180) * Math.PI) / 180;
        const distance = (time - previousTime) * state.windSpeed * 0.000015;
        drift.x += Math.sin(angle) * distance;
        drift.y -= Math.cos(angle) * distance;
      } else drift.set(0, 0);
      previousTime = time;
    },
  };
}
