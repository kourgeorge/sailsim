import * as THREE from 'three';

// Approximate the sky in one surface draw, retaining just two normal-texture
// samples. No reflection camera, render target, or scene texture is needed.
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
        skyColor: { value: new THREE.Color('#6da8d5') },
        horizonColor: { value: new THREE.Color('#b7c7ce') },
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
        uniform vec3 skyColor;
        uniform vec3 horizonColor;
        uniform float time;
        uniform float size;
        uniform float distortionScale;
        varying vec4 worldPosition;
        #include <common>
        #include <fog_pars_fragment>
        void main() {
          vec2 uv = worldPosition.xz * size;
          vec3 toEye = cameraPosition - worldPosition.xyz;
          float viewDistance = length(toEye);
          vec3 viewDirection = toEye / max(viewDistance, 0.001);

          // Slow, broad undulations and quicker, crossed ripples share the
          // existing seamless normal map. Fade fine detail before it aliases.
          vec3 broad = texture2D(normalSampler, uv / 191.0 + vec2(time / 67.0, time / 91.0)).xyz * 2.0 - 1.0;
          vec3 fine = texture2D(normalSampler, vec2(-uv.y, uv.x) / 31.0 + vec2(time / 23.0, -time / 31.0)).xyz * 2.0 - 1.0;
          float rippleFade = 1.0 - smoothstep(35.0, 240.0, viewDistance);
          float broadFade = mix(1.0, 0.35, smoothstep(120.0, 900.0, viewDistance));
          vec2 slope = broad.xy * (0.55 * broadFade)
                     + vec2(fine.y, -fine.x) * (0.32 * rippleFade);
          slope *= distortionScale * 0.6;
          vec3 normal = normalize(vec3(slope.x, 1.0, slope.y));
          float diffuse = max(dot(normal, sunDirection), 0.0);
          float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);

          // Water reflects little straight down and much more at grazing
          // angles. A sky gradient supplies that cue without another pass.
          vec3 reflectedView = reflect(-viewDirection, normal);
          float skyHeight = smoothstep(0.0, 0.65, max(reflectedView.y, 0.0));
          vec3 sky = mix(horizonColor, skyColor, skyHeight);
          float sunAlignment = clamp(dot(reflectedView, sunDirection), 0.0, 1.0);
          sky += sunColor * pow(sunAlignment, 8.0) * 0.08;
          float fresnel = 0.022 + 0.978 * pow(1.0 - facing, 5.0);
          vec3 body = waterColor * (0.65 + diffuse * 0.35 + facing * 0.12);
          vec3 color = mix(body, sky, fresnel * 0.7);

          // A soft sun reflection underneath finer glints gives the ripples
          // shape. Broaden distant glints to keep the horizon stable in motion.
          float sunlight = pow(sunAlignment, 28.0) * 0.12
                         + pow(sunAlignment, mix(48.0, 160.0, rippleFade)) * 0.85;
          color += sunColor * sunlight;
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    }),
  );
}
