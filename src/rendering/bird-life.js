import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  BIRD_SPECIES,
  MAX_VISIBLE_BIRDS,
  birdLimit,
  createBirdEncounters,
  sampleBirdFlight,
} from '../world/bird-encounters.js';

function colored(geometry, color) {
  const result = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  geometry.dispose();
  result.deleteAttribute('uv');
  const tint = new THREE.Color(color),
    colors = new Float32Array(result.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) colors.set([tint.r, tint.g, tint.b], i);
  result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return result;
}
function birdBody(species) {
  const parts = [];
  const oval = (color, x, y, z, sx, sy, sz, detail = 0) => {
    const geometry = new THREE.IcosahedronGeometry(1, detail);
    geometry.scale(sx, sy, sz);
    geometry.translate(x, y, z);
    parts.push(colored(geometry, color));
  };
  const length = species.body,
    longNeck = species.id === 'cormorant';
  oval(species.back, 0, 0, 0, length * 0.16, length * 0.17, length * 0.46, 1);
  oval(species.belly, 0, -length * 0.035, 0, length * 0.145, length * 0.15, length * 0.42);
  if (longNeck) oval(species.back, 0, 0.03, -length * 0.42, 0.05, 0.06, length * 0.25);
  const headZ = -length * (longNeck ? 0.68 : 0.43);
  oval(species.head, 0, length * 0.08, headZ, length * 0.11, length * 0.12, length * 0.14, 1);
  for (const side of [-1, 1]) {
    oval(
      '#d9b96c',
      side * length * 0.103,
      length * 0.11,
      headZ - length * 0.025,
      length * 0.026,
      length * 0.032,
      length * 0.03,
      1,
    );
    oval(
      '#14272b',
      side * length * 0.122,
      length * 0.113,
      headZ - length * 0.031,
      length * 0.014,
      length * 0.022,
      length * 0.019,
      1,
    );
    oval(
      '#ffffff',
      side * length * 0.134,
      length * 0.123,
      headZ - length * 0.037,
      length * 0.006,
      length * 0.008,
      length * 0.007,
    );
    oval(
      species.beak,
      side * length * 0.08,
      -length * 0.22,
      length * 0.1,
      length * 0.022,
      length * 0.07,
      length * 0.025,
    );
    oval(
      species.beak,
      side * length * 0.08,
      -length * 0.28,
      length * 0.075,
      length * 0.047,
      length * 0.016,
      length * 0.07,
    );
  }
  const beak = new THREE.ConeGeometry(length * 0.045, length * 0.21, 5);
  beak.rotateX(-Math.PI / 2);
  beak.translate(0, length * 0.04, headZ - length * 0.21);
  parts.push(colored(beak, species.beak));
  const fork = species.id === 'tern';
  const tail = new THREE.BufferGeometry();
  const l = length;
  tail.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      fork
        ? [
            0,
            0,
            l * 0.22,
            -l * 0.22,
            0,
            l * 0.83,
            0,
            0,
            l * 0.52,
            0,
            0,
            l * 0.22,
            0,
            0,
            l * 0.52,
            l * 0.22,
            0,
            l * 0.83,
          ]
        : [
            -l * 0.09,
            0,
            l * 0.22,
            -l * 0.19,
            0,
            l * 0.66,
            l * 0.19,
            0,
            l * 0.66,
            -l * 0.09,
            0,
            l * 0.22,
            l * 0.19,
            0,
            l * 0.66,
            l * 0.09,
            0,
            l * 0.22,
          ],
      3,
    ),
  );
  tail.computeVertexNormals();
  parts.push(colored(tail, species.id === 'eagle' ? '#c5be9e' : species.back));
  const body = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  return body;
}

