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
  sky.scale.setScalar(location.coordinates ? 60000 : 4500);
  const u = sky.material.uniforms;
  u.turbidity.value = location.character?.turbidity??(fjord ? 2 : 1.8);
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
        coverage: { value: location.character?.cloudCoverage??(fjord ? 0.46 : 0.5) },
        haze: { value: new THREE.Color(location.character?.haze??(fjord ? '#bacfdf' : '#c7dce8')) },
        // Raw shader colours: the time of day and weather retint the clouds.
        litColor: { value: new THREE.Vector3(1.2, 1.22, 1.25) },
        sunLitColor: { value: new THREE.Vector3(1.42, 1.29, 1.06) },
        shadeColor: { value: new THREE.Vector3(0.36, 0.46, 0.59) },
        rimColor: { value: new THREE.Vector3(1.0, 0.86, 0.61) },
        flash: { value: 0 },
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
        uniform vec3 litColor;
        uniform vec3 sunLitColor;
        uniform vec3 shadeColor;
        uniform vec3 rimColor;
        uniform float flash;
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
          vec3 lit = mix(litColor, sunLitColor, facingSun);
          vec3 color = mix(shadeColor, lit, lighting);
          float rim = max(relief, 0.0) * (1.0 - density) * facingSun;
          color += rimColor * rim * 1.4;

          // A faint, higher layer of wind-stretched cirrus uses one texture tap.
          vec3 high = texture2D(cloudNoise, p * vec2(0.65, 3.6) + vec2(0.37, 0.12) - drift * 0.4).rgb;
          float wisps = smoothstep(0.57, 0.83, high.g + high.b * 0.08);
          wisps *= smoothstep(0.15, 0.5, d.y) * 0.22;
          float bodyAlpha = density * 0.94;
          float alpha = bodyAlpha + wisps * (1.0 - bodyAlpha);
          color = (color * bodyAlpha + litColor * 0.93 * wisps * (1.0 - bodyAlpha)) / max(alpha, 0.001);
          color += vec3(0.75, 0.8, 0.95) * flash;
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
  if (location.coordinates) clouds.scale.setScalar(14);
  clouds.visible = quality.clouds;
  scene.add(clouds);
  // One plain gradient dome serves the moonlit night sky and grey weather.
  const night = new THREE.Mesh(
    new THREE.SphereGeometry(4300, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        moonDirection: { value: sunDirection.clone() },
        moon: { value: 1 },
        zenith: { value: new THREE.Color('#061025') },
        horizon: { value: new THREE.Color('#2c3d52') },
        flash: { value: 0 },
      },
      vertexShader:
        'varying vec3 ray; void main(){ ray=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying vec3 ray; uniform vec3 moonDirection; uniform float moon; uniform vec3 zenith; uniform vec3 horizon; uniform float flash;
      void main(){
        vec3 d=normalize(ray);
        vec3 color=mix(horizon,zenith,smoothstep(0.0,0.7,d.y));
        float facing=dot(d,moonDirection);
        color+=vec3(0.18,0.23,0.32)*pow(max(facing,0.0),160.0)*moon;
        color+=vec3(1.2,1.3,1.4)*smoothstep(0.99987,0.9999,facing)*moon;
        color+=vec3(0.55,0.6,0.75)*flash;
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    }),
  );
  night.name = 'Moonlit night sky';
  if (location.coordinates) night.scale.setScalar(14);
  night.visible = false;
  scene.add(night);
  const positions = [];
  let seed = 7301;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 650; i++) {
    const a = random() * Math.PI * 2,
      y = 0.08 + 0.9 * random(),
      r = Math.sqrt(1 - y * y);
    positions.push(Math.cos(a) * r * 4100, y * 4100, Math.sin(a) * r * 4100);
  }
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    ),
    new THREE.PointsMaterial({
      color: '#b5cce9',
      size: 1.35,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  stars.name = 'Night stars';
  stars.visible = false;
  scene.add(stars);
  let cloudsWanted = true,
    cloudsEnabled = quality.clouds;
  let previousTime = null;
  return {
    sky,
    clouds,
    dome: night,
    // Shows the backdrop for a sky preset: blue sky, stars, or a grey dome.
    apply(preset) {
      const cu = clouds.material.uniforms,
        du = night.material.uniforms;
      sky.visible = preset.backdrop === 'sky';
      night.visible = preset.backdrop !== 'sky';
      stars.visible = preset.backdrop === 'stars';
      u.sunPosition.value.fromArray(preset.sunDirection).multiplyScalar(4500);
      u.turbidity.value = preset.turbidity;
      u.rayleigh.value = preset.rayleigh;
      u.skyExposure.value = preset.skyExposure;
      du.moonDirection.value.fromArray(preset.moonDirection);
      du.moon.value = preset.dome.moon;
      du.zenith.value.set(preset.dome.zenith);
      du.horizon.value.set(preset.dome.horizon);
      cu.sunDirection.value.fromArray(preset.sunDirection);
      cu.coverage.value = preset.clouds.coverage;
      cu.haze.value.set(preset.clouds.haze);
      cu.litColor.value.fromArray(preset.clouds.lit);
      cu.sunLitColor.value.fromArray(preset.clouds.sunLit);
      cu.shadeColor.value.fromArray(preset.clouds.shade);
      cu.rimColor.value.fromArray(preset.clouds.rim);
      cloudsWanted = preset.clouds.visible;
      clouds.visible = cloudsEnabled && cloudsWanted;
    },
    setFlash(value) {
      clouds.material.uniforms.flash.value = value * 0.6;
      night.material.uniforms.flash.value = value * 0.35;
    },
    setQuality(next) {
      cloudsEnabled = next.clouds;
      clouds.visible = cloudsEnabled && cloudsWanted;
    },
    update(state, time, view) {
      const position = view?.position || state;
      // Keep the distant sky around the viewer even on long offshore passages.
      sky.position.set(position.x, position.y || 0, position.z);
      clouds.position.copy(sky.position);
      night.position.copy(sky.position);
      stars.position.copy(sky.position);
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
