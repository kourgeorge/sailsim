import * as THREE from 'three';
import { sceneryBuilder } from './scenery-geometry.js';
import {
  LAND_SPECIES,
  MAX_LAND_ANIMALS,
  landAnimalLimit,
  createLandEncounters,
  sampleLandAnimal,
} from '../world/land-encounters.js';

const SHAPES = {
  deer: {
    coat: '#947048',
    belly: '#cab28a',
    leg: '#634a35',
    length: 1.55,
    width: 0.44,
    body: 1.12,
    depth: 0.31,
    hip: 0.94,
    head: 0.53,
  },
  goat: {
    coat: '#b8ad91',
    belly: '#d5cbb2',
    leg: '#766d5b',
    length: 1.15,
    width: 0.46,
    body: 0.76,
    depth: 0.28,
    hip: 0.64,
    head: 0.32,
  },
  fox: {
    coat: '#b66530',
    belly: '#e0cfab',
    leg: '#483d34',
    length: 0.85,
    width: 0.26,
    body: 0.45,
    depth: 0.17,
    hip: 0.36,
    head: 0.12,
  },
  rabbit: {
    coat: '#9b8871',
    belly: '#d7c8ac',
    leg: '#8c7861',
    length: 0.46,
    width: 0.24,
    body: 0.25,
    depth: 0.16,
    hip: 0.14,
    head: 0.08,
  },
  boar: {
    coat: '#605246',
    belly: '#796955',
    leg: '#483f35',
    length: 1.42,
    width: 0.58,
    body: 0.68,
    depth: 0.37,
    hip: 0.43,
    head: 0.04,
  },
};

function branch(builder, color, from, to, radius, tip = radius * 0.65) {
  const a = new THREE.Vector3(...from),
    b = new THREE.Vector3(...to),
    direction = b.clone().sub(a);
  const geometry = new THREE.CylinderGeometry(tip, radius, direction.length(), 5);
  geometry.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
  );
  geometry.translate(...a.add(b).multiplyScalar(0.5).toArray());
  builder.add(geometry, color);
}

