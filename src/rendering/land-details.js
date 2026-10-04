import * as THREE from 'three';
import { islandHeight, shoreScale } from './geography.js';
import { seededRandom } from './materials.js';
import { sceneryBuilder } from './scenery-geometry.js';
import { getCoastalFeatures, clearOfCoastalBuildings } from '../world/coastal-features.js';

export function createLandDetails(scene, location) {
  const random = seededRandom(3817),
    builder = sceneryBuilder();
  const colors = ['#ffe29a', '#ebe7ff', '#d499d0', '#fbfcdf'];
  for (let i = 0; i < 5; i++) {
    const x = (random() - 0.5) * 2.8,
      z = (random() - 0.5) * 2.8,
      y = 0.23 + random() * 0.35;
    builder.box('#50774b', x, y / 2, z, 0.023, y, 0.023);
    for (const side of [-1, 1]) {
      const leaf = new THREE.CircleGeometry(0.085, 4);
      leaf.scale(1, 0.45, 1);
      leaf.rotateX(-Math.PI / 3);
      leaf.translate(x + side * 0.06, y * 0.4, z);
      builder.add(leaf, '#709257');
    }
    builder.oval('#e2ad47', x, y, z, 0.063, 0.035, 0.063, 0);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      const geo = new THREE.CircleGeometry(0.072, 5);
      geo.rotateX(-Math.PI / 2);
      geo.translate(x + Math.cos(a) * 0.075, y, z + Math.sin(a) * 0.075);
      builder.add(geo, colors[i % 4]);
    }
  }
  const sites = [],
    features = getCoastalFeatures(location.id);
  for (const island of location.islands)
    for (let i = 0; i < 48; i++) {
      const angle = random() * Math.PI * 2,
        r = 0.65 + random() * 0.32;
      const x = island.x + Math.cos(angle) * island.rx * r * shoreScale(angle);
      const z = island.z + Math.sin(angle) * island.rz * r * shoreScale(angle);
      const y = islandHeight(x, z, island);
      const slope =
        Math.hypot(islandHeight(x + 2, z, island) - y, islandHeight(x, z + 2, island) - y) / 2;
      if (y > 3.8 && y < 55 && slope < 0.25 && clearOfCoastalBuildings(x, z, features))
        sites.push({
          x,
          y,
          z,
          dx: islandHeight(x + 1, z, island) - y,
          dz: islandHeight(x, z + 1, island) - y,
        });
    }
  const flowers = new THREE.InstancedMesh(
    builder.finish(),
    new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }),
    sites.length,
  );
  flowers.name = 'Coastal wildflowers';
  const transform = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0),
    normal = new THREE.Vector3();
  sites.forEach((site, i) => {
    transform.position.set(site.x, site.y, site.z);
    normal.set(-site.dx, 1, -site.dz).normalize();
    transform.quaternion.setFromUnitVectors(up, normal);
    transform.rotateY(random() * Math.PI * 2);
    transform.scale.setScalar(0.8 + random() * 0.65);
    transform.updateMatrix();
    flowers.setMatrixAt(i, transform.matrix);
  });
  scene.add(flowers);

  const positions = [],
    uvs = [],
    indices = [];
  for (const fall of location.waterfalls || []) {
    const island = location.islands[fall.islandIndex],
      base = positions.length / 3;
    for (let i = 0; i <= 64; i++) {
      const r = 0.42 + (i / 64) * 0.582,
        angle = fall.angle + Math.sin(i * 0.11) * 0.004;
      const x = island.x + Math.cos(angle) * island.rx * r * shoreScale(angle);
      const z = island.z + Math.sin(angle) * island.rz * r * shoreScale(angle);
      const width = 2.4 + Math.sin(i * 0.17) * 0.6 + (i / 64) * 2;
      for (const side of [-1, 1]) {
        const px = x - Math.sin(angle) * side * width,
          pz = z + Math.cos(angle) * side * width;
        positions.push(px, Math.max(0.06, islandHeight(px, pz, island) + 0.65), pz);
        uvs.push((side + 1) / 2, i / 64);
      }
      if (i < 64) {
        const k = base + i * 2;
        indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
  }
  let falls = null;
  if (positions.length) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
      uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), time: { value: 0 } },
      vertexShader: `varying vec2 flow;
      #include <common>
      #include <fog_pars_vertex>
      void main(){flow=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
      #include <fog_vertex>
      }`,
      fragmentShader: `uniform float time;varying vec2 flow;
      #include <common>
      #include <fog_pars_fragment>
      void main(){float strands=.72+.28*sin(flow.x*21.+sin(flow.y*43.-time*.4)*1.2);float foam=.7+.3*sin(flow.y*260.-time*5.);
      float edge=smoothstep(0.,.15,flow.x)*(1.-smoothstep(.85,1.,flow.x))*smoothstep(0.,.035,flow.y)*(1.-smoothstep(.975,1.,flow.y));
      gl_FragColor=vec4(mix(vec3(.52,.78,.81),vec3(.95,.99,1.),foam),edge*strands*.86);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
      }`,
    });
    falls = new THREE.Mesh(geometry, material);
    falls.name = 'Fjord waterfalls';
    scene.add(falls);
  }
  return {
    flowers,
    falls,
    update(time) {
      if (falls) falls.material.uniforms.time.value = time;
    },
    setQuality(quality) {
      flowers.count = ['minimum', 'compatibility'].includes(quality.name)
        ? Math.ceil(sites.length * 0.45)
        : sites.length;
    },
  };
}
