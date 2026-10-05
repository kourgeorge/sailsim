import { Water } from 'three/addons/objects/Water.js';

export function createDesktopWater(geometry, options) {
  // Keep Three.js's reflection camera, target and shadow-aware vertex shader.
  // Four normal samples match its existing texture budget, at distinct scales.
  const water = new Water(geometry, options);
  water.material.name = 'DesktopWater';
  water.material.fragmentShader = /* glsl */ `
    uniform sampler2D mirrorSampler;
    uniform sampler2D normalSampler;
    uniform float alpha;
    uniform float time;
    uniform float size;
    uniform float distortionScale;
    uniform vec3 sunColor;
    uniform vec3 sunDirection;
    uniform vec3 waterColor;

    varying vec4 mirrorCoord;
    varying vec4 worldPosition;

    #include <common>
    #include <packing>
    #include <bsdfs>
    #include <fog_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>

    void main() {
      #include <logdepthbuf_fragment>
      vec3 toEye = cameraPosition - worldPosition.xyz;
      float viewDistance = length(toEye);
      vec3 viewDirection = toEye / max(viewDistance, 0.001);
      vec2 uv = worldPosition.xz * size;

      // Crossed broad waves break up long parallel bands. Finer ripples travel
      // independently and soften with distance, leaving a steady horizon.
      vec3 broad = texture2D(normalSampler, uv / 243.0 + vec2(time / 83.0, time / 109.0)).xyz * 2.0 - 1.0;
      vec3 crossWave = texture2D(normalSampler, vec2(uv.y, -uv.x) / 127.0 + vec2(time / 59.0, -time / 73.0)).xyz * 2.0 - 1.0;
      vec3 fine = texture2D(normalSampler, uv / 37.0 + vec2(-time / 29.0, time / 41.0)).xyz * 2.0 - 1.0;
      vec3 detail = texture2D(normalSampler, vec2(-uv.y, uv.x) / 16.9 + vec2(time / 31.0, time / 23.0)).xyz * 2.0 - 1.0;
      float rippleFade = 1.0 - smoothstep(40.0, 260.0, viewDistance);
      float detailFade = 1.0 - smoothstep(12.0, 85.0, viewDistance);
      float broadFade = mix(1.0, 0.35, smoothstep(160.0, 1000.0, viewDistance));
      vec2 slope = (broad.xy * 0.5 + vec2(-crossWave.y, crossWave.x) * 0.33) * broadFade
                 + fine.xy * (0.2 * rippleFade)
                 + vec2(detail.y, -detail.x) * (0.12 * detailFade);
      slope *= distortionScale * 0.7;
      vec3 normal = normalize(vec3(slope.x, 1.0, slope.y));

      // Distort the existing live reflection gently enough that coastlines and
      // the boat remain recognizable. No extra scene capture is introduced.
      vec2 distortion = normal.xz * (0.001 + 0.25 / max(viewDistance, 1.0)) * distortionScale;
      vec2 mirrorUV = clamp(mirrorCoord.xy / mirrorCoord.w + distortion, vec2(0.002), vec2(0.998));
      vec3 reflectedScene = texture2D(mirrorSampler, mirrorUV).rgb;
      float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
      float fresnel = 0.022 + 0.978 * pow(1.0 - facing, 5.0);
      float diffuse = max(dot(normal, sunDirection), 0.0);
      float shadow = getShadowMask();
      vec3 body = waterColor * (0.62 + diffuse * 0.4 + facing * 0.12);
      vec3 color = mix(body * shadow, reflectedScene, fresnel * 0.78);

      // Direct sunlight stays distinct from the reflected scene: a soft lobe
      // supports the finer glints instead of washing every reflection white.
      vec3 reflectedView = reflect(-viewDirection, normal);
      float sunAlignment = clamp(dot(reflectedView, sunDirection), 0.0, 1.0);
      float sunlight = pow(sunAlignment, 28.0) * 0.1
                     + pow(sunAlignment, mix(48.0, 192.0, rippleFade)) * 0.75;
      color += sunColor * sunlight * shadow;

      gl_FragColor = vec4(color, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }
  `;
  return water;
}