function animalGeometry(species) {
  const s = SHAPES[species.id],
    body = sceneryBuilder(),
    head = sceneryBuilder(),
    leg = sceneryBuilder();
  const rabbit = species.id === 'rabbit',
    fox = species.id === 'fox',
    boar = species.id === 'boar';
  body.oval(s.coat, 0, s.body, 0, s.width * 0.6, s.depth, s.length * 0.5, 1);
  body.oval(
    s.belly,
    0,
    s.body - s.depth * 0.48,
    0.01,
    s.width * 0.49,
    s.depth * 0.52,
    s.length * 0.4,
    0,
  );
  if (boar) {
    body.oval('#51473c', 0, s.body + 0.18, -0.12, 0.2, 0.24, 0.55, 0);
    for (let i = 0; i < 7; i++)
      body.box('#403a32', 0, s.body + 0.35, -0.42 + i * 0.11, 0.065, 0.12, 0.09);
  }
  if (fox) {
    branch(body, s.coat, [0, s.body + 0.04, s.length * 0.35], [0.12, 0.19, 0.91], 0.13, 0.09);
    branch(body, '#e1d8be', [0.12, 0.19, 0.87], [0.15, 0.15, 1.05], 0.095, 0.025);
  } else if (rabbit) body.oval('#e3d5b8', 0, 0.28, 0.26, 0.085, 0.085, 0.08, 0);
  else
    branch(
      body,
      species.id === 'deer' ? '#e3cfaa' : s.coat,
      [0, s.body + 0.05, s.length * 0.45],
      [0, s.body - 0.14, s.length * 0.6],
      0.065,
      0.025,
    );

  // The neck/head pivot lets each animal graze or look up independently.
  const skull = rabbit ? 0.11 : fox ? 0.125 : boar ? 0.22 : 0.18;
  const neck = s.head,
    muzzle = fox ? 0.2 : boar ? 0.3 : rabbit ? 0.09 : 0.2;
  head.oval(
    s.coat,
    0,
    neck * 0.45,
    -0.04,
    skull * 0.73,
    Math.max(0.11, neck * 0.65),
    skull * 0.82,
    1,
  );
  head.oval(s.coat, 0, neck, -0.1, skull * 0.73, skull, skull * 1.05, 1);
  head.oval(
    s.belly,
    0,
    neck - skull * 0.25,
    -0.1 - muzzle * 0.6,
    skull * 0.53,
    skull * 0.54,
    muzzle * 0.85,
    0,
  );
  head.oval(
    boar ? '#a18b77' : '#302b27',
    0,
    neck - skull * 0.24,
    -0.1 - muzzle * 1.35,
    skull * (boar ? 0.63 : 0.27),
    skull * 0.35,
    0.035,
    0,
  );
  for (const side of [-1, 1]) {
    head.oval('#221f1c', side * skull * 0.67, neck + skull * 0.19, -0.16, 0.021, 0.025, 0.026, 0);
    const earHeight = rabbit ? 0.24 : species.id === 'deer' ? 0.17 : 0.12;
    const ear = new THREE.ConeGeometry(rabbit ? 0.035 : 0.065, earHeight, 5);
    ear.scale(1, 1, 0.55);
    ear.rotateZ(-side * (rabbit ? 0.13 : 0.55));
    ear.translate(side * skull * 0.68, neck + skull * 0.76 + earHeight * 0.36, -0.05);
    head.add(ear, s.coat);
    if (species.id === 'deer') {
      const base = [side * 0.095, neck + 0.12, -0.06],
        tip = [side * 0.29, neck + 0.6, 0.07];
      branch(head, '#c3b294', base, tip, 0.021, 0.009);
      for (let i = 0; i < 3; i++)
        branch(
          head,
          '#c3b294',
          [side * (0.13 + i * 0.05), neck + 0.24 + i * 0.12, -0.025 + i * 0.025],
          [side * (0.23 + i * 0.04), neck + 0.4 + i * 0.1, -0.14],
          0.013,
          0.005,
        );
    } else if (species.id === 'goat') {
      branch(
        head,
        '#625a4a',
        [side * 0.1, neck + 0.13, -0.05],
        [side * 0.13, neck + 0.34, 0.08],
        0.037,
        0.015,
      );
      branch(
        head,
        '#625a4a',
        [side * 0.13, neck + 0.34, 0.08],
        [side * 0.14, neck + 0.36, 0.2],
        0.017,
        0.003,
      );
    } else if (boar)
      branch(head, '#cfc8ad', [side * 0.14, -0.05, -0.28], [side * 0.2, 0.1, -0.37], 0.028, 0.004);
  }
  if (species.id === 'goat')
    branch(head, '#8b7e65', [0, neck - 0.14, -0.19], [0, neck - 0.31, -0.16], 0.045, 0.012);

  const thickness = boar ? 0.065 : rabbit ? 0.036 : 0.043;
  branch(leg, s.coat, [0, 0, 0], [0, -s.hip * 0.52, 0.025], thickness * 1.3, thickness);
  branch(
    leg,
    s.leg,
    [0, -s.hip * 0.48, 0.025],
    [0, -s.hip + 0.045, -0.015],
    thickness,
    thickness * 0.6,
  );
  leg.oval(
    rabbit || fox ? s.leg : '#37322c',
    0,
    -s.hip + 0.03,
    -0.04,
    thickness * 1.25,
    0.035,
    thickness * 1.7,
    0,
  );
  return [body.finish(), head.finish(), leg.finish()];
}

