import * as THREE from 'three';

const KNOT = 0.514444;
const MAX_SAMPLES = 200;
const LIFETIME = 12; // seconds a stretch of wake stays on the water
const KELVIN_SPREAD = 0.354; // tan(19.5°): how fast the wake arms open per metre travelled

const vertexShader = `
attribute float aAge;attribute float aSide;attribute float aStrength;
varying float vAge;varying float vSide;varying float vStrength;varying vec2 vWorld;
void main(){
 vAge=aAge;vSide=aSide;vStrength=aStrength;vWorld=position.xz;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;

// Foam is drawn in world space, so the pattern stays where the boat left it
// and the boat visibly pulls away from its own wake.
const fragmentShader = `
uniform float time;uniform float opacity;
varying float vAge;varying float vSide;varying float vStrength;varying vec2 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 float side=abs(vSide),life=1.-vAge;
 vec2 p=vWorld*.55;
 float churn=fbm(p+vec2(time*.35,-time*.27));
 float lace=fbm(p*2.6-vec2(time*.18,time*.22));
 // Turbulent white water behind the hull that breaks up as it ages.
 float core=(1.-smoothstep(.0,.62,side))*smoothstep(.25+vAge*.55,.85,churn+.25*life);
 // Thin bright arms on the outer edge of the V, lasting longer than the core.
 float arm=smoothstep(.62,.86,side)*(1.-smoothstep(.9,1.,side))*smoothstep(.3,.62,lace);
 float boil=(1.-smoothstep(0.,.06,vAge))*(1.-smoothstep(0.,.8,side))*.6;
 float foam=core*pow(life,1.6)+arm*pow(life,.9)*.8+boil;
 float alpha=foam*vStrength*opacity*smoothstep(0.,.015,vAge);
 if(alpha<.004)discard;
 gl_FragColor=vec4(mix(vec3(.78,.9,.9),vec3(1.),core*life),min(alpha,1.));
}`;

// A trail of foam laid on the water from recorded stern positions: its length,
// width and brightness all come from how fast the boat was actually moving.
export function createBoatWake({ across = 0, sternOffset = 6, halfWidth = 1.6 } = {}) {
  const positions = new Float32Array((MAX_SAMPLES + 1) * 2 * 3);
  const ages = new Float32Array((MAX_SAMPLES + 1) * 2);
  const sides = new Float32Array((MAX_SAMPLES + 1) * 2);
  const strengths = new Float32Array((MAX_SAMPLES + 1) * 2);
  const index = [];
  for (let i = 0; i < MAX_SAMPLES; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aAge', new THREE.BufferAttribute(ages, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aStrength', new THREE.BufferAttribute(strengths, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(index);
  geometry.setDrawRange(0, 0);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { time: { value: 0 }, opacity: { value: 1 } },
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });
  const wake = new THREE.Mesh(geometry, material);
  wake.name = 'Stern wake';
  wake.renderOrder = 1;
  wake.frustumCulled = false;
  wake.userData.across = across;
  const samples = [];
  let lastTime = null;

  function sternPoint(state) {
    const heading = (state.heading * Math.PI) / 180;
    return {
      x: state.x + Math.cos(heading) * across - Math.sin(heading) * sternOffset,
      z: state.z + Math.sin(heading) * across + Math.cos(heading) * sternOffset,
    };
  }

  wake.reset = () => {
    samples.length = 0;
    geometry.setDrawRange(0, 0);
  };

  wake.update = (state, time, night = false) => {
    if (lastTime !== null && time < lastTime) samples.length = 0;
    lastTime = time;
    const stern = sternPoint(state);
    const speed = Math.max(0, state.speedOverGround ?? state.speed ?? 0);
    const strength = state.capsized ? 0 : Math.min(1, Math.max(0, (speed - 0.3) / 6.5));
    const last = samples[samples.length - 1];
    // A jump (restart, new location, teleport) starts a fresh wake.
    if (last && Math.hypot(stern.x - last.x, stern.z - last.z) > 40) samples.length = 0;
    const head = samples[samples.length - 1];
    if (!head || Math.hypot(stern.x - head.x, stern.z - head.z) > 0.7 || time - head.time > 0.25) {
      samples.push({ x: stern.x, z: stern.z, time, strength, speed: speed * KNOT });
      if (samples.length > MAX_SAMPLES) samples.shift();
    }
    while (samples.length && time - samples[0].time > LIFETIME) samples.shift();
    // Newest first: the live stern point, then the recorded trail behind it.
    const points = [{ x: stern.x, z: stern.z, time, strength, speed: speed * KNOT }];
    for (let i = samples.length - 1; i >= 0; i--) points.push(samples[i]);
    let count = 0;
    for (let i = 0; i < points.length && count <= MAX_SAMPLES; i++) {
      const point = points[i],
        prev = points[Math.max(0, i - 1)],
        next = points[Math.min(points.length - 1, i + 1)];
      let dx = prev.x - next.x,
        dz = prev.z - next.z;
      const length = Math.hypot(dx, dz);
      if (length < 1e-4) {
        if (count) continue;
        const heading = (state.heading * Math.PI) / 180;
        dx = Math.sin(heading);
        dz = -Math.cos(heading);
      } else {
        dx /= length;
        dz /= length;
      }
      const seconds = time - point.time,
        age = Math.min(1, seconds / LIFETIME);
      // The wake opens into a V as it ages, faster when the boat was quicker.
      const half = halfWidth * (0.55 + 0.45 * point.strength) + seconds * point.speed * KELVIN_SPREAD;
      const nx = -dz * half,
        nz = dx * half;
      for (const side of [-1, 1]) {
        const v = count * 2 + (side > 0 ? 1 : 0);
        positions[v * 3] = point.x + nx * side;
        positions[v * 3 + 1] = 0.01;
        positions[v * 3 + 2] = point.z + nz * side;
        ages[v] = age;
        sides[v] = side;
        strengths[v] = point.strength;
      }
      count++;
    }
    for (const name of ['position', 'aAge', 'aSide', 'aStrength']) geometry.attributes[name].needsUpdate = true;
    geometry.setDrawRange(0, Math.max(0, count - 1) * 6);
    material.uniforms.time.value = time;
    material.uniforms.opacity.value = night ? 0.22 : 0.85;
    wake.visible = count > 1;
  };

  return wake;
}
