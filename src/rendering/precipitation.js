import * as THREE from 'three';

// Rain streaks fill a box around the viewer. Each drop wraps inside the box
// on the GPU, so no per-drop work runs on the CPU while it falls.
export function createPrecipitation(scene, { count = 2400, size = 70, height = 34 } = {}) {
  const positions = new Float32Array(count * 6),
    tips = new Float32Array(count * 2);
  let seed = 4127;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const x = random() * size,
      y = random() * height,
      z = random() * size;
    positions.set([x, y, z, x, y, z], i * 6);
    tips.set([0, 1], i * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('tip', new THREE.BufferAttribute(tips, 1));
  // The box follows the camera; never let it be culled by its origin bounds.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      center: { value: new THREE.Vector3() },
      fall: { value: new THREE.Vector3(0, -11, 0) },
      time: { value: 0 },
      box: { value: new THREE.Vector3(size, height, size) },
      opacity: { value: 0 },
      color: { value: new THREE.Color('#c4d0da') },
    },
    vertexShader: `
      attribute float tip;
      uniform vec3 center;
      uniform vec3 fall;
      uniform float time;
      uniform vec3 box;
      varying float fade;
      void main() {
        vec3 start = center - box * 0.5;
        vec3 p = start + mod(position + fall * time - start, box);
        p -= normalize(fall) * tip * 0.9;
        fade = 1.0 - tip * 0.7;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float opacity;
      varying float fade;
      void main() {
        gl_FragColor = vec4(color, opacity * fade);
        #include <colorspace_fragment>
      }
    `,
  });
  const rain = new THREE.LineSegments(geometry, material);
  rain.name = 'Rain';
  rain.frustumCulled = false;
  rain.visible = false;
  scene.add(rain);
  return {
    mesh: rain,
    set(intensity, night) {
      rain.visible = intensity > 0;
      material.uniforms.opacity.value = intensity * (night ? 0.22 : 0.42);
      geometry.setDrawRange(0, Math.round(count * Math.min(1, intensity)) * 2);
    },
    update(state, time, view) {
      if (!rain.visible) return;
      const position = view?.position || state;
      material.uniforms.center.value.set(position.x, position.y || 0, position.z);
      material.uniforms.time.value = time;
      // Rain slants downwind: wind names its source, so drops move away from it.
      const angle = ((state.windDirection + 180) * Math.PI) / 180,
        drift = Math.min(6, state.windSpeed * 0.22);
      material.uniforms.fall.value.set(Math.sin(angle) * drift, -11, -Math.cos(angle) * drift);
    },
  };
}