export function createLandAnimals(scene, locationId, quality, options) {
  const group = new THREE.Group();
  group.name = 'Coastal land animals';
  scene.add(group);
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  // A short dithered fade avoids popping sightings into existence, with one
  // shared opaque material and no transparent sorting or texture allocations.
  material.onBeforeCompile = (shader) => {
    shader.vertexShader =
      'attribute float sightingFade; varying float animalFade;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nanimalFade = sightingFade;',
    );
    shader.fragmentShader = 'varying float animalFade;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clipping_planes_fragment>',
      '#include <clipping_planes_fragment>\nif (animalFade < 1.0 && fract(52.9829189 * fract(dot(floor(gl_FragCoord.xy), vec2(0.06711056, 0.00583715)))) >= animalFade) discard;',
    );
  };
  material.customProgramCacheKey = () => 'land-animal-fade-v1';
  const pools = LAND_SPECIES.map((species) => {
    const meshes = animalGeometry(species).map((geometry, i) => {
      const capacity = MAX_LAND_ANIMALS * (i === 2 ? 4 : 1);
      geometry.setAttribute(
        'sightingFade',
        new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1).setUsage(
          THREE.DynamicDrawUsage,
        ),
      );
      const mesh = new THREE.InstancedMesh(geometry, material, capacity);
      mesh.name = `${species.name} ${['bodies', 'heads', 'legs'][i]}`;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      mesh.count = 0;
      mesh.visible = false;
      group.add(mesh);
      return mesh;
    });
    return { species, meshes };
  });
  const encounters = createLandEncounters(locationId, options),
    pose = {},
    root = new THREE.Object3D(),
    joint = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  let budget = quality;
  const place = (mesh, transform, fade, tint) => {
    const index = mesh.count++;
    mesh.setMatrixAt(index, transform);
    mesh.geometry.attributes.sightingFade.setX(index, fade);
    mesh.setColorAt(index, tint);
  };
  const tint = new THREE.Color();
  return {
    group,
    encounters,
    setQuality(next) {
      budget = next;
    },
    update(state, time, view) {
      const slots = encounters.update(state, time, view),
        limit = landAnimalLimit(budget);
      for (const { meshes } of pools) for (const mesh of meshes) mesh.count = 0;
      let total = 0;
      for (const { event } of slots) {
        if (!event) continue;
        const { species, meshes } = pools.find((pool) => pool.species.id === event.species),
          s = SHAPES[species.id];
        for (let i = 0; i < event.count && total < limit; i++) {
          sampleLandAnimal(event, i, time, pose);
          if (Math.hypot(pose.x - state.x, pose.z - state.z) > 260 || pose.fade <= 0) continue;
          const sin = Math.sin(pose.heading),
            cos = Math.cos(pose.heading);
          root.position.set(pose.x, pose.y, pose.z);
          const hop =
            species.id === 'rabbit' ? Math.abs(Math.sin(pose.stride)) * pose.walk * 0.075 : 0;
          root.position.y += hop;
          root.rotation.set(
            Math.atan(sin * pose.dx - cos * pose.dz),
            -pose.heading,
            Math.atan(cos * pose.dx + sin * pose.dz),
            'YXZ',
          );
          root.scale.setScalar(pose.scale);
          root.updateMatrix();
          tint.setScalar(0.87 + (i % 3) * 0.055);
          place(meshes[0], root.matrix, pose.fade, tint);
          joint.position.set(0, s.body + s.depth * 0.05, -s.length * 0.4);
          joint.rotation.set(
            -pose.graze * (species.id === 'deer' ? 1.6 : 0.75),
            Math.sin(time * 0.25 + i) * 0.09,
            0,
          );
          joint.updateMatrix();
          matrix.multiplyMatrices(root.matrix, joint.matrix);
          place(meshes[1], matrix, pose.fade, tint);
          for (let leg = 0; leg < 4; leg++) {
            const side = leg % 2 ? 1 : -1,
              front = leg < 2 ? -1 : 1;
            const phase =
              species.id === 'rabbit'
                ? front === 1
                  ? Math.PI
                  : 0
                : leg === 0 || leg === 3
                  ? 0
                  : Math.PI;
            joint.position.set(side * s.width * 0.4, s.hip, front * s.length * 0.29);
            joint.rotation.set(Math.sin(pose.stride + phase) * pose.walk * 0.32, 0, 0);
            joint.updateMatrix();
            matrix.multiplyMatrices(root.matrix, joint.matrix);
            place(meshes[2], matrix, pose.fade, tint);
          }
          total++;
        }
      }
      for (const { meshes } of pools)
        for (const mesh of meshes) {
          mesh.visible = mesh.count > 0;
          if (!mesh.visible) continue;
          mesh.instanceMatrix.needsUpdate = true;
          mesh.instanceColor.needsUpdate = true;
          mesh.geometry.attributes.sightingFade.needsUpdate = true;
        }
    },
  };
}
