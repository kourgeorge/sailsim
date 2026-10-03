import * as THREE from 'three';

// One surface draw: no reflection camera, render target, or scene texture.
export function createMobileWater(geometry, { waterNormals, sunDirection, sunColor, waterColor }) {
  return new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      name: 'MobileWater',
      fog: true,
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        normalSampler: { value: waterNormals },
        sunDirection: { value: sunDirection.clone() },
        sunColor: { value: new THREE.Color(sunColor) },
        waterColor: { value: new THREE.Color(waterColor) },
        time: { value: 0 },
        size: { value: 1 },
        distortionScale: { value: 2.8 },
      },
      vertexShader: /* glsl */ `
        varying vec4 worldPosition;
        #include <common>
        #include <fog_pars_vertex>
        void main() {
          worldPosition = modelMatrix * vec4(position, 1.0);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D normalSampler;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform vec3 waterColor;
        uniform float time;
        uniform float size;
        uniform float distortionScale;
        varying vec4 worldPosition;
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          vec2 uv = worldPosition.xz * size;
          vec3 noise = texture2D(normalSampler, uv / 103.0 + vec2(time / 17.0, time / 29.0)).xyz
                     + texture2D(normalSampler, uv / 107.0 - vec2(time / -19.0, time / 31.0)).xyz - 1.0;
          vec3 normal = normalize(noise.xzy * vec3(distortionScale * 0.5, 1.0, distortionScale * 0.5));
          vec3 viewDirection = normalize(cameraPosition - worldPosition.xyz);
          float diffuse = max(dot(normal, sunDirection), 0.0);
          float facing = max(dot(normal, viewDirection), 0.0);
          float sunlight = pow(max(dot(reflect(-sunDirection, normal), viewDirection), 0.0), 80.0);
          vec3 color = waterColor * (0.7 + diffuse * 0.35 + facing * 0.2) + sunColor * sunlight * 0.6;
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    }),
  );
}