function birdWing(species, side) {
  const outlines = {
    eagle: [
      [0.06, -0.14],
      [0.4, -0.25],
      [0.88, -0.24],
      [1.1, -0.18],
      [1.08, -0.1],
      [0.91, -0.09],
      [1.1, 0.01],
      [1.06, 0.09],
      [0.87, 0.04],
      [1.01, 0.18],
      [0.93, 0.24],
      [0.76, 0.15],
      [0.86, 0.32],
      [0.73, 0.34],
      [0.48, 0.18],
      [0.06, 0.15],
    ],
    gull: [
      [0.04, -0.14],
      [0.43, -0.23],
      [0.73, -0.15],
      [1.1, 0.22],
      [0.79, 0.16],
      [0.46, 0.12],
      [0.06, 0.14],
    ],
    cormorant: [
      [0.04, -0.13],
      [0.48, -0.2],
      [0.91, -0.13],
      [1.1, -0.04],
      [1.08, 0.06],
      [0.9, 0.11],
      [0.5, 0.17],
      [0.04, 0.13],
    ],
    tern: [
      [0.04, -0.11],
      [0.43, -0.17],
      [1.1, 0.32],
      [0.58, 0.15],
      [0.32, 0.1],
      [0.04, 0.1],
    ],
  };
  const points = outlines[species.id],
    triangles = THREE.ShapeUtils.triangulateShape(
      points.map(([x, z]) => new THREE.Vector2(x, z)),
      [],
    );
  const positions = [],
    colors = [],
    back = new THREE.Color(species.back),
    tip = new THREE.Color(species.tip);
  for (const triangle of triangles)
    for (const index of triangle) {
      const [x, z] = points[index];
      positions.push((side * x * species.span) / 2.2, -0.018 * x, (z * species.span) / 2.2);
      const tint = back.clone().lerp(tip, THREE.MathUtils.smoothstep(x, 0.72, 1.03));
      colors.push(tint.r, tint.g, tint.b);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function createBirdLife(scene, locationId, quality, options) {
  const group = new THREE.Group();
  group.name = 'Coastal birds';
  scene.add(group);
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const pools = BIRD_SPECIES.map((species) => {
    const meshes = [birdBody(species), birdWing(species, -1), birdWing(species, 1)].map(
      (geometry, index) => {
        const mesh = new THREE.InstancedMesh(geometry, material, MAX_VISIBLE_BIRDS);
        mesh.name = `${species.name} ${['bodies', 'left wings', 'right wings'][index]}`;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        mesh.count = 0;
        mesh.visible = false;
        group.add(mesh);
        return mesh;
      },
    );
    return { species, meshes };
  });
  const encounters = createBirdEncounters(locationId, options),
    pose = {},
    transform = new THREE.Object3D();
  const wingRotation = new THREE.Matrix4(),
    wingFold = new THREE.Matrix4(),
    wingMatrix = new THREE.Matrix4();
  let budget = quality;
  return {
    group,
    encounters,
    setQuality(next) {
      budget = next;
    },
    update(state, time, view) {
      const slots = encounters.update(state, time, view),
        limit = birdLimit(budget);
      for (const { meshes } of pools) for (const mesh of meshes) mesh.count = 0;
      let total = 0;
      for (const { event } of slots) {
        if (!event) continue;
        const { species, meshes } = pools.find((pool) => pool.species.id === event.species),
          age = time - event.start;
        for (let i = 0; i < event.count && total < limit; i++) {
          sampleBirdFlight(event, i, time, pose);
          if (Math.hypot(pose.x - state.x, pose.z - state.z) > 420) continue;
          const phase = age * species.flapRate * Math.PI * 2 + i * 1.73 + event.seed;
          const gliding =
            event.formation === 'soaring' || (species.id === 'eagle' && (age + i) % 9 > 2);
          const amplitude = gliding
            ? 0.055
            : event.formation === 'pair'
              ? 0.25
              : species.id === 'cormorant'
                ? 0.58
                : 0.4;
          const flap =
            (Math.sin(phase) * amplitude + 0.06) * (1 - pose.perched) + pose.perched * 0.03;
          transform.position.set(pose.x, pose.y, pose.z);
          transform.rotation.set(Math.sin(phase) * 0.025, -pose.heading, pose.bank, 'YXZ');
          transform.scale.setScalar(1 - (i % 4) * 0.035);
          transform.updateMatrix();
          const instance = meshes[0].count;
          meshes[0].setMatrixAt(instance, transform.matrix);
          for (const [index, side] of [
            [1, -1],
            [2, 1],
          ]) {
            wingRotation.makeRotationZ(side * flap);
            if (pose.perched) {
              wingFold.makeRotationY(-side * pose.perched * 1.2);
              wingRotation.multiply(wingFold);
              wingRotation.elements[0] *= 1 - pose.perched * 0.5;
              wingRotation.elements[1] *= 1 - pose.perched * 0.5;
              wingRotation.elements[2] *= 1 - pose.perched * 0.5;
            }
            wingMatrix.multiplyMatrices(transform.matrix, wingRotation);
            meshes[index].setMatrixAt(instance, wingMatrix);
          }
          for (const mesh of meshes) mesh.count++;
          total++;
        }
      }
      for (const { meshes } of pools)
        for (const mesh of meshes) {
          mesh.visible = mesh.count > 0;
          mesh.instanceMatrix.needsUpdate = true;
        }
    },
  };
}
